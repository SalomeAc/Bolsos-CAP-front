import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => {
  const ResultReason = {
    RecognizedSpeech: 1,
    SynthesizingAudioCompleted: 2,
    Canceled: 3,
  };

  const CancellationReason = { Error: 1 };

  const createRecognizer = () => ({
    recognizeOnceAsync: vi.fn((success, reject) => {
      if (success) success({ text: "hola mundo" });
      return undefined;
    }),
    startContinuousRecognitionAsync: vi.fn((resolve) => resolve()),
    stopContinuousRecognitionAsync: vi.fn((resolve) => resolve()),
    close: vi.fn(),
    recognizing: null,
    recognized: null,
    canceled: null,
    sessionStopped: null,
  });

  let lastRecognizer = null;

  return {
    ResultReason,
    CancellationReason,
    CancellationDetails: {
      fromResult: () => ({
        reason: CancellationReason.Error,
        errorDetails: "permission denied",
      }),
    },
    SpeechConfig: {
      fromSubscription: vi.fn(() => ({})),
      fromAuthorizationToken: vi.fn(() => ({})),
    },
    AudioConfig: {
      fromDefaultMicrophoneInput: vi.fn(() => ({})),
      fromSpeakerOutput: vi.fn(() => ({
        internalAudio: {
          ended: false,
          pause: vi.fn(),
          addEventListener: vi.fn(),
        },
        onAudioEnd: null,
        onAudioStart: null,
        close: vi.fn(),
        pause: vi.fn(),
      })),
    },
    SpeechRecognizer: vi.fn(() => {
      lastRecognizer = createRecognizer();
      return lastRecognizer;
    }),
    SpeechSynthesizer: vi.fn(() => ({
      speakTextAsync: vi.fn((text, success) =>
        success({
          reason: ResultReason.SynthesizingAudioCompleted,
          audioDuration: 10_000_000,
        }),
      ),
      close: vi.fn(),
    })),
    SpeakerAudioDestination: vi.fn(function SpeakerAudioDestination() {
      this.internalAudio = {
        ended: false,
        pause: vi.fn(),
        addEventListener: vi.fn(),
      };
      this.onAudioEnd = null;
      this.onAudioStart = null;
      this.close = vi.fn();
      this.pause = vi.fn();
    }),
    getLastRecognizer: () => lastRecognizer,
  };
});

vi.mock("microsoft-cognitiveservices-speech-sdk", () => sdk);

import {
  createDictationSession,
  fetchAzureSpeechToken,
  recognizeSpeech,
  stopSpeaking,
  synthesizeSpeech,
} from "./speechService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("speechService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubEnv("VITE_AZURE_KEY", "test-key");
    vi.stubEnv("VITE_AZURE_REGION", "eastus");
    vi.stubEnv("VITE_API_URL", "http://localhost:3000");

    class MockUtterance {
      constructor(text) {
        this.text = text;
        this.onend = null;
        this.onerror = null;
      }
    }

    window.SpeechSynthesisUtterance = MockUtterance;
    window.speechSynthesis = {
      speak: vi.fn((utterance) => {
        utterance.onend?.();
      }),
      cancel: vi.fn(),
    };
  });

  it("recognizeSpeech resuelve texto reconocido", async () => {
    await expect(recognizeSpeech()).resolves.toBe("hola mundo");
  });

  it("synthesizeSpeech rechaza texto vacío", async () => {
    await expect(synthesizeSpeech("   ")).rejects.toThrow(
      "El texto a reproducir no puede estar vacío",
    );
  });

  it("synthesizeSpeech usa Web Speech API si Azure no está configurado", async () => {
    vi.stubEnv("VITE_AZURE_KEY", "");
    vi.stubEnv("VITE_AZURE_REGION", "");

    await expect(synthesizeSpeech("Hola")).resolves.toBe(true);
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("stopSpeaking cancela reproducción pendiente", async () => {
    vi.stubEnv("VITE_AZURE_KEY", "");
    vi.stubEnv("VITE_AZURE_REGION", "");
    window.speechSynthesis.speak = vi.fn();

    const pending = synthesizeSpeech("Hola");
    stopSpeaking();
    await expect(pending).resolves.toBe(false);
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("createDictationSession lanza error sin configuración", () => {
    vi.stubEnv("VITE_AZURE_KEY", "");
    vi.stubEnv("VITE_AZURE_REGION", "");

    expect(() => createDictationSession()).toThrow(
      "Azure Speech no está configurado",
    );
  });

  it("createDictationSession inicia y detiene reconocimiento continuo", async () => {
    const onFinal = vi.fn();
    const session = createDictationSession({
      onFinal,
      region: "eastus",
      authorizationToken: "azure-token",
    });

    await session.start();
    sdk.getLastRecognizer().recognized(null, {
      result: {
        reason: sdk.ResultReason.RecognizedSpeech,
        text: "  texto final  ",
      },
    });
    await session.stop();

    expect(onFinal).toHaveBeenCalledWith("texto final");
  });

  it("createDictationSession mapea errores de permisos", async () => {
    const onError = vi.fn();
    createDictationSession({
      onError,
      region: "eastus",
      authorizationToken: "azure-token",
    });

    sdk.getLastRecognizer().canceled(null, { result: {} });

    expect(onError).toHaveBeenCalledWith(
      "Necesitamos acceso al micrófono. Actívalo en la configuración del navegador.",
    );
  });

  it("fetchAzureSpeechToken obtiene token del backend", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ token: "azure", region: "eastus", expiresIn: 600 }),
    );

    const payload = await fetchAzureSpeechToken("jwt");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/speech/token",
      expect.objectContaining({
        headers: { Authorization: "Bearer jwt" },
      }),
    );
    expect(payload.token).toBe("azure");
  });

  it("fetchAzureSpeechToken propaga error HTTP", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "No autorizado" }, { ok: false, status: 401 }),
    );

    await expect(fetchAzureSpeechToken("jwt")).rejects.toThrow("No autorizado");
  });

  it("recognizeSpeech rechaza cuando no hay texto", async () => {
    sdk.SpeechRecognizer.mockImplementationOnce(() => {
      const recognizer = {
        recognizeOnceAsync: vi.fn((success) => {
          success({ text: "" });
        }),
        close: vi.fn(),
      };
      return recognizer;
    });

    await expect(recognizeSpeech()).rejects.toThrow("No se detectó voz");
  });

  it("synthesizeSpeech completa reproducción con Azure configurado", async () => {
    const promise = synthesizeSpeech("Hola desde Azure");

    const speakerInstance = sdk.SpeakerAudioDestination.mock.results.at(-1)?.value;
    speakerInstance.onAudioStart?.();
    speakerInstance.onAudioEnd?.();

    await expect(promise).resolves.toBe(true);
  });

  it("createDictationSession reporta texto intermedio", () => {
    const onInterim = vi.fn();
    createDictationSession({
      onInterim,
      region: "eastus",
      authorizationToken: "azure-token",
    });

    sdk.getLastRecognizer().recognizing(null, {
      result: { text: "  parcial  " },
    });

    expect(onInterim).toHaveBeenCalledWith("parcial");
  });

  it("createDictationSession traduce errores de red", () => {
    const onError = vi.fn();
    createDictationSession({
      onError,
      region: "eastus",
      authorizationToken: "azure-token",
    });

    sdk.CancellationDetails.fromResult = () => ({
      reason: sdk.CancellationReason.Error,
      errorDetails: "network websocket failure",
    });
    sdk.getLastRecognizer().canceled(null, { result: {} });

    expect(onError).toHaveBeenCalledWith(
      "No pudimos conectar con Azure Speech. Revisa tu conexión e inténtalo de nuevo.",
    );
  });

  it("createDictationSession traduce ausencia de micrófono", () => {
    const onError = vi.fn();
    createDictationSession({
      onError,
      region: "eastus",
      authorizationToken: "azure-token",
    });

    sdk.CancellationDetails.fromResult = () => ({
      reason: sdk.CancellationReason.Error,
      errorDetails: "device notfound",
    });
    sdk.getLastRecognizer().canceled(null, { result: {} });

    expect(onError).toHaveBeenCalledWith(
      "No se detectó un micrófono en este dispositivo.",
    );
  });
});

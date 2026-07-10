import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAzureDictation } from "./useAzureDictation.js";

const speechMocks = vi.hoisted(() => ({
  createDictationSession: vi.fn(),
  fetchAzureSpeechToken: vi.fn(),
}));

vi.mock("../services/speechService.js", () => speechMocks);

describe("useAzureDictation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    speechMocks.createDictationSession.mockReturnValue({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    });
    speechMocks.fetchAzureSpeechToken.mockResolvedValue({
      token: "azure-token",
      region: "eastus",
    });
  });

  it("inicia dictado y entrega texto final al callback", async () => {
    const onFinalText = vi.fn();
    let captured;

    speechMocks.createDictationSession.mockImplementation((options) => {
      captured = options;
      return {
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
      };
    });

    const { result } = renderHook(() =>
      useAzureDictation({ onFinalText, language: "es-CO" }),
    );

    await act(async () => {
      await result.current.toggleListening();
    });

    expect(result.current.isListening).toBe(true);
    act(() => captured.onFinal("Texto dictado"));
    expect(onFinalText).toHaveBeenCalledWith("Texto dictado");
    expect(result.current.interimText).toBe("");
  });

  it("detiene dictado al pulsar de nuevo", async () => {
    const stop = vi.fn().mockResolvedValue(undefined);
    speechMocks.createDictationSession.mockReturnValue({
      start: vi.fn().mockResolvedValue(undefined),
      stop,
    });

    const { result } = renderHook(() =>
      useAzureDictation({ onFinalText: vi.fn() }),
    );

    await act(async () => {
      await result.current.toggleListening();
    });
    await act(async () => {
      await result.current.toggleListening();
    });

    expect(stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  it("usa token del backend cuando está habilitado", async () => {
    const { result } = renderHook(() =>
      useAzureDictation({
        onFinalText: vi.fn(),
        useBackendToken: true,
        authToken: "jwt",
      }),
    );

    await act(async () => {
      await result.current.toggleListening();
    });

    expect(speechMocks.fetchAzureSpeechToken).toHaveBeenCalledWith("jwt");
    expect(speechMocks.createDictationSession).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizationToken: "azure-token",
        region: "eastus",
      }),
    );
    expect(result.current.isListening).toBe(true);
  });

  it("muestra error si falta sesión para token backend", async () => {
    const { result } = renderHook(() =>
      useAzureDictation({
        onFinalText: vi.fn(),
        useBackendToken: true,
        authToken: null,
      }),
    );

    await act(async () => {
      await result.current.toggleListening();
    });

    expect(result.current.speechError).toContain("iniciar sesión");
    expect(result.current.isListening).toBe(false);
  });

  it("clearSpeechError limpia el mensaje", async () => {
    speechMocks.createDictationSession.mockImplementation(({ onError }) => ({
      start: vi.fn().mockRejectedValue(new Error("fallo de red")),
      stop: vi.fn().mockResolvedValue(undefined),
      onError,
    }));

    const { result } = renderHook(() =>
      useAzureDictation({ onFinalText: vi.fn() }),
    );

    await act(async () => {
      await result.current.toggleListening();
    });

    await waitFor(() => {
      expect(result.current.speechError).toBe("fallo de red");
    });

    act(() => {
      result.current.clearSpeechError();
    });

    expect(result.current.speechError).toBe("");
  });
});

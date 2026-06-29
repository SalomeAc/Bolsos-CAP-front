import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

let activeSynthesizer = null;
let activeSpeaker = null;
let pendingSpeech = null;
let speechStoppedByUser = false;
let speechSessionId = 0;
let playbackPollId = null;
let playbackTimeoutId = null;

const clearPlaybackWatchers = () => {
  if (playbackPollId) {
    clearInterval(playbackPollId);
    playbackPollId = null;
  }
  if (playbackTimeoutId) {
    clearTimeout(playbackTimeoutId);
    playbackTimeoutId = null;
  }
};

/** Azure devuelve duración en ticks de 100 ns; convertir a ms con margen. */
const estimatePlaybackMs = (audioDurationTicks, text) => {
  if (audioDurationTicks && audioDurationTicks > 0) {
    return Math.ceil(audioDurationTicks / 10000) + 500;
  }
  return Math.min(300000, Math.max(8000, text.length * 100));
};

const finishPendingSpeech = (value) => {
  if (!pendingSpeech) return;
  const { resolve } = pendingSpeech;
  pendingSpeech = null;
  resolve(value);
};

const rejectPendingSpeech = (error) => {
  if (!pendingSpeech) return;
  const { reject } = pendingSpeech;
  pendingSpeech = null;
  reject(error);
};

const cleanupAzurePlayback = () => {
  clearPlaybackWatchers();
  if (activeSpeaker) {
    try {
      activeSpeaker.pause();
      const audio = activeSpeaker.internalAudio;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      activeSpeaker.close();
    } catch {
      // El destino de audio puede estar ya cerrado.
    }
    activeSpeaker = null;
  }

  if (activeSynthesizer) {
    try {
      activeSynthesizer.close();
    } catch {
      // El sintetizador puede estar ya cerrado.
    }
    activeSynthesizer = null;
  }
};

/**
 * Reconocer voz (STT - Speech to Text)
 */
export const recognizeSpeech = () =>
  new Promise((resolve, reject) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_KEY,
      import.meta.env.VITE_AZURE_REGION,
    );

    speechConfig.speechRecognitionLanguage = "es-CO";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync((result) => {
      recognizer.close();

      if (result.text) {
        resolve(result.text);
      } else {

        reject(new Error("No se detectó voz. Intenta de nuevo."));
      }
    }, (error) => {
      recognizer.close();
      reject(new Error(error));
    });
  });

/**
 * Reproducir texto en voz (TTS - Text to Speech)
 */
export const synthesizeSpeech = (text) =>
  new Promise((resolve, reject) => {
    if (pendingSpeech) {
      finishPendingSpeech(false);
    }

    speechStoppedByUser = false;
    cleanupAzurePlayback();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (!text || text.trim().length === 0) {
      reject(new Error("El texto a reproducir no puede estar vacío"));
      return;
    }

    const sessionId = ++speechSessionId;
    pendingSpeech = { resolve, reject };

    if (!import.meta.env.VITE_AZURE_KEY || !import.meta.env.VITE_AZURE_REGION) {
      console.warn("Azure Speech SDK no configurado. Usando Web Speech API como alternativa.");
      speakWithWebSpeechAPI(text);
      return;
    }

    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        import.meta.env.VITE_AZURE_KEY,
        import.meta.env.VITE_AZURE_REGION,
      );

      speechConfig.speechSynthesisLanguage = "es-ES";
      speechConfig.speechSynthesisVoiceName = "es-ES-AlvaroNeural";

      const speaker = new SpeechSDK.SpeakerAudioDestination();
      activeSpeaker = speaker;

      let playbackDurationMs = estimatePlaybackMs(0, text);
      let playbackStarted = false;

      const completeAzureSpeech = () => {
        if (sessionId !== speechSessionId) return;
        if (speechStoppedByUser || !pendingSpeech) return;
        clearPlaybackWatchers();
        cleanupAzurePlayback();
        finishPendingSpeech(true);
      };

      const schedulePlaybackComplete = () => {
        if (playbackTimeoutId) {
          clearTimeout(playbackTimeoutId);
          playbackTimeoutId = null;
        }
        playbackTimeoutId = setTimeout(() => {
          playbackTimeoutId = null;
          completeAzureSpeech();
        }, playbackDurationMs);
      };

      const watchPlaybackEnd = () => {
        const audio = speaker.internalAudio;
        if (!audio) return;

        if (audio.ended) {
          completeAzureSpeech();
          return;
        }

        playbackPollId = setInterval(() => {
          if (sessionId !== speechSessionId) {
            clearPlaybackWatchers();
            return;
          }
          if (speechStoppedByUser || !pendingSpeech) {
            clearPlaybackWatchers();
            return;
          }
          if (audio.ended) {
            completeAzureSpeech();
          }
        }, 250);
      };

      const onPlaybackStarted = () => {
        if (playbackStarted) {
          schedulePlaybackComplete();
          return;
        }
        playbackStarted = true;
        watchPlaybackEnd();
        const audio = speaker.internalAudio;
        if (audio) {
          audio.addEventListener("ended", completeAzureSpeech, { once: true });
        }
        schedulePlaybackComplete();
      };

      speaker.onAudioEnd = () => {
        completeAzureSpeech();
      };

      speaker.onAudioStart = () => {
        onPlaybackStarted();
      };

      const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(speaker);
      const synthesizer = new SpeechSDK.SpeechSynthesizer(
        speechConfig,
        audioConfig,
      );

      activeSynthesizer = synthesizer;

      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (!pendingSpeech) return;

          if (
            result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
          ) {
            playbackDurationMs = estimatePlaybackMs(result.audioDuration, text);
            console.log(
              `✓ Audio sintetizado, reproduciendo (~${Math.round(playbackDurationMs / 1000)}s)...`,
            );
            if (speaker.internalAudio) {
              onPlaybackStarted();
            } else {
              schedulePlaybackComplete();
            }
            return;
          }

          if (result.reason === SpeechSDK.ResultReason.Canceled) {
            const cancellation =
              SpeechSDK.CancellationDetails.fromResult(result);

            cleanupAzurePlayback();

            if (
              cancellation.reason === SpeechSDK.CancellationReason.Error &&
              cancellation.errorDetails
            ) {
              console.error(
                "Cancelación de síntesis:",
                cancellation.reason,
                cancellation.errorDetails,
              );
              rejectPendingSpeech(new Error("Error en síntesis de voz"));
              return;
            }

            if (!speechStoppedByUser) {
              finishPendingSpeech(false);
            }
          }
        },
        (error) => {
          cleanupAzurePlayback();
          rejectPendingSpeech(new Error(error));
        },
      );
    } catch (error) {
      console.error("Error en TTS:", error);
      speakWithWebSpeechAPI(text);
    }
  });

/**
 * Fallback usando Web Speech API (funciona en navegadores modernos)
 */
const speakWithWebSpeechAPI = (text) => {
  if (!("speechSynthesis" in window)) {
    rejectPendingSpeech(
      new Error("Speech Synthesis no es soportado en este navegador"),
    );
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "es-ES";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onend = () => {
    finishPendingSpeech(true);
  };

  utterance.onerror = (event) => {
    if (event.error === "interrupted" || event.error === "cancelled") {
      finishPendingSpeech(false);
      return;
    }

    console.error("Error en Web Speech API:", event.error);
    rejectPendingSpeech(new Error(`Error de síntesis: ${event.error}`));
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Detener reproducción de audio
 */
export const stopSpeaking = () => {
  speechSessionId += 1;
  speechStoppedByUser = true;
  finishPendingSpeech(false);
  cleanupAzurePlayback();

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

// --- Dictado continuo (STT en tiempo real) ---

const DEFAULT_SPEECH_LANGUAGE = "es-ES";

function getAzureRegion() {
  return (
    import.meta.env.VITE_AZURE_REGION ||
    ""
  );
}

function getAzureSubscriptionKey() {
  return (
    import.meta.env.VITE_AZURE_KEY ||
    ""
  );
}

function buildSpeechConfig({ authorizationToken, subscriptionKey, region, language }) {
  const speechConfig = authorizationToken
    ? SpeechSDK.SpeechConfig.fromAuthorizationToken(authorizationToken, region)
    : SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);

  speechConfig.speechRecognitionLanguage = language;
  return speechConfig;
}

function mapSpeechError(error) {
  const message = String(error?.message || error || "");
  const lower = message.toLowerCase();

  if (
    lower.includes("notallowed") ||
    lower.includes("permission") ||
    lower.includes("denied")
  ) {
    return "Necesitamos acceso al micrófono. Actívalo en la configuración del navegador.";
  }

  if (lower.includes("notfound") || lower.includes("device")) {
    return "No se detectó un micrófono en este dispositivo.";
  }

  if (
    lower.includes("network") ||
    lower.includes("websocket") ||
    lower.includes("connection")
  ) {
    return "No pudimos conectar con Azure Speech. Revisa tu conexión e inténtalo de nuevo.";
  }

  if (lower.includes("unauthorized") || lower.includes("401")) {
    return "Credenciales de Azure Speech inválidas. Contacta al administrador.";
  }

  return message || "Ocurrió un error durante el dictado por voz.";
}

/**
 * Sesión de dictado continuo.
 * @returns {{ start: () => Promise<void>, stop: () => Promise<void> }}
 */
export function createDictationSession({
  language = DEFAULT_SPEECH_LANGUAGE,
  authorizationToken = null,
  region = getAzureRegion(),
  onInterim = () => {},
  onFinal = () => {},
  onError = () => {},
} = {}) {
  const subscriptionKey = getAzureSubscriptionKey();

  if (!region || (!authorizationToken && !subscriptionKey)) {
    throw new Error(
      "Azure Speech no está configurado. Define las variables de entorno o usa token del backend.",
    );
  }

  let recognizer = null;
  let stopped = false;

  const speechConfig = buildSpeechConfig({
    authorizationToken,
    subscriptionKey,
    region,
    language,
  });

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  recognizer.recognizing = (_sender, event) => {
    const interim = event.result?.text?.trim();
    if (interim) onInterim(interim);
  };

  recognizer.recognized = (_sender, event) => {
    if (event.result.reason !== SpeechSDK.ResultReason.RecognizedSpeech) return;

    const finalText = event.result.text?.trim();
    if (finalText) onFinal(finalText);
  };

  recognizer.canceled = (_sender, event) => {
    if (stopped) return;

    const details = SpeechSDK.CancellationDetails.fromResult(event.result);
    onError(mapSpeechError(details.errorDetails || details.reason));
  };

  recognizer.sessionStopped = () => {
    // El SDK cerró la sesión (silencio prolongado, error, etc.)
  };

  const cleanup = () => {
    stopped = true;
    if (recognizer) {
      recognizer.close();
      recognizer = null;
    }
  };

  return {
    async start() {
      stopped = false;

      await new Promise((resolve, reject) => {
        recognizer.startContinuousRecognitionAsync(resolve, (err) => {
          reject(new Error(mapSpeechError(err)));
        });
      });
    },

    async stop() {
      if (!recognizer) return;

      await new Promise((resolve, reject) => {
        recognizer.stopContinuousRecognitionAsync(resolve, (err) => {
          reject(new Error(mapSpeechError(err)));
        });
      });

      cleanup();
    },
  };
}

/** Obtener token efímero desde tu backend (recomendado en producción) */
export async function fetchAzureSpeechToken(authToken) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const response = await fetch(`${API_BASE_URL}/api/speech/token`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener el token de Azure Speech.");
  }

  return data; // { token, region, expiresIn }
}
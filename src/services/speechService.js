import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

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

    const recognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig,
    );

    recognizer.recognizeOnceAsync((result) => {
      console.log(result);
      console.log("Reason:", result.reason);
      console.log("Text:", result.text);

      if (result.text) {
        resolve(result.text);
      } else {
        reject(new Error("No se reconoció voz"));
      }
    });
  });

/**
 * Reproducir texto en voz (TTS - Text to Speech)
 */
export const synthesizeSpeech = (text) =>
  new Promise((resolve, reject) => {
    if (!text || text.trim().length === 0) {
      reject(new Error("El texto a reproducir no puede estar vacío"));
      return;
    }

    if (!import.meta.env.VITE_AZURE_KEY || !import.meta.env.VITE_AZURE_REGION) {
      console.warn("Azure Speech SDK no configurado. Usando Web Speech API como alternativa.");
      speakWithWebSpeechAPI(text, resolve, reject);
      return;
    }

    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        import.meta.env.VITE_AZURE_KEY,
        import.meta.env.VITE_AZURE_REGION,
      );

      // Usar altavoz del sistema
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();

      // Configurar idioma español
      speechConfig.speechSynthesisLanguage = "es-ES";
      speechConfig.speechSynthesisVoiceName = "es-ES-AlvaroNeural";

      const synthesizer = new SpeechSDK.SpeechSynthesizer(
        speechConfig,
        audioConfig,
      );

      synthesizer.speakTextAsync(text, (result) => {
        if (
          result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          console.log("✓ Audio sintetizado exitosamente");
          resolve(true);
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          const cancellation =
            SpeechSDK.CancellationDetails.fromResult(result);
          console.error(
            "Cancelación de síntesis:",
            cancellation.reason,
            cancellation.errorDetails,
          );
          reject(new Error("Error en síntesis de voz"));
        }
      });
    } catch (error) {
      console.error("Error en TTS:", error);
      // Fallback a Web Speech API
      speakWithWebSpeechAPI(text, resolve, reject);
    }
  });

/**
 * Fallback usando Web Speech API (funciona en navegadores modernos)
 */
const speakWithWebSpeechAPI = (text, resolve, reject) => {
  if (!("speechSynthesis" in window)) {
    reject(new Error("Speech Synthesis no es soportado en este navegador"));
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "es-ES";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onend = () => {
    resolve(true);
  };

  utterance.onerror = (event) => {
    // "interrupted" = el usuario lo detuvo a propósito, no es un error real
    if (event.error === "interrupted" || event.error === "cancelled") {
      resolve(false);
      return;
    }
    console.error("Error en Web Speech API:", event.error);
    reject(new Error(`Error de síntesis: ${event.error}`));
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Detener reproducción de audio
 */
export const stopSpeaking = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

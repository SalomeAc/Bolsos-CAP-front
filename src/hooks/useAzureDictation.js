import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDictationSession,
  fetchAzureSpeechToken,
} from "../services/speechService.js";

export function useAzureDictation({
  onFinalText,
  language = "es-ES",
  authToken = null,
  useBackendToken = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechError, setSpeechError] = useState("");

  const sessionRef = useRef(null);

  const stopListening = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      await sessionRef.current.stop();
    } catch (error) {
      setSpeechError(error.message);
    } finally {
      sessionRef.current = null;
      setIsListening(false);
      setInterimText("");
    }
  }, []);

  const startListening = useCallback(async () => {
    setSpeechError("");
    setInterimText("");

    let authorizationToken = null;
    let region = undefined;

    if (useBackendToken) {
      if (!authToken) {
        setSpeechError("Debes iniciar sesión para usar el dictado por voz.");
        return;
      }

      const tokenPayload = await fetchAzureSpeechToken(authToken);
      authorizationToken = tokenPayload.token;
      region = tokenPayload.region;
    }

    const session = createDictationSession({
      language,
      authorizationToken,
      region,
      onInterim: setInterimText,
      onFinal: (text) => {
        onFinalText(text);
        setInterimText("");
      },
      onError: (message) => {
        setSpeechError(message);
        stopListening();
      },
    });

    sessionRef.current = session;

    try {
      await session.start();
      setIsListening(true);
    } catch (error) {
      sessionRef.current = null;
      setSpeechError(error.message);
    }
  }, [authToken, language, onFinalText, stopListening, useBackendToken]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      sessionRef.current?.stop?.().catch(() => {});
    };
  }, []);

  return {
    isListening,
    interimText,
    speechError,
    toggleListening,
    stopListening,
    clearSpeechError: () => setSpeechError(""),
  };
}
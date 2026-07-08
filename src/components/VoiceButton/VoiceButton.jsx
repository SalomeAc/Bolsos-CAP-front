import { useState } from "react";
import { recognizeSpeech } from "../../services/speechService";
import "./VoiceButton.css";

export default function VoiceButton({ onResult, onStart, onEnd }) {
  const [isListening, setIsListening] = useState(false);

  const handleClick = async () => {
    if (isListening) return;

    setIsListening(true);
    onStart?.();

    try {
      const text = await recognizeSpeech();
      onResult?.(text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsListening(false);
      onEnd?.();
    }
  };

  return (
    <button
      className={`voice-search-button ${isListening ? "is-listening" : ""}`}
      type="button"
      onClick={handleClick}
      aria-busy={isListening}
      aria-live="polite"
      aria-label={isListening ? "Escuchando" : "Activar reconocimiento de voz"}
      title={isListening ? "Escuchando" : "Activar reconocimiento de voz"}
    >
      <span className="iconamoon--microphone-bold" aria-hidden="true"></span>
    </button>
  );
}

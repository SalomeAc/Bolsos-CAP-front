import { useState } from "react";
import { synthesizeSpeech, stopSpeaking } from "../../services/speechService.js";
import "./SpeakButton.css";

/**
 * Botón reutilizable para reproducir texto en voz
 * @param {string} text - Texto a reproducir
 * @param {string} variant - "primary" (grande) o "inline" (pequeño)
 * @param {string} label - Etiqueta del botón (aria-label)
 */
export function SpeakButton({ text, variant = "inline", label = "Escuchar" }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const handleToggleSpeech = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!text || text.trim().length === 0) {
      setError("No hay texto para reproducir");
      return;
    }

    try {
      setError(null);
      setIsSpeaking(true);
      await synthesizeSpeech(text);
      setIsSpeaking(false);
    } catch (err) {
      const msg = err?.message?.toLowerCase() ?? "";
      if (msg.includes("interrupted") || msg.includes("cancelled") || msg.includes("cancel")) {
        setIsSpeaking(false);
        return;
      }
      console.error("Error en TTS:", err);
      setError(err.message);
      setIsSpeaking(false);
    }
  };

  const buttonClass = `speak-button speak-button--${variant} ${
    isSpeaking ? "is-speaking" : ""
  }`;

  return (
    <>
      <button
        className={buttonClass}
        type="button"
        onClick={handleToggleSpeech}
        aria-label={isSpeaking ? "Detener reproducción" : label}
        title={isSpeaking ? "Detener reproducción" : label}
      >
        {variant === "primary" && (
          <>
            <span className="speak-button-icon">
              {isSpeaking ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4v16h4V4H6zm8 0v16h4V4h-4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </span>
            <span className="speak-button-text">
              <span className="speak-button-label">
                {isSpeaking ? "Detener" : "Escuchar"}
              </span>
              <span className="speak-button-sub">
                {isSpeaking ? "reproducción" : "detalles del producto"}
              </span>
            </span>
          </>
        )}

        {variant === "inline" && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            {isSpeaking ? (
              <path d="M6 4v16h4V4H6zm8 0v16h4V4h-4z" />
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            )}
          </svg>
        )}
      </button>

      {error && (
        <div className="speak-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}

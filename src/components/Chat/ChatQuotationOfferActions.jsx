import { useState } from "react";
import { respondQuotation } from "../../services/quotationService";

export function isQuotationOfferMessage(message) {
  if (!message) return false;
  if (message.messageType === "quotation_offer") return true;
  return (
    message.isSystemMessage &&
    /^La cotización de .+ es .+/i.test(String(message.content || ""))
  );
}

export function getLatestQuotationOfferId(messages = []) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (isQuotationOfferMessage(messages[index])) {
      return messages[index]._id;
    }
  }
  return null;
}

export function ChatQuotationOfferActions({
  quotation,
  token,
  onQuotationUpdated,
}) {
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState(null);

  const handleRespond = async (decision) => {
    if (!quotation?._id || !token) return;

    try {
      setResponding(true);
      setError(null);
      const updated = await respondQuotation(quotation._id, decision, token);
      onQuotationUpdated?.(updated);
    } catch (err) {
      setError(err.message || "No se pudo registrar tu respuesta");
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="chat-quotation-actions">
      {error ? (
        <p className="chat-quotation-actions__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="chat-quotation-actions__buttons">
        <button
          type="button"
          className="chat-quotation-actions__btn chat-quotation-actions__btn--accept"
          onClick={() => handleRespond("aceptada")}
          disabled={responding}
        >
          {responding ? "…" : "Aceptar"}
        </button>
        <button
          type="button"
          className="chat-quotation-actions__btn chat-quotation-actions__btn--reject"
          onClick={() => handleRespond("rechazada")}
          disabled={responding}
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}

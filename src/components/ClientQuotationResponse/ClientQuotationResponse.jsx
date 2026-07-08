import { useState } from "react";
import { respondQuotation } from "../../services/quotationService";
import "./ClientQuotationResponse.css";

function formatCurrency(amount, currency = "COP") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClientQuotationResponse({
  quotation,
  token,
  onQuotationUpdated,
  embedded = false,
}) {
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  if (!quotation) return null;

  const canRespond = quotation.status === "cotizada";
  const finalQuote = quotation.finalQuotation;
  const amount = finalQuote?.amount;
  const currency = finalQuote?.currency || "COP";
  const showNotes =
    finalQuote?.notes &&
    !String(finalQuote.notes).toLowerCase().includes("automática");

  if (!canRespond && !quotation.clientResponse?.decision) {
    return null;
  }

  const handleRespond = async (decision) => {
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

  if (!canRespond && quotation.clientResponse?.decision) {
    const label =
      quotation.clientResponse.decision === "aceptada"
        ? "Aceptaste la cotización"
        : quotation.clientResponse.decision === "rechazada"
          ? "Rechazaste la cotización"
          : "Enviaste una propuesta";

    return (
      <div className={`client-quote-chip${embedded ? " client-quote-chip--embedded" : ""}`} role="status">
        {label}
      </div>
    );
  }

  return (
    <section
      className={`client-quote-bar${embedded ? " client-quote-bar--embedded" : ""}`}
      aria-label="Responder cotización"
    >
      <button
        type="button"
        className="client-quote-bar__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="client-quote-bar__label">Cotización lista</span>
        <strong>{formatCurrency(amount, currency)}</strong>
        <span className={`client-quote-bar__chevron${expanded ? " open" : ""}`} />
      </button>

      {expanded && (
        <div className="client-quote-bar__body">
          {showNotes && (
            <p className="client-quote-bar__notes">{finalQuote.notes}</p>
          )}
          {error && (
            <p className="client-quote-bar__error" role="alert">
              {error}
            </p>
          )}
          <div className="client-quote-bar__actions">
            <button
              type="button"
              className="client-quote-bar__btn client-quote-bar__btn--accept"
              onClick={() => handleRespond("aceptada")}
              disabled={responding}
            >
              {responding ? "…" : "Aceptar"}
            </button>
            <button
              type="button"
              className="client-quote-bar__btn client-quote-bar__btn--reject"
              onClick={() => handleRespond("rechazada")}
              disabled={responding}
            >
              Rechazar
            </button>
          </div>
        </div>
      )}

      {!expanded && (
        <div className="client-quote-bar__quick">
          <button
            type="button"
            className="client-quote-bar__btn client-quote-bar__btn--accept"
            onClick={() => handleRespond("aceptada")}
            disabled={responding}
          >
            {responding ? "…" : "Aceptar"}
          </button>
          <button
            type="button"
            className="client-quote-bar__btn client-quote-bar__btn--reject"
            onClick={() => handleRespond("rechazada")}
            disabled={responding}
          >
            Rechazar
          </button>
        </div>
      )}
    </section>
  );
}

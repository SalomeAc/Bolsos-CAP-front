import { useEffect, useState } from "react";
import { setFinalQuotation } from "../../services/quotationService";
import { Modal } from "../Modal/Modal.jsx";
import "./AdminAiQuotationPanel.css";

function formatCurrency(amount, currency = "COP") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function AiStrip({ variant, icon, title, hint, expanded, onToggle, children, actions }) {
  return (
    <section
      className={`ai-strip ai-strip--${variant}${expanded ? " is-expanded" : ""}`}
      aria-label={title}
    >
      <div className="ai-strip__row">
        <button
          type="button"
          className="ai-strip__toggle"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span className="ai-strip__icon" aria-hidden="true">
            {icon}
          </span>
          <span className="ai-strip__text">
            <span className="ai-strip__title">{title}</span>
            {hint && !expanded && (
              <span className="ai-strip__hint">{hint}</span>
            )}
          </span>
          <span className={`ai-strip__chevron${expanded ? " open" : ""}`} aria-hidden="true" />
        </button>
        {actions && <div className="ai-strip__actions">{actions}</div>}
      </div>
      {expanded && children && (
        <div className="ai-strip__body">{children}</div>
      )}
    </section>
  );
}

export function AdminAiQuotationPanel({
  quotation,
  token,
  onQuotationUpdated,
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyAmount, setModifyAmount] = useState("");
  const [modifyNotes, setModifyNotes] = useState("");

  useEffect(() => {
    setExpanded(false);
    setError(null);
  }, [quotation?._id]);

  if (quotation?.kind === "catalog" && !quotation?.aiQuotation?.amount) {
    return (
      <AiStrip
        variant="muted"
        icon="📦"
        title="Catálogo · cotización manual"
        hint="Sin IA automática"
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      >
        <p className="ai-strip__detail">
          El flujo de IA aplica solo a bolsos personalizados desde{" "}
          <strong>/cotizar</strong>. Envía la cotización final al cliente cuando
          tengas el precio.
        </p>
      </AiStrip>
    );
  }

  if (
    quotation?.kind === "custom" &&
    quotation?.status === "pendiente" &&
    !quotation?.aiQuotation?.amount
  ) {
    const createdAt = quotation?.createdAt
      ? new Date(quotation.createdAt).getTime()
      : null;
    const waitingMs = createdAt ? Date.now() - createdAt : 0;
    const isStuck = waitingMs > 90_000;

    return (
      <AiStrip
        variant={isStuck ? "warning" : "loading"}
        icon={isStuck ? "⚠" : <span className="ai-strip__pulse" />}
        title={
          isStuck
            ? "IA no completó la cotización"
            : "Generando cotización con IA"
        }
        hint={
          isStuck
            ? "n8n no actualizó Mongo — revisa ejecuciones"
            : "Procesando solicitud…"
        }
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      >
        <p className="ai-strip__detail">
          {isStuck ? (
            <>
              El webhook respondió pero la cotización sigue en{" "}
              <strong>pendiente</strong> sin monto. Suele deberse a un error
              interno en n8n (Gemini, búsqueda vectorial o credenciales Mongo).
              Abre las ejecuciones fallidas en n8n para esta solicitud.
            </>
          ) : (
            <>
              n8n está calculando la propuesta. Suele tardar 15–60 s. Si no
              aparece el monto, revisa las ejecuciones en n8n.
            </>
          )}
        </p>
      </AiStrip>
    );
  }

  if (!quotation?.aiQuotation?.amount) {
    if (
      !(
        quotation?.status === "en_revision" &&
        quotation?.finalQuotation?.amount != null
      )
    ) {
      return null;
    }
  }

  if (
    quotation.finalQuotation?.amount != null &&
    quotation.status !== "en_revision"
  ) {
    return null;
  }
  if (quotation.status !== "cotizada_ia" && quotation.status !== "en_revision") {
    return null;
  }

  const ai = quotation.aiQuotation || {};
  const currency =
    ai.currency || quotation.finalQuotation?.currency || "COP";
  const defaultAmount =
    quotation.status === "en_revision"
      ? (quotation.clientResponse?.proposedAmount ??
        quotation.finalQuotation?.amount ??
        ai.amount)
      : ai.amount;
  const amountLabel = formatCurrency(defaultAmount, currency);

  const sendToClient = async ({ amount, notes }) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await setFinalQuotation(
        quotation._id,
        {
          amount: Number(amount),
          currency,
          ...(notes ? { notes } : {}),
        },
        token,
      );
      onQuotationUpdated?.(updated);
      setShowModifyModal(false);
    } catch (err) {
      setError(err.message || "No se pudo enviar la cotización al cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = (event) => {
    event.stopPropagation();
    sendToClient({ amount: defaultAmount });
  };

  const openModifyModal = (event) => {
    event.stopPropagation();
    setModifyAmount(String(defaultAmount ?? ""));
    setModifyNotes(
      quotation.status === "en_revision"
        ? quotation.clientResponse?.notes || ""
        : ai.breakdown || "",
    );
    setShowModifyModal(true);
  };

  const handleModifySubmit = () => {
    if (!modifyAmount.trim() || Number.isNaN(Number(modifyAmount))) {
      setError("Ingresa un monto válido");
      return;
    }
    sendToClient({
      amount: Number(modifyAmount),
      notes: modifyNotes,
    });
  };

  return (
    <>
      <AiStrip
        variant="ready"
        icon="✨"
        title={
          quotation.status === "en_revision"
            ? `Reenviar cotización · ${amountLabel}`
            : `Propuesta IA · ${amountLabel}`
        }
        hint={ai.confianza ? `Confianza ${ai.confianza}` : "Lista para enviar"}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        actions={
          <>
            <button
              type="button"
              className="ai-strip__btn ai-strip__btn--accept"
              onClick={handleAccept}
              disabled={saving}
            >
              {saving ? "…" : "Aceptar"}
            </button>
            <button
              type="button"
              className="ai-strip__btn ai-strip__btn--modify"
              onClick={openModifyModal}
              disabled={saving}
            >
              Modificar
            </button>
          </>
        }
      >
        {ai.breakdown && (
          <p className="ai-strip__detail">
            <strong>Justificación:</strong> {ai.breakdown}
          </p>
        )}
        {error && (
          <p className="ai-strip__error" role="alert">
            {error}
          </p>
        )}
      </AiStrip>

      <Modal
        open={showModifyModal}
        title="Modificar cotización"
        description="Ajusta el monto o las notas antes de enviar al cliente."
        onClose={() => setShowModifyModal(false)}
      >
        <div className="admin-ai-quotation-panel__form">
          <label htmlFor="modify-amount">Monto (COP)</label>
          <input
            id="modify-amount"
            type="number"
            min="0"
            value={modifyAmount}
            onChange={(e) => setModifyAmount(e.target.value)}
          />
          <label htmlFor="modify-notes">Notas para el cliente</label>
          <textarea
            id="modify-notes"
            rows={4}
            value={modifyNotes}
            onChange={(e) => setModifyNotes(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="modal-button secondary"
            onClick={() => setShowModifyModal(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-button primary"
            onClick={handleModifySubmit}
            disabled={saving}
          >
            {saving ? "Enviando..." : "Enviar al cliente"}
          </button>
        </div>
      </Modal>
    </>
  );
}

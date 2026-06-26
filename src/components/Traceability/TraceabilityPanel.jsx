import { useEffect, useState } from "react";
import { getQuotationTraceability } from "../../services/quotationService";
import "./TraceabilityPanel.css";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(amount, currency = "COP") {
  if (amount == null) return "Pendiente";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TraceabilityPanel({ quotationId, token, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quotationId || !token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getQuotationTraceability(quotationId, token);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [quotationId, token]);

  return (
    <div className="traceability-panel" role="dialog" aria-label="Trazabilidad de solicitud y cotización">
      <div className="traceability-panel__header">
        <h3>Trazabilidad</h3>
        {onClose && (
          <button type="button" className="traceability-panel__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        )}
      </div>

      {loading && <p className="traceability-panel__status">Cargando trazabilidad...</p>}
      {error && <p className="traceability-panel__error" role="alert">{error}</p>}

      {data && !loading && (
        <div className="traceability-panel__content">
          <section className="traceability-panel__section">
            <h4>Solicitud</h4>
            {data.solicitud ? (
              <dl className="traceability-panel__dl">
                <div><dt>Código</dt><dd>{data.solicitud.code || "—"}</dd></div>
                <div><dt>Estado</dt><dd>{data.solicitud.status}</dd></div>
                <div><dt>Fecha</dt><dd>{formatDate(data.solicitud.createdAt)}</dd></div>
                <div><dt>Cliente</dt><dd>{data.cliente?.firstName} {data.cliente?.lastName}</dd></div>
              </dl>
            ) : (
              <p className="traceability-panel__muted">Sin solicitud vinculada</p>
            )}
          </section>

          <section className="traceability-panel__section">
            <h4>Cotización</h4>
            <dl className="traceability-panel__dl">
              <div><dt>Estado</dt><dd>{data.cotizacion?.status}</dd></div>
              <div>
                <dt>Monto final</dt>
                <dd>
                  {formatPrice(
                    data.cotizacion?.finalQuotation?.amount,
                    data.cotizacion?.finalQuotation?.currency
                  )}
                </dd>
              </div>
              <div><dt>Fecha cotización</dt><dd>{formatDate(data.cotizacion?.finalQuotation?.quotedAt)}</dd></div>
            </dl>
          </section>

          <section className="traceability-panel__section">
            <h4>Integridad de datos</h4>
            <ul className="traceability-panel__checks">
              <li className={data.integridad?.solicitudVinculada ? "ok" : "fail"}>
                Solicitud vinculada
              </li>
              <li className={data.integridad?.cotizacionVinculada ? "ok" : "fail"}>
                Cotización vinculada
              </li>
              <li className={data.integridad?.idsCoinciden ? "ok" : "fail"}>
                IDs coinciden
              </li>
            </ul>
          </section>

          {data.timeline?.length > 0 && (
            <section className="traceability-panel__section">
              <h4>Línea de tiempo</h4>
              <ol className="traceability-panel__timeline">
                {data.timeline.map((item, index) => (
                  <li key={`${item.event}-${index}`}>
                    <span className="traceability-panel__timeline-date">
                      {formatDate(item.date)}
                    </span>
                    <span className="traceability-panel__timeline-desc">
                      {item.description}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

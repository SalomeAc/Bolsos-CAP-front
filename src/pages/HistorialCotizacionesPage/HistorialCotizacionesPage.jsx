import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllQuotations,
  updateQuotationStatus,
} from "../../services/quotationService";
import { useAuthStore } from "../../store/useAuthStore";
import "./HistorialCotizacionesPage.css";
import VoiceButton from "../../components/VoiceButton/VoiceButton";
import "../../components/VoiceButton/VoiceButton.css";

const statusOptions = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "en_produccion", label: "En producción" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

// Palabras clave de voz → valor del enum de estado
const VOICE_STATUS_MAP = {
  "pendiente": "pendiente",
  "revisión": "en_revision",
  "revision": "en_revision",
  "producción": "en_produccion",
  "produccion": "en_produccion",
  "completada": "completada",
  "cancelada": "cancelada",
};

function getStatusLabel(status) {
  const labels = {
    pendiente: "Pendiente",
    cotizada_ia: "Cotizada (IA)",
    en_revision: "En revisión",
    cotizada: "Cotizada",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
    en_produccion: "En producción",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  return labels[status] || status || "Sin estado";
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Sin fecha";
  return parsedDate.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getQuotationPrice(quotation) {
  return quotation?.finalQuotation?.amount ?? quotation?.aiQuotation?.amount ?? null;
}

function formatPrice(quotation) {
  const price = getQuotationPrice(quotation);
  if (price === null || price === undefined) return "Pendiente de cotizar";
  const currency =
    quotation?.finalQuotation?.currency ||
    quotation?.aiQuotation?.currency ||
    "COP";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function getCustomerName(quotation) {
  const firstName = quotation?.user?.firstName || "Cliente";
  const lastName = quotation?.user?.lastName || "";
  return `${firstName} ${lastName}`.trim();
}

export function HistorialCotizacionesPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.authToken);
  const userIsAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [voiceLabel, setVoiceLabel] = useState(null); // feedback visual

  useEffect(() => {
    if (!userIsAdmin) navigate("/");
  }, [userIsAdmin, navigate]);

  useEffect(() => {
    if (!token || !userIsAdmin) return;

    const loadQuotations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllQuotations(token);
        setQuotations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading quotation history:", err);
        setError(err.message || "No se pudo cargar el historial de cotizaciones");
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();
  }, [token, userIsAdmin]);

  // --- Lógica de voz: dentro del componente para acceder a los setters ---
  // Detecta si el texto contiene una palabra clave de estado y aplica el
  // filtro correspondiente. El resto del texto se usa para buscar cliente
  // o producto. Así un solo micrófono sirve para todos los filtros.
  const handleVoiceResult = (text) => {
    const command = text.toLowerCase().replace(/\.$/, "").trim();
    let appliedStatus = null;

    // 1. ¿Menciona un estado?
    for (const [keyword, statusValue] of Object.entries(VOICE_STATUS_MAP)) {
      if (command.includes(keyword)) {
        setStatusFilter(statusValue);
        appliedStatus = statusValue;
        break;
      }
    }

    // 2. El texto restante (sin la palabra de estado) va al buscador general
    let remaining = command;
    if (appliedStatus) {
      for (const keyword of Object.keys(VOICE_STATUS_MAP)) {
        remaining = remaining.replace(keyword, "").trim();
      }
    }

    if (remaining) {
      // Busca en cliente Y producto a la vez con el mismo término
      setSearchTerm(remaining);
      setProductFilter(remaining);
    }

    // Feedback visual de lo que se escuchó
    setVoiceLabel(text);
    setTimeout(() => setVoiceLabel(null), 3000);
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      await updateQuotationStatus(quotationId, newStatus, token);
      setQuotations((prev) =>
        prev.map((q) =>
          q._id === quotationId ? { ...q, status: newStatus } : q
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado");
    }
  };

  const filteredQuotations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedProduct = productFilter.trim().toLowerCase();

    return [...quotations]
      .filter((quotation) => {
        const customerName = getCustomerName(quotation).toLowerCase();
        const customerEmail = (quotation?.user?.email || "").toLowerCase();
        const productName =
          quotation?.kind === "catalog"
            ? (quotation?.product?.name || "").toLowerCase()
            : "personalizado";
        const productType =
          quotation?.kind === "catalog"
            ? "cotización de catálogo"
            : (quotation?.customProduct?.description || "").toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 ||
          customerName.includes(normalizedSearch) ||
          customerEmail.includes(normalizedSearch);

        const matchesProduct =
          normalizedProduct.length === 0 ||
          productName.includes(normalizedProduct) ||
          productType.includes(normalizedProduct);

        const matchesStatus =
          statusFilter === "all" || quotation?.status === statusFilter;

        const matchesDate =
          !dateFilter ||
          new Date(quotation.createdAt).toLocaleDateString("en-CA") === dateFilter;

        return matchesSearch && matchesProduct && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      });
  }, [quotations, searchTerm, productFilter, statusFilter, dateFilter]);

  if (!userIsAdmin) return null;

  return (
    <section className="historial-cotizaciones-page">
      <header className="historial-header">
        <div>
          <span className="historial-eyebrow">Vista administrativa</span>
          <h1>Historial de cotizaciones</h1>
          <p>Consulta el resumen completo de las cotizaciones registradas</p>
        </div>
        <div className="historial-summary">
          <strong>{filteredQuotations.length}</strong>
          <span>Cotizaciones</span>
        </div>
      </header>

      <section className="historial-filters" aria-label="Filtros del historial">
        <div className="filter-group">
          <label htmlFor="search-quotation">Buscar cliente</label>
          <div className="catalog-search">
            <input
              id="search-quotation"
              type="search"
              placeholder="Nombre o correo del cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <VoiceButton onResult={handleVoiceResult} />
          </div>
          {voiceLabel && (
            <span className="voice-feedback">🎙 "{voiceLabel}"</span>
          )}
        </div>

        <div className="filter-group">
          <label htmlFor="product-filter">Producto / tipo</label>
          <input
            id="product-filter"
            className="search-input"
            type="search"
            placeholder="Bolso Bloom, personalizado, etc."
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Estado</label>
          <select
            id="status-filter"
            className="select-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">Fecha</label>
          <input
            id="date-filter"
            className="search-input"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </section>

      <section className="historial-table-card">
        {loading && <div className="empty-state">Cargando historial...</div>}

        {error && !loading && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredQuotations.length === 0 && (
          <div className="empty-state">
            <p>No hay cotizaciones para mostrar.</p>
          </div>
        )}

        {!loading && !error && filteredQuotations.length > 0 && (
          <div className="table-scroll">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Producto / tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation) => (
                  <tr
                    key={quotation._id}
                    className="quotation-row"
                    onClick={() => navigate(`/quotation/${quotation._id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/quotation/${quotation._id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Ver detalle de ${getCustomerName(quotation)}`}
                  >
                    <td>
                      <div className="customer-cell">
                        <strong>{getCustomerName(quotation)}</strong>
                        <span>{quotation?.user?.email || "Sin correo"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="product-cell">
                        <strong>
                          {quotation?.kind === "catalog"
                            ? quotation?.product?.name || "Sin producto"
                            : "Personalizado"}
                        </strong>
                        <span>
                          {quotation?.kind === "catalog"
                            ? "Cotización de catálogo"
                            : quotation?.customProduct?.description ||
                              "Solicitud personalizada"}
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(quotation?.createdAt)}</td>
                    <td>
                      <div className="status-select-wrapper">
                        <select
                          className={`status-select status-${quotation.status}`}
                          value={quotation.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleStatusChange(quotation._id, e.target.value)
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <strong
                        className={
                          getQuotationPrice(quotation)
                            ? "price-value"
                            : "price-placeholder"
                        }
                      >
                        {formatPrice(quotation)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
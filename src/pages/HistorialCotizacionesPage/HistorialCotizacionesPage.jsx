import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuotations } from "../../services/quotationService";
import { useAuthStore } from "../../store/useAuthStore";
import "./HistorialCotizacionesPage.css";

const statusOptions = [
  { value: "pendiente", label: "Pendiente" },
  { value: "cotizada_ia", label: "Cotizada (IA)" },
  { value: "en_revision", label: "En revisión" },
  { value: "cotizada", label: "Cotizada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "en_produccion", label: "En producción" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

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
  if (!value) {
    return "Sin fecha";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin fecha";
  }

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

  if (price === null || price === undefined) {
    return "Pendiente de cotizar";
  }

  const currency = quotation?.finalQuotation?.currency || quotation?.aiQuotation?.currency || "COP";

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
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!userIsAdmin) {
      navigate("/");
    }
  }, [userIsAdmin, navigate]);

  useEffect(() => {
    if (!token || !userIsAdmin) {
      return;
    }

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

  const filteredQuotations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...quotations]
      .filter((quotation) => {
        const customerName = getCustomerName(quotation).toLowerCase();
        const customerEmail = (quotation?.user?.email || "").toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          customerName.includes(normalizedSearch) ||
          customerEmail.includes(normalizedSearch);
        const matchesStatus =
          statusFilter === "all" || quotation?.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((quotationA, quotationB) => {
        const dateA = new Date(quotationA?.createdAt || 0).getTime();
        const dateB = new Date(quotationB?.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [quotations, searchTerm, statusFilter]);

  if (!userIsAdmin) {
    return null;
  }

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
          <span>Cotizaciones visibles</span>
        </div>
      </header>

      <section className="historial-filters" aria-label="Filtros del historial">
        <div className="filter-group">
          <label htmlFor="search-quotation">Buscar cliente</label>
          <input
            id="search-quotation"
            className="search-input"
            type="search"
            placeholder="Nombre o correo del cliente"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Estado</label>
          <select
            id="status-filter"
            className="select-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
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
                        <strong>{quotation?.kind === "catalog" ? quotation?.product?.name || "Sin producto" : "Personalizado"}</strong>
                        <span>{quotation?.kind === "catalog" ? "Cotización de catálogo" : quotation?.customProduct?.description || "Solicitud personalizada"}</span>
                      </div>
                    </td>
                    <td>{formatDate(quotation?.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${quotation?.status || "pendiente"}`}>
                        {getStatusLabel(quotation?.status)}
                      </span>
                    </td>
                    <td>
                      <strong className={getQuotationPrice(quotation) ? "price-value" : "price-placeholder"}>
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
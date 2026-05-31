import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllQuotations } from "../../services/quotationService";
import { useAuthStore } from "../../store/useAuthStore";
import { Chat } from "../../components/Chat/Chat";
import "../../pages/MisCotizacionesPage/MisCotizacionesPage.css";

export function AdminMessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.authToken);
  const userIsAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar que el usuario es administrador
  useEffect(() => {
    if (!userIsAdmin) {
      navigate("/");
    }
  }, [userIsAdmin, navigate]);

  // Cargar todas las cotizaciones
  useEffect(() => {
    if (!token || !userIsAdmin) return;

    const loadQuotations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllQuotations(token);
        setQuotations(data);

        // Seleccionar la primera cotización por defecto
        if (data.length > 0 && !selectedQuotation) {
          setSelectedQuotation(data[0]);
        }
      } catch (err) {
        console.error("Error loading quotations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();

    // Poll cada 10 segundos
    const interval = setInterval(loadQuotations, 10000);
    return () => clearInterval(interval);
  }, [token, userIsAdmin]);

  // Actualizar cotización seleccionada cuando cambia la lista
  useEffect(() => {
    if (selectedQuotation) {
      const updated = quotations.find((q) => q._id === selectedQuotation._id);
      if (updated) {
        setSelectedQuotation(updated);
      }
    }
  }, [quotations]);

  // Si viene selectedQuotationId desde navegación
  useEffect(() => {
    const selectedId = location.state?.selectedQuotationId;
    if (selectedId && quotations.length > 0) {
      const quotation = quotations.find((q) => q._id === selectedId);
      if (quotation) {
        setSelectedQuotation(quotation);
      }
    }
  }, [location.state?.selectedQuotationId, quotations]);

  // Filtrar cotizaciones por búsqueda
  const filteredQuotations = quotations.filter((q) => {
    const searchText = searchTerm.toLowerCase();
    const userName = q.user?.firstName?.toLowerCase() || "";
    const userEmail = q.user?.email?.toLowerCase() || "";
    const productName = q.product?.name?.toLowerCase() || "catálogo";

    return (
      userName.includes(searchText) ||
      userEmail.includes(searchText) ||
      productName.includes(searchText)
    );
  });

  // Ordenar por fecha más reciente primero
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  return (
    <div className="mis-cotizaciones-container">
      <div className="mis-cotizaciones-list-section">
        <div className="mis-cotizaciones-header">
          <h2>Mensajes de Clientes</h2>
          <input
            type="text"
            placeholder="Buscar cliente o producto..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mis-cotizaciones-list">
          {loading && <div className="empty-state">Cargando...</div>}

          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          {!loading && sortedQuotations.length === 0 && (
            <div className="empty-state">
              <p>No hay cotizaciones pendientes</p>
            </div>
          )}

          {sortedQuotations.map((quotation) => (
            <div
              key={quotation._id}
              className={`quotation-item ${selectedQuotation?._id === quotation._id ? "active" : ""}`}
              onClick={() => setSelectedQuotation(quotation)}
            >
              <div
                className="quotation-item-avatar"
                style={{
                  backgroundColor: getAvatarColor(quotation.user?._id),
                  overflow: "hidden",
                }}
              >
                {quotation.product?.photo ? (
                  <img
                    src={quotation.product.photo}
                    alt={quotation.product?.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  getInitials(
                    quotation.user?.firstName,
                    quotation.user?.lastName,
                  )
                )}
              </div>

              <div className="quotation-item-content">
                <div className="quotation-item-header">
                  <h3>
                    {quotation.user?.firstName} {quotation.user?.lastName}
                  </h3>
                  <span className={`status-badge status-${quotation.status}`}>
                    {getStatusLabel(quotation.status)}
                  </span>
                </div>

                <p className="quotation-item-product">
                  {quotation.product?.name || "Catálogo"}
                </p>

                <p className="quotation-item-description">
                  {quotation.notes ||
                    quotation.user?.email ||
                    "Sin información"}
                </p>
              </div>

              <time className="quotation-item-date">
                {new Date(quotation.createdAt).toLocaleDateString()}
              </time>
            </div>
          ))}
        </div>
      </div>

      <div className="mis-cotizaciones-detail-section">
        {selectedQuotation ? (
          <>
            <div className="detail-header">
              <div className="detail-header-content">
                <h2>
                  {selectedQuotation.user?.firstName}{" "}
                  {selectedQuotation.user?.lastName}
                </h2>
                <p className="detail-email">{selectedQuotation.user?.email}</p>
              </div>
              <span
                className={`status-badge status-${selectedQuotation.status}`}
              >
                {getStatusLabel(selectedQuotation.status)}
              </span>
            </div>

            <div className="detail-chat-section">
              <h4>
                Conversación de la Cotización #{selectedQuotation._id.slice(-6)}
              </h4>
              <Chat
                quotationId={selectedQuotation._id}
                quotation={selectedQuotation}
                isAdmin={true}
              />
            </div>
          </>
        ) : (
          <div className="empty-detail">
            <p>Selecciona una cotización para ver los detalles</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getInitials(firstName, lastName) {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "US";
}

function getAvatarColor(userId) {
  if (!userId) return "#764ba2";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#d0a584", // Beige (colores de marca)
    "#764ba2", // Púrpura
    "#667eea", // Azul
    "#f39c12", // Naranja
    "#e74c3c", // Rojo
    "#27ae60", // Verde
    "#16a085", // Verde azulado
    "#2980b9", // Azul oscuro
    "#8e44ad", // Púrpura oscuro
    "#d35400", // Naranja oscuro
    "#c0392b", // Rojo oscuro
    "#e91e63", // Rosa
    "#9c27b0", // Púrpura claro
    "#00bcd4", // Cian
    "#ff6b6b", // Rojo coral
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getStatusLabel(status) {
  const labels = {
    pendiente: "Pendiente",
    cotizada_ia: "Cotizada (IA)",
    en_revision: "En Revisión",
    cotizada: "Cotizada",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
    en_produccion: "En Producción",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  return labels[status] || status;
}

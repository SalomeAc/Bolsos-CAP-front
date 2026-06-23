import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuotations } from "../../services/quotationService";
import { useAuthStore } from "../../store/useAuthStore";
import { Chat } from "../../components/Chat/Chat";
import "../MisCotizacionesPage/MisCotizacionesPage.css";

export function CotizacionesPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.authToken);
  const userIsAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const [quotations, setQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const selectedQuotation = quotations.find(
    (q) => q._id === selectedQuotationId,
  );
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
      } catch (err) {
        console.error("Error loading quotations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();

    const interval = setInterval(loadQuotations, 10000);

    return () => clearInterval(interval);
  }, [token, userIsAdmin]);

  useEffect(() => {
    if (quotations.length === 0) return;

    setSelectedQuotationId((currentId) => {
      if (currentId) {
        const exists = quotations.some((q) => q._id === currentId);

        if (exists) {
          return currentId;
        }
      }

      return quotations[0]._id;
    });
  }, [quotations]);

  // Filtrar cotizaciones por búsqueda
  const filteredQuotations = quotations.filter((q) => {
    const searchText = searchTerm.toLowerCase();
    const clientName =
      `${q.user?.firstName || ""} ${q.user?.lastName || ""}`.toLowerCase();
    const clientEmail = q.user?.email?.toLowerCase() || "";
    const productName = (q.product?.name || "Catálogo").toLowerCase();

    return (
      clientName.includes(searchText) ||
      clientEmail.includes(searchText) ||
      productName.includes(searchText)
    );
  });

  // Ordenar por fecha más reciente primero
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  if (!userIsAdmin) {
    return null;
  }

  return (
    <div className="mis-cotizaciones-container">
      <div className="mis-cotizaciones-list-section">
        <div className="mis-cotizaciones-header">
          <h2>Cotizaciones de Clientes</h2>
          <input
            type="text"
            placeholder="Buscar cliente..."
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
              <p>No hay cotizaciones</p>
            </div>
          )}

          {sortedQuotations.map((quotation) => (
            <div
              key={quotation._id}
              className={`quotation-item ${selectedQuotationId === quotation._id ? "active" : ""}`}
              onClick={() => setSelectedQuotationId(quotation._id)}
            >
              <div className="quotation-item-avatar">
                {quotation.user?.firstName?.[0]?.toUpperCase() || "C"}
              </div>

              <div className="quotation-item-content">
                <div className="quotation-item-header">
                  <h3>
                    {quotation.user?.firstName} {quotation.user?.lastName}
                  </h3>
                  <span className={`status-badge status-${quotation.status}`}>
                    {quotation.status}
                  </span>
                </div>

                <p className="quotation-item-product">
                  {quotation.product?.name || "Catálogo"}
                </p>

                <p className="quotation-item-description">
                  {quotation.user?.email || "Sin email"}
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
                {selectedQuotation.status}
              </span>
            </div>

            <div className="detail-chat-section">
              <Chat
                quotationId={selectedQuotation._id}
                quotation={selectedQuotation}
                isAdmin={true}
              />
            </div>
          </>
        ) : (
          <div className="empty-detail">
            <p>Selecciona una cotización para ver la conversación</p>
          </div>
        )}
      </div>
    </div>
  );
}

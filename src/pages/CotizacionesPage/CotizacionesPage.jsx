import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllQuotations,
  updateQuotationStatus,
} from "../../services/quotationService";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";
import { useAuthStore } from "../../store/useAuthStore";
import { Chat } from "../../components/Chat/Chat";
import { TraceabilityPanel } from "../../components/Traceability/TraceabilityPanel";
import { AdminAiQuotationPanel } from "../../components/AdminAiQuotationPanel/AdminAiQuotationPanel";
import "../MisCotizacionesPage/MisCotizacionesPage.css";
import "./CotizacionesPage.css";

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

export function CotizacionesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.authToken);
  const userIsAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const [quotations, setQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState(
    location.state?.selectedQuotationId || null
  );
  const [showTraceability, setShowTraceability] = useState(false);
  const selectedQuotation = quotations.find(
    (q) => q._id === selectedQuotationId,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

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
    if (location.state?.selectedQuotationId) {
      setSelectedQuotationId(location.state.selectedQuotationId);
    }
  }, [location.state?.selectedQuotationId]);

  useEffect(() => {
    setShowTraceability(false);
  }, [selectedQuotationId]);

  useEffect(() => {
    if (!token || !userIsAdmin) return;

    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);
        const [items, countData] = await Promise.all([
          getNotifications(token, { limit: 6 }),
          getUnreadNotificationCount(token),
        ]);
        setNotifications(Array.isArray(items) ? items : []);
        setUnreadCount(countData.count ?? 0);
      } catch (err) {
        console.error("Error loading admin notifications:", err);
        setNotificationsError(err.message);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [token, userIsAdmin]);

  const handleQuotationUpdated = (updated) => {
    setQuotations((current) =>
      current.map((quotation) =>
        quotation._id === updated._id ? updated : quotation,
      ),
    );
  };

  const handleStatusChange = async (nextStatus) => {
    if (!selectedQuotationId || !nextStatus || !token) return;

    try {
      setStatusSaving(true);
      const updated = await updateQuotationStatus(selectedQuotationId, nextStatus, token);
      handleQuotationUpdated(updated);
    } catch (err) {
      console.error("Error updating quotation status:", err);
      setError(err.message);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id, token);
        setUnreadCount((count) => Math.max(0, count - 1));
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, read: true } : item,
          ),
        );
      }

      const quotationId = notification.quotation?._id || notification.quotation;
      if (quotationId) {
        setSelectedQuotationId(quotationId);
      }
    } catch (err) {
      console.error("Error opening notification:", err);
      setNotificationsError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      setUnreadCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      setNotificationsError(err.message);
    }
  };

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
    <div className="mis-cotizaciones-container admin-cotizaciones-layout">
      <div className="mis-cotizaciones-list-section admin-cotizaciones-sidebar">
        <section className="admin-notifications-panel admin-notifications-panel--compact">
          <div className="admin-notifications-panel__header">
            <button
              type="button"
              className="admin-notifications-panel__toggle"
              onClick={() => setShowNotifications((value) => !value)}
              aria-expanded={showNotifications}
            >
              <span>
                <span className="admin-notifications-panel__eyebrow">Alertas</span>
                <h3>Notificaciones</h3>
              </span>
              <span className="admin-notifications-panel__toggle-meta">
                {unreadCount > 0 ? `${unreadCount} nuevas` : "Sin nuevas"}
                <span className={`admin-notifications-panel__chevron${showNotifications ? " open" : ""}`} />
              </span>
            </button>
            {showNotifications && unreadCount > 0 && (
              <button
                type="button"
                className="admin-notifications-panel__mark-all"
                onClick={handleMarkAllRead}
              >
                Marcar leídas
              </button>
            )}
          </div>

          {showNotifications && notificationsError && (
            <p className="admin-notifications-panel__error" role="alert">
              {notificationsError}
            </p>
          )}

          {showNotifications && (
            notificationsLoading ? (
              <p className="admin-notifications-panel__empty">Cargando notificaciones...</p>
            ) : notifications.length === 0 ? (
              <p className="admin-notifications-panel__empty">No hay alertas nuevas.</p>
            ) : (
              <ul className="admin-notifications-panel__list">
                {notifications.map((notification) => (
                  <li key={notification._id}>
                    <button
                      type="button"
                      className={`admin-notifications-panel__item${notification.read ? "" : " unread"}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="admin-notifications-panel__title">
                        {notification.title}
                      </span>
                      <span className="admin-notifications-panel__message">
                        {notification.message}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </section>

        <div className="mis-cotizaciones-header admin-cotizaciones-sidebar__header">
          <h2>Cotizaciones</h2>
          <input
            type="search"
            placeholder="Buscar cliente..."
            className="search-input admin-cotizaciones-sidebar__search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mis-cotizaciones-list admin-cotizaciones-sidebar__list">
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
              className={`quotation-item admin-cotizaciones-sidebar__item ${selectedQuotationId === quotation._id ? "active" : ""}`}
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
                  {quotation.product?.name || quotation.customProduct?.description || "Personalizado"}
                  {quotation.solicitud?.code && (
                    <span className="solicitud-code"> · {quotation.solicitud.code}</span>
                  )}
                </p>

                <p className="quotation-item-description">
                  {quotation.user?.email || "Sin email"}
                </p>
                <p className="quotation-item-description">
                  {quotation.aiQuotation?.amount != null
                    ? `IA: ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: quotation.aiQuotation.currency || "COP",
                        maximumFractionDigits: 0,
                      }).format(quotation.aiQuotation.amount)}`
                    : "Sin precio IA aún"}
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
            <div className="detail-header detail-header--admin">
              <div className="detail-header-content">
                <h2 className="detail-client-name">
                  {selectedQuotation.user?.firstName}{" "}
                  {selectedQuotation.user?.lastName}
                </h2>
                <p className="detail-client-meta">
                  <span className="detail-email">
                    {selectedQuotation.user?.email}
                  </span>
                  {selectedQuotation.solicitud?.code && (
                    <>
                      <span className="detail-meta-sep" aria-hidden="true">
                        ·
                      </span>
                      <span className="detail-solicitud-code">
                        {selectedQuotation.solicitud.code}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="detail-header-actions detail-header-actions--aligned">
                <button
                  type="button"
                  className="detail-action-control traceability-toggle"
                  onClick={() => setShowTraceability((v) => !v)}
                >
                  {showTraceability ? "Ocultar trazabilidad" : "Ver trazabilidad"}
                </button>
                <div className="status-select-shell status-select-shell--compact status-select-shell--inline">
                  <label className="status-select-label" htmlFor="admin-status-select">
                    Estado
                  </label>
                  <select
                    id="admin-status-select"
                    className="status-select-control detail-action-control"
                    value={selectedQuotation.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusSaving}
                    aria-label="Cambiar estado de la cotización"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {showTraceability && (
              <TraceabilityPanel
                quotationId={selectedQuotation._id}
                token={token}
                onClose={() => setShowTraceability(false)}
              />
            )}

            <AdminAiQuotationPanel
              quotation={selectedQuotation}
              token={token}
              onQuotationUpdated={handleQuotationUpdated}
            />

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

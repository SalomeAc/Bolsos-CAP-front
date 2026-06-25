import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, isTokenExpired } from "../../store/useAuthStore";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";
import "./NotificationBell.css";

function formatNotificationDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-CO", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.authToken);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);
  const logout = useAuthStore((state) => state.logout);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);

  const handleAuthError = useCallback(
    (message) => {
      if (
        message === "Invalid token" ||
        message === "Token expired" ||
        message === "Token missing"
      ) {
        logout();
        setError("Tu sesión expiró. Inicia sesión nuevamente.");
        navigate("/login");
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadNotifications = useCallback(async () => {
    if (!token || !isAdmin) return;

    if (isTokenExpired(token)) {
      handleAuthError("Token expired");
      return;
    }

    try {
      setError(null);
      const [items, countData] = await Promise.all([
        getNotifications(token, { limit: 20 }),
        getUnreadNotificationCount(token),
      ]);
      setNotifications(items);
      setUnreadCount(countData.count ?? 0);
    } catch (err) {
      console.error("Error loading notifications:", err);
      if (!handleAuthError(err.message)) {
        setError(err.message);
      }
    }
  }, [token, isAdmin, handleAuthError]);

  useEffect(() => {
    if (!isAdmin || !token || isTokenExpired(token)) return;

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, token, loadNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!isAdmin) return null;

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id, token);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      }

      setOpen(false);
      const quotationId =
        notification.quotation?._id || notification.quotation;
      if (quotationId) {
        navigate("/cotizaciones", { state: { selectedQuotationId: quotationId } });
      }
    } catch (err) {
      if (!handleAuthError(err.message)) {
        setError(err.message);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      if (!handleAuthError(err.message)) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        type="button"
        className="notification-bell__trigger"
        onClick={handleToggle}
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ""}`}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-bell__badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell__panel" role="region" aria-label="Panel de notificaciones">
          <div className="notification-bell__header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button type="button" className="notification-bell__mark-all" onClick={handleMarkAllRead}>
                Marcar todas leídas
              </button>
            )}
          </div>

          {error && (
            <p className="notification-bell__error" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="notification-bell__empty">Cargando...</p>
          ) : notifications.length === 0 ? (
            <p className="notification-bell__empty">No hay notificaciones</p>
          ) : (
            <ul className="notification-bell__list">
              {notifications.map((notification) => (
                <li key={notification._id}>
                  <button
                    type="button"
                    className={`notification-bell__item${notification.read ? "" : " unread"}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="notification-bell__item-title">
                      {notification.title}
                    </span>
                    <span className="notification-bell__item-message">
                      {notification.message}
                    </span>
                    <span className="notification-bell__item-date">
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

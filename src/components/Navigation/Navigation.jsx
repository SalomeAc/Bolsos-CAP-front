import "./Navigation.css";
import { Link, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, isTokenExpired } from "../../store/useAuthStore.js";
import { NotificationBell } from "../Notifications/NotificationBell.jsx";

const getNavLinks = (isAdmin) => {
  const baseLinks = [
    { to: "/", label: "Inicio", end: true },
    { to: "/catalog", label: "Catálogo" },
  ];
  if (isAdmin) {
    baseLinks.push({ to: "/cotizaciones", label: "Cotizaciones" });
    baseLinks.push({ to: "/admin/historial-cotizaciones", label: "Historial" });
  } else {
    baseLinks.push({ to: "/cotizar", label: "Cotizar" });
    baseLinks.push({ to: "/mis-cotizaciones", label: "Mis Cotizaciones" });
  }
  return baseLinks;
};

export function Navigation() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const authToken = useAuthStore((state) => state.authToken);
  const logout = useAuthStore((state) => state.logout);
  const hasValidSession =
    !!authToken && !isTokenExpired(authToken);
  const isAdmin = currentUser?.isAdmin === true && hasValidSession;

  useEffect(() => {
    if (currentUser && authToken && isTokenExpired(authToken)) {
      logout();
    }
  }, [currentUser, authToken, logout]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = getNavLinks(isAdmin);

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Ir a inicio">
        <img className="brand-mark" src="/icon.png" alt="Bolsos Cap" />
        <span>
          <strong>Bolsos Cap</strong>
          <small>Crochet Artesanal</small>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Navegación principal">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-session">
        {!isAdmin && (
          <Link className="header-cta" to="/catalog">
            Cotiza tu Bolso
          </Link>
        )}

        {currentUser && hasValidSession ? (
          <>
            {isAdmin && <NotificationBell />}
            <span style={{ marginRight: "1rem", fontSize: "0.9rem" }}>
              {currentUser.firstName || currentUser.name}
            </span>
            <button
              className="header-logout"
              type="button"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link className="header-login" to="/login">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
}

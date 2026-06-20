import "./Navigation.css";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";

const getNavLinks = (isAdmin) => {
  const baseLinks = [
    { to: "/", label: "Inicio", end: true },
    { to: "/catalog", label: "Catálogo" },
  ];
  if (isAdmin) {
    baseLinks.push({ to: "/cotizaciones", label: "Cotizaciones" });
    baseLinks.push({ to: "/admin/historial-cotizaciones", label: "Historial" });
  } else {
    baseLinks.push({ to: "/mis-cotizaciones", label: "Mis Cotizaciones" });
  }
  return baseLinks;
};

export function Navigation() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = currentUser?.isAdmin === true;

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

        {currentUser ? (
          <>
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
            Incia Sesión
          </Link>
        )}
      </div>
    </header>
  );
}

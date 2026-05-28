import './Navigation.css'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore.js'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/profile', label: 'Perfil' },
]

export function Navigation() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Ir a inicio">
        <img
          className="brand-mark"
          src="/icon.png"
          alt="Bolsos Cap"
        />
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
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-session">
        <Link className="header-cta" to="/catalog">
          Cotiza tu Bolso
        </Link>

        {currentUser ? (
          <button className="header-logout" type="button" onClick={handleLogout}>
            {currentUser.name}
          </button>
        ) : (
          <Link className="header-login" to="/login">
            Incia Sesión
          </Link>
        )}
      </div>
    </header>
  )
}

import './ProfilePage.css'
import { useAuthStore } from '../../store/useAuthStore.js'

export function ProfilePage() {
  const currentUser = useAuthStore((state) => state.currentUser)

  return (
    <section className="profile-layout">
      <article className="profile-card profile-card--highlight">
        <span className="eyebrow">Perfil</span>
        <h1>{currentUser ? `Perfil de ${currentUser.name}` : 'Perfil de cliente'}</h1>
        <p>
          {currentUser
            ? 'Tu sesión está conectada con Zustand y disponible en toda la aplicación.'
            : 'Espacio para datos personales, pedidos recientes y preferencias guardadas.'}
        </p>
      </article>

      <div className="profile-grid">
        <article className="profile-card">
          <h2>Datos básicos</h2>
          <ul>
            <li>Nombre: {currentUser?.name || 'pendiente de conexión'}</li>
            <li>Correo: {currentUser?.email || 'pendiente de conexión'}</li>
          </ul>
        </article>
        <article className="profile-card">
          <h2>Actividad reciente</h2>
          <ul>
            <li>Proveedor: {currentUser?.provider || 'sin sesión'}</li>
            <li>Favoritos: 0 productos</li>
            <li>Pedidos: 0 pedidos</li>
            <li>Direcciones: 1 dirección guardada</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

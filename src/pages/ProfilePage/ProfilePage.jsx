import './ProfilePage.css'
import { useAuthStore } from '../../store/useAuthStore.js'

export function ProfilePage() {
  const currentUser = useAuthStore((state) => state.currentUser)

  return (
    <section className="profile-layout">
      <article className="profile-card profile-card--highlight profile-card--single">
        <span className="eyebrow">Perfil</span>
        <h1>{currentUser ? `Perfil de ${currentUser.name}` : 'Perfil de cliente'}</h1>
        <p>
          {currentUser
            ? 'Estos son los datos básicos de tu cuenta.'
            : 'Inicia sesión para ver tus datos básicos.'}
        </p>

        <h2>Datos básicos</h2>
        <ul>
          <li>Nombre: {currentUser?.name || 'pendiente de conexión'}</li>
          <li>Correo: {currentUser?.email || 'pendiente de conexión'}</li>
        </ul>
      </article>
    </section>
  )
}

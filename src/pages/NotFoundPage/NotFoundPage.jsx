import './NotFoundPage.css'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <span className="eyebrow">404</span>
      <h1>No encontramos esa sección.</h1>
      <Link className="button button-primary" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

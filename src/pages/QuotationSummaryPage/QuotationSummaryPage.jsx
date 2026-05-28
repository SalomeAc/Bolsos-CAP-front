import { Link, useLocation, useNavigate } from 'react-router-dom'

function formatList(value) {
  if (!value && value !== "") return []

  if (Array.isArray(value)) return value.filter(Boolean)

  const str = String(value).trim()
  return str ? [str] : []
}

export function QuotationSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const summary = location.state?.summary || null

  if (!summary) {
    return (
      <section className="empty-state">
        <span className="eyebrow">Cotización</span>
        <h1>No encontramos el resumen de la cotización.</h1>
        <p>Vuelve al producto y genera una nueva solicitud.</p>
        <div className="hero-actions">
          <button className="button button-secondary" type="button" onClick={() => navigate(-1)}>
            Volver
          </button>
          <Link className="button button-primary" to="/catalog">
            Ir al catálogo
          </Link>
        </div>
      </section>
    )
  }

  const colors = formatList(summary.selectedColors ?? summary.selectedColor)

  return (
    <section className="section-block">
      <div className="section-heading">
        <span className="eyebrow">Cotización en proceso</span>
        <h1>Resumen de tu solicitud</h1>
        <p>Revisa lo que elegiste antes de continuar con la cotización.</p>
      </div>

      <article className="product-detail-card" style={{ maxWidth: '100%' }}>
        <p><strong>Producto:</strong> {summary.name}</p>
        <p><strong>Código:</strong> {summary.code}</p>
        <p><strong>Tipo:</strong> {summary.type}</p>
        <p><strong>Material:</strong> {summary.selectedMaterial}</p>
        <p><strong>Dimensión:</strong> {summary.selectedDimension}</p>
        <p><strong>Colores:</strong> {colors.length > 0 ? colors.join(', ') : 'Sin selección'}</p>

        <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
          <button className="button button-secondary" type="button" onClick={() => navigate(-1)}>
            Volver
          </button>
          <Link className="button button-primary" to="/catalog">
            Seguir explorando
          </Link>
        </div>
      </article>
    </section>
  )
}
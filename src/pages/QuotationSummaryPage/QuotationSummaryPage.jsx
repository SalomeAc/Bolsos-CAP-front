import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { createQuotation } from '../../services/quotationService'
import { getProductByCode } from '../../services/productService'
import { useAuthStore } from '../../store/useAuthStore'
import './QuotationSummaryPage.css'

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
  const token = useAuthStore((state) => state.authToken)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmitQuotation = async () => {
    if (!summary || !token) return

    setIsSubmitting(true)
    setError(null)

    try {
      let productId = summary.productId

      // Si no tenemos productId (fallback a búsqueda por código)
      if (!productId && summary.code) {
        try {
          const productListResponse = await getProductByCode(summary.code)
          // getProductByCode devuelve un array, tomar el primero
          const products = Array.isArray(productListResponse) ? productListResponse : [productListResponse]
          productId = products[0]?._id || products[0]?.id
        } catch (err) {
          console.warn('No se pudo obtener el producto por código:', err)
        }
      }

      // Validar que productId existe
      if (!productId) {
        setError('Error: No se pudo encontrar el producto. Intenta nuevamente desde el catálogo.')
        setIsSubmitting(false)
        return
      }

      const quotationData = {
        kind: 'catalog',
        product: productId,
        customization: {
          type: summary.type,
          color: summary.selectedColor || '',
          size: summary.selectedDimension,
        },
        quantity: 1,
        notes: 'Cotización creada desde el catálogo',
      }

      console.log('Enviando cotización:', quotationData)
      const createdQuotation = await createQuotation(quotationData, token)
      const quotationId = createdQuotation?._id || createdQuotation?.id
      navigate('/mis-cotizaciones', { 
        replace: true,
        state: { selectedQuotationId: quotationId }
      })
    } catch (err) {
      setError(err.message || 'Error al enviar la cotización')
      setIsSubmitting(false)
    }
  }

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

      <div className="quotation-summary-container">
        <article className="product-card-quotation">
          {summary.photo && (
            <div className="product-image">
              <img src={summary.photo} alt={summary.name} />
            </div>
          )}
          
          <div className="product-info">
            <div className="product-header">
              <h2>{summary.name}</h2>
              {summary.price && <span className="price">{summary.price}</span>}
            </div>

            <div className="specifications">
              {summary.category && (
                <p><strong>Categoría:</strong> {summary.category}</p>
              )}
              
              <p><strong>Color seleccionado:</strong> {summary.selectedColor || 'No especificado'}</p>
              
              <p><strong>Dimensiones:</strong> {summary.selectedDimension || 'No especificadas'}</p>
              
              <p><strong>Material:</strong> {summary.selectedMaterial || 'No especificado'}</p>

              {summary.materials && (
                <p><strong>Materiales disponibles:</strong> {summary.materials}</p>
              )}

              {summary.colors && (
                <p><strong>Colores disponibles:</strong> {summary.colors}</p>
              )}
            </div>

            {error && (
              <p style={{ color: '#c33', marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fee', borderRadius: '4px' }}>
                {error}
              </p>
            )}

            <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
              <button className="button button-secondary" type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Volver
              </button>
              <button 
                className="button button-primary" 
                type="button" 
                onClick={handleSubmitQuotation}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar cotización'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
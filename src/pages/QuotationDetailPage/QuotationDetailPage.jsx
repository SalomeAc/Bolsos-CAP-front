import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuotation, respondQuotation } from '../../services/quotationService'
import { Chat } from '../../components/Chat/Chat'
import { useAuthStore } from '../../store/useAuthStore'
import './QuotationDetailPage.css'

export function QuotationDetailPage() {
  const { quotationId } = useParams()
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const [quotation, setQuotation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responding, setResponding] = useState(false)

  const token = authStore.authToken
  const userId = authStore.currentUser?.id
  const userIsAdmin = authStore.currentUser?.isAdmin

  // Cargar detalle de la cotización
  useEffect(() => {
    if (!quotationId || !token) return

    const loadQuotation = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getQuotation(quotationId, token)
        setQuotation(data)
      } catch (err) {
        console.error('Error loading quotation:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadQuotation()
    // Solo cargar una vez al montar, sin poll constante
  }, [quotationId, token])

  // Responder a la cotización
  const handleRespond = async (decision) => {
    if (!quotation) return

    try {
      setResponding(true)
      setError(null)
      const updated = await respondQuotation(quotationId, decision, token)
      setQuotation(updated)
    } catch (err) {
      console.error('Error responding to quotation:', err)
      setError(err.message)
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <section className="quotation-detail-loading">
        <div className="spinner"></div>
        <p>Cargando cotización...</p>
      </section>
    )
  }

  if (error || !quotation) {
    return (
      <section className="quotation-detail-error">
        <span className="eyebrow">Error</span>
        <h1>No se pudo cargar la cotización</h1>
        <p>{error || 'La cotización no existe o no tienes permiso para verla'}</p>
        <button className="button button-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
      </section>
    )
  }

  const isOwner = quotation.user === userId || (quotation.user._id && quotation.user._id === userId)
  const canRespond = isOwner && quotation.status === 'cotizada'

  return (
    <section className="quotation-detail-page">
      <div className="quotation-detail-header">
        <button className="button-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <div className="quotation-detail-title">
          <span className="eyebrow">Cotización #{quotation._id.slice(-8)}</span>
          <h1>Detalle de tu solicitud</h1>
        </div>
      </div>

      <div className="quotation-detail-container">
        {/* Columna izquierda: Información */}
        <article className="quotation-info-panel">
          <div className="quotation-info-section">
            <h2>Información General</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Tipo de Cotización</label>
                <span>{quotation.kind === 'catalog' ? 'Catálogo' : 'Personalizada'}</span>
              </div>
              <div className="info-item">
                <label>Estado</label>
                <span className={`status-badge status-${quotation.status}`}>
                  {getStatusLabel(quotation.status)}
                </span>
              </div>
              <div className="info-item">
                <label>Cantidad</label>
                <span>{quotation.quantity}</span>
              </div>
              <div className="info-item">
                <label>Fecha de Solicitud</label>
                <span>{new Date(quotation.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>

          {quotation.kind === 'catalog' && quotation.product && (
            <div className="quotation-info-section">
              <h2>Producto del Catálogo</h2>
              <div className="info-grid">
                {quotation.product.name && (
                  <div className="info-item">
                    <label>Producto</label>
                    <span>{quotation.product.name}</span>
                  </div>
                )}
                {quotation.product.code && (
                  <div className="info-item">
                    <label>Código</label>
                    <span>{quotation.product.code}</span>
                  </div>
                )}
              </div>
              {quotation.customization && (
                <div className="customization-box">
                  <h3>Personalización</h3>
                  {quotation.customization.type && (
                    <p><strong>Tipo:</strong> {quotation.customization.type}</p>
                  )}
                  {quotation.customization.color && (
                    <p><strong>Color:</strong> {quotation.customization.color}</p>
                  )}
                  {quotation.customization.size && (
                    <p><strong>Tamaño:</strong> {quotation.customization.size}</p>
                  )}
                  {quotation.customization.material && (
                    <p><strong>Material:</strong> {quotation.customization.material}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {quotation.kind === 'custom' && quotation.customProduct && (
            <div className="quotation-info-section">
              <h2>Producto Personalizado</h2>
              <div className="customization-box">
                {quotation.customProduct.description && (
                  <p><strong>Descripción:</strong> {quotation.customProduct.description}</p>
                )}
                {quotation.customProduct.color && (
                  <p><strong>Color:</strong> {quotation.customProduct.color}</p>
                )}
                {quotation.customProduct.dimensions && (
                  <p><strong>Dimensiones:</strong> {quotation.customProduct.dimensions}</p>
                )}
                {quotation.customProduct.materials && quotation.customProduct.materials.length > 0 && (
                  <p><strong>Materiales:</strong> {quotation.customProduct.materials.join(', ')}</p>
                )}
                {quotation.customProduct.photo && (
                  <a href={quotation.customProduct.photo} target="_blank" rel="noopener noreferrer" className="photo-link">
                    📎 Ver foto de referencia
                  </a>
                )}
              </div>
            </div>
          )}

          {quotation.notes && (
            <div className="quotation-info-section">
              <h2>Notas</h2>
              <p className="notes-text">{quotation.notes}</p>
            </div>
          )}

          {quotation.finalQuotation && (
            <div className="quotation-info-section quotation-final-section">
              <h2>Cotización Final</h2>
              <div className="final-quotation-box">
                <div className="amount">
                  <span className="label">Monto</span>
                  <span className="value">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: quotation.finalQuotation.currency || 'COP',
                    }).format(quotation.finalQuotation.amount)}
                  </span>
                </div>
                {quotation.finalQuotation.notes && (
                  <div className="notes">
                    <span className="label">Notas:</span>
                    <p>{quotation.finalQuotation.notes}</p>
                  </div>
                )}
                {quotation.finalQuotation.quotedAt && (
                  <div className="quoted-date">
                    <small>Enviada el {new Date(quotation.finalQuotation.quotedAt).toLocaleDateString('es-ES')}</small>
                  </div>
                )}
              </div>

              {canRespond && (
                <div className="response-actions">
                  <button
                    className="button button-success"
                    onClick={() => handleRespond('aceptada')}
                    disabled={responding}
                  >
                    {responding ? 'Procesando...' : '✓ Aceptar Cotización'}
                  </button>
                  <button
                    className="button button-danger"
                    onClick={() => handleRespond('rechazada')}
                    disabled={responding}
                  >
                    {responding ? 'Procesando...' : '✕ Rechazar Cotización'}
                  </button>
                </div>
              )}
            </div>
          )}
        </article>

        {/* Columna derecha: Chat */}
        <div className="quotation-chat-panel">
          <div className="chat-header">
            <h2>Mensajes</h2>
            <span className="chat-subtitle">
              {isOwner ? 'Comunícate con la administradora' : 'Comunícate con el cliente'}
            </span>
          </div>
          <Chat quotationId={quotationId} quotation={quotation} isAdmin={userIsAdmin} />
        </div>
      </div>
    </section>
  )
}

// Función auxiliar para obtener etiqueta de estado
function getStatusLabel(status) {
  const labels = {
    'pendiente': 'Pendiente',
    'cotizada_ia': 'Cotizada (IA)',
    'en_revision': 'En Revisión',
    'cotizada': 'Cotizada',
    'aceptada': 'Aceptada',
    'rechazada': 'Rechazada',
    'en_produccion': 'En Producción',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
  }
  return labels[status] || status
}

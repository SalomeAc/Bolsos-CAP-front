import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getMyQuotations } from '../../services/quotationService'
import { useAuthStore } from '../../store/useAuthStore'
import { Chat } from '../../components/Chat/Chat'
import './MisCotizacionesPage.css'

export function MisCotizacionesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((state) => state.authToken)
  const currentUser = useAuthStore((state) => state.currentUser)
  
  const [quotations, setQuotations] = useState([])
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar mis cotizaciones
  useEffect(() => {
    if (!token) return

    const loadQuotations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getMyQuotations(token)
        setQuotations(data)
        
        // Seleccionar la primera cotización por defecto
        if (data.length > 0 && !selectedQuotation) {
          setSelectedQuotation(data[0])
        }
      } catch (err) {
        console.error('Error loading quotations:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadQuotations()

    // Poll cada 10 segundos
    const interval = setInterval(loadQuotations, 10000)
    return () => clearInterval(interval)
  }, [token])

  // Actualizar cotización seleccionada cuando cambia la lista
  useEffect(() => {
    if (selectedQuotation) {
      const updated = quotations.find(q => q._id === selectedQuotation._id)
      if (updated) {
        setSelectedQuotation(updated)
      }
    }
  }, [quotations])

  // Si viene selectedQuotationId desde navegación, seleccionar esa cotización
  useEffect(() => {
    const selectedId = location.state?.selectedQuotationId
    if (selectedId && quotations.length > 0) {
      const quotation = quotations.find(q => q._id === selectedId)
      if (quotation) {
        setSelectedQuotation(quotation)
      }
    }
  }, [location.state?.selectedQuotationId, quotations])

  // Filtrar cotizaciones por búsqueda
  const filteredQuotations = quotations.filter(q => {
    const searchText = searchTerm.toLowerCase()
    const productName = q.product?.name || 'Catálogo'
    
    return productName.toLowerCase().includes(searchText)
  })

  // Ordenar por fecha más reciente primero
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return dateB - dateA
  })

  return (
    <div className="mis-cotizaciones-container">
      <div className="mis-cotizaciones-list-section">
        <div className="mis-cotizaciones-header">
          <h2>Mis Cotizaciones</h2>
          <input
            type="text"
            placeholder="Buscar producto..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mis-cotizaciones-list">
          {loading && <div className="empty-state">Cargando...</div>}
          
          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          {!loading && sortedQuotations.length === 0 && (
            <div className="empty-state">
              <p>No tienes cotizaciones</p>
            </div>
          )}

          {sortedQuotations.map((quotation) => (
            <div
              key={quotation._id}
              className={`quotation-item ${selectedQuotation?._id === quotation._id ? 'active' : ''}`}
              onClick={() => setSelectedQuotation(quotation)}
            >
              <div className="quotation-item-avatar">
                AC
              </div>
              
              <div className="quotation-item-content">
                <div className="quotation-item-header">
                  <h3>Administrador</h3>
                  <span className={`status-badge status-${quotation.status}`}>
                    {quotation.status}
                  </span>
                </div>
                
                <p className="quotation-item-product">
                  {quotation.product?.name || 'Catálogo'}
                </p>
                
                <p className="quotation-item-description">
                  {quotation.adminResponse || 'Sin respuesta aún'}
                </p>
              </div>

              <time className="quotation-item-date">
                {new Date(quotation.createdAt).toLocaleDateString()}
              </time>
            </div>
          ))}
        </div>
      </div>

      <div className="mis-cotizaciones-detail-section">
        {selectedQuotation ? (
          <>
            <div className="detail-header">
              <div className="detail-header-content">
                <h2>Administrador</h2>
                <p className="detail-email">Bolsos CAP</p>
              </div>
              <span className={`status-badge status-${selectedQuotation.status}`}>
                {selectedQuotation.status}
              </span>
            </div>

            {/* product-card-info removed so the chat message is the primary product display */}

            <div className="detail-chat-section">
              <h4>Conversación</h4>
              <Chat quotationId={selectedQuotation._id} quotation={selectedQuotation} />
            </div>
          </>
        ) : (
          <div className="empty-detail">
            <p>Selecciona una cotización para ver los detalles</p>
          </div>
        )}
      </div>
    </div>
  )
}

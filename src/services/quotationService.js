const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const message = data?.error || data?.message || response.statusText || 'Error en la comunicación con el servidor.'
    throw new Error(message)
  }

  return data
}

/**
 * Obtener detalles de una cotización específica
 * @param {string} quotationId - ID de la cotización
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto de la cotización
 */
export async function getQuotation(quotationId, token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return handleResponse(response)
}

/**
 * Obtener mis cotizaciones
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Array>} Array de cotizaciones del usuario
 */
export async function getMyQuotations(token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations/mine`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return handleResponse(response)
}

/**
 * Obtener todas las cotizaciones (solo admin)
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Array>} Array de todas las cotizaciones
 */
export async function getAllQuotations(token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return handleResponse(response)
}

/**
 * Crear una cotización
 * @param {Object} quotationData - Datos de la cotización
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto de la cotización creada
 */
export async function createQuotation(quotationData, token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(quotationData),
  })

  return handleResponse(response)
}

/**
 * Responder a una cotización (aceptar o rechazar)
 * @param {string} quotationId - ID de la cotización
 * @param {string} decision - 'aceptada' o 'rechazada'
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto de la cotización actualizada
 */
export async function respondQuotation(quotationId, decision, token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}/respond`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ decision }),
  })

  return handleResponse(response)
}

/**
 * Actualizar estado de una cotización (solo admin)
 * @param {string} quotationId - ID de la cotización
 * @param {string} status - Nuevo estado
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto de la cotización actualizada
 */
export async function updateQuotationStatus(quotationId, status, token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  return handleResponse(response)
}

/**
 * Establecer cotización final (solo admin)
 * @param {string} quotationId - ID de la cotización
 * @param {Object} finalQuotationData - Datos de la cotización final
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto de la cotización actualizada
 */
export async function setFinalQuotation(quotationId, finalQuotationData, token) {
  const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}/quote`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(finalQuotationData),
  })

  return handleResponse(response)
}

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
 * Obtener todos los mensajes de una cotización
 * @param {string} quotationId - ID de la cotización
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Array>} Array de mensajes
 */
export async function getMessagesByQuotation(quotationId, token) {
  const response = await fetch(`${API_BASE_URL}/api/messages/${quotationId}/all`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return handleResponse(response)
}

/**
 * Obtener los últimos mensajes de una cotización
 * @param {string} quotationId - ID de la cotización
 * @param {string} token - Token JWT del usuario
 * @param {number} limit - Número máximo de mensajes a obtener (default: 50)
 * @returns {Promise<Array>} Array de mensajes ordenados (más antiguos primero)
 */
export async function getLatestMessages(quotationId, token, limit = 50) {
  const response = await fetch(
    `${API_BASE_URL}/api/messages/${quotationId}?limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  )

  return handleResponse(response)
}

/**
 * Enviar un nuevo mensaje
 * @param {string} quotationId - ID de la cotización
 * @param {string} content - Contenido del mensaje
 * @param {Array<string>} attachments - URLs de archivos adjuntos (opcional)
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto del mensaje creado
 */
export async function sendMessage(quotationId, content, token, attachments = []) {
  const response = await fetch(`${API_BASE_URL}/api/messages/${quotationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      quotationId,
      content,
      attachments,
    }),
  })

  return handleResponse(response)
}

/**
 * Eliminar un mensaje
 * @param {string} messageId - ID del mensaje a eliminar
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<Object>} Objeto de respuesta del servidor
 */
export async function deleteMessage(messageId, token) {
  const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return handleResponse(response)
}

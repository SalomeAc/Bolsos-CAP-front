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
 * Obtener notificaciones del admin
 * @param {string} token - Token JWT
 * @param {{ unreadOnly?: boolean, limit?: number }} options
 */
export async function getNotifications(token, { unreadOnly = false, limit = 50 } = {}) {
  const params = new URLSearchParams()
  if (unreadOnly) params.set('unread', 'true')
  if (limit) params.set('limit', String(limit))

  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/api/notifications${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  return handleResponse(response)
}

/**
 * Obtener cantidad de notificaciones no leídas
 * @param {string} token - Token JWT
 */
export async function getUnreadNotificationCount(token) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  return handleResponse(response)
}

/**
 * Marcar una notificación como leída
 * @param {string} notificationId
 * @param {string} token
 */
export async function markNotificationAsRead(notificationId, token) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  })

  return handleResponse(response)
}

/**
 * Marcar todas las notificaciones como leídas
 * @param {string} token
 */
export async function markAllNotificationsAsRead(token) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  })

  return handleResponse(response)
}

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

function buildProductPayload(product) {
  return {
    name: product.name,
    description: product.description,
    color: Array.isArray(product.color)
      ? product.color
      : product.color
      ? String(product.color).split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    dimensions: Array.isArray(product.dimensions)
      ? product.dimensions
      : product.dimensions
      ? String(product.dimensions).split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    materials: Array.isArray(product.materials)
      ? product.materials
      : product.materials
      ? String(product.materials).split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    type: product.type,
    photo: product.photo,

  }
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`)
  return handleResponse(response)
}

export async function createProduct(product) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildProductPayload(product)),
  })

  return handleResponse(response)
}

export async function updateProduct(productId, product) {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildProductPayload(product)),
  })

  return handleResponse(response)
}

export async function deleteProduct(productId) {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
  })

  return handleResponse(response)
}

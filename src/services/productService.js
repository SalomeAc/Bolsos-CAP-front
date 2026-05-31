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

export async function getProductByCode(code) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?code=${code}`)
    return handleResponse(response)
  } catch (err) {
    // Si falla la búsqueda por code, obtener todos y filtrar por código o nombre en el frontend
    try {
      const allProducts = await fetchProducts()
      const found = Array.isArray(allProducts) ? 
        allProducts.find(p => p.code === code || p.name?.toLowerCase().includes(code?.toLowerCase())) :
        null
      return found ? [found] : []
    } catch {
      throw new Error(`No se encontró producto con código: ${code}`)
    }
  }
}

export async function createProduct(product, token) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(buildProductPayload(product)),
  })

  return handleResponse(response)
}

export async function updateProduct(productId, product, token) {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(buildProductPayload(product)),
  })

  return handleResponse(response)
}

export async function deleteProduct(productId, token) {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return handleResponse(response)
}

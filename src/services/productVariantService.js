const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      data?.error || data?.message || response.statusText || "Error en el servidor.";
    throw new Error(message);
  }

  return data;
}

export async function fetchProductVariants(productId, token, { sync = false } = {}) {
  const query = sync ? "?sync=true" : "";
  const response = await fetch(
    `${API_BASE_URL}/api/products/${productId}/variants${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleResponse(response);
}

export async function saveProductVariants(productId, variants, token) {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/variants`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ variants }),
  });

  return handleResponse(response);
}

export async function syncProductVariants(productId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/products/${productId}/variants/sync`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleResponse(response);
}

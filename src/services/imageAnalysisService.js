const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      response.statusText ||
      "Error en la comunicación con el servidor.";
    throw new Error(message);
  }

  return data;
}

/**
 * Analiza una imagen de bolso con AWS Rekognition (solo admin).
 * @param {string} token - JWT
 * @param {File} imageFile - Archivo de imagen
 */
export async function analyzeBagImage(token, imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/api/image-analysis/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response);
}

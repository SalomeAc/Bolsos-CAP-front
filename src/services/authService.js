// src/services/authService.js
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

export async function loginWithGoogle(idToken) {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  return handleResponse(response);
}

export async function getUserProfile(token) {
  const response = await fetch(`${API_BASE_URL}/api/users/user-profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function updateUserProfile(token, profileData) {
  const response = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

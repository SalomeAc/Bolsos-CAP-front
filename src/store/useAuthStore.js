import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function base64UrlToUtf8(base64UrlValue) {
  const base64 = base64UrlValue.replace(/-/g, '+').replace(/_/g, '/')
  const normalizedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binaryString = atob(normalizedBase64)
  const bytes = Uint8Array.from(binaryString, (character) => character.charCodeAt(0))

  return new TextDecoder('utf-8').decode(bytes)
}

function normalizeUtf8Text(value) {
  if (!value) {
    return ''
  }

  try {
    const bytes = new TextEncoder().encode(String(value))
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return String(value)
  }
}

function decodeJwtPayload(token) {
  if (!token) {
    return null
  }

  const parts = token.split('.')

  if (parts.length !== 3) {
    return null
  }

  try {
    return JSON.parse(base64UrlToUtf8(parts[1]))
  } catch {
    return null
  }
}

function buildGoogleProfile(credentialPayload, sessionToken) {
  return {
    name: normalizeUtf8Text(credentialPayload.name || credentialPayload.given_name || 'Usuario Google'),
    email: normalizeUtf8Text(credentialPayload.email || ''),
    picture: credentialPayload.picture || '',
    provider: 'google',
    token: sessionToken,
    isAdmin: false,
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      authToken: null,
      signInWithGoogle: async (credential) => {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'No se pudo iniciar sesión con Google')
        }

        const credentialPayload = decodeJwtPayload(credential) || {}
        const backendProfile = data?.user || {}
        const currentUser = {
              name: normalizeUtf8Text(backendProfile.firstName || credentialPayload.given_name || 'Usuario Google'),
              email: normalizeUtf8Text(backendProfile.email || credentialPayload.email || ''),
              picture: backendProfile.picture || credentialPayload.picture || '',
              provider: backendProfile.authProvider || 'google',
              token: data.token,
              isAdmin: backendProfile.isAdmin || false,
            }

        set({
          currentUser,
          authToken: data.token,
        })

        return { currentUser, token: data.token }
      },
      logout: () => set({ currentUser: null, authToken: null }),
    }),
    {
      name: 'bolsoscap-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        authToken: state.authToken,
      }),
    },
  ),
)

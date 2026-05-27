import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const fakeGoogleProfile = {
  name: 'Usuario Google',
  email: 'usuario.google@example.com',
  provider: 'google',
}

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      signInWithGoogle: () => {
        set({ currentUser: fakeGoogleProfile })
        return fakeGoogleProfile
      },
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'bolsoscap-auth',
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
)

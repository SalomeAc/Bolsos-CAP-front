import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      token: null,

      setUser: (user, token) => {
        set({ currentUser: user, token });
      },

      logout: () => {
        set({ currentUser: null, token: null });
      },

      setToken: (token) => {
        set({ token });
      },
    }),
    {
      name: "bolsoscap-auth",
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
    },
  ),
);

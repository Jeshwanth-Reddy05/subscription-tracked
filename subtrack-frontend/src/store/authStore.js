import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "../services/auth";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, userToken) => {
        set({ user: userData, token: userToken, isAuthenticated: true });
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch (err) {
          console.error("Backend logout error", err);
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("auth-storage");
          window.location.href = "/";
        }
      },

      setUser: (userData) => {
        set({ user: userData });
        localStorage.setItem("user", JSON.stringify(userData));
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

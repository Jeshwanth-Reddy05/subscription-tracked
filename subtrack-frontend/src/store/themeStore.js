import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",

      initTheme: () => {
        const activeTheme = get().theme;
        const root = window.document.documentElement;
        if (activeTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      },

      toggleTheme: () => {
        set((state) => {
          const nextTheme = state.theme === "light" ? "dark" : "light";
          const root = window.document.documentElement;
          if (nextTheme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
          return { theme: nextTheme };
        });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

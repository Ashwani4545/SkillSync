"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillsync-theme") as Theme | null;
      const initial = saved === "light" || saved === "dark" ? saved : "dark";
      setThemeState(initial);
      document.documentElement.setAttribute("data-theme", initial);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(initial);
      document.body.style.backgroundColor = initial === "dark" ? "#0A0F1E" : "#F8FAFC";
      document.body.style.color = initial === "dark" ? "#ffffff" : "#0F172A";
    } catch {
      // fallback
    }
    setMounted(true);
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("skillsync-theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(nextTheme);
      document.body.style.backgroundColor = nextTheme === "dark" ? "#0A0F1E" : "#F8FAFC";
      document.body.style.color = nextTheme === "dark" ? "#ffffff" : "#0F172A";
    } catch {}
  };

  const toggleTheme = () => {
    setThemeState((curr) => {
      const nextTheme = curr === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("skillsync-theme", nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(nextTheme);
        document.body.style.backgroundColor = nextTheme === "dark" ? "#0A0F1E" : "#F8FAFC";
        document.body.style.color = nextTheme === "dark" ? "#ffffff" : "#0F172A";
      } catch {}
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

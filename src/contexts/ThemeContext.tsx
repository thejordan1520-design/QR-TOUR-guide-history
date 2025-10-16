import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setThemeCookie, getThemeCookie } from '../utils/cookies';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Obtener tema de cookies, con fallback a localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const themeFromCookie = getThemeCookie();
    if (themeFromCookie) {
      return themeFromCookie === 'dark';
    }
    // Fallback a localStorage
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      setThemeCookie('dark');
      localStorage.setItem('darkMode', 'true'); // Mantener compatibilidad
    } else {
      document.documentElement.classList.remove('dark');
      setThemeCookie('light');
      localStorage.setItem('darkMode', 'false'); // Mantener compatibilidad
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
} 
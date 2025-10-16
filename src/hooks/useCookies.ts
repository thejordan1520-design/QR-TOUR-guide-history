import { useState, useEffect, useCallback } from 'react';
import {
  setCookie,
  getCookie,
  deleteCookie,
  hasCookie,
  setLanguageCookie,
  getLanguageCookie,
  setThemeCookie,
  getThemeCookie,
  setAuthTokenCookie,
  getAuthTokenCookie,
  deleteAuthTokenCookie,
  setUserPreferencesCookie,
  getUserPreferencesCookie,
  setTourProgressCookie,
  getTourProgressCookie,
  setFavoritesCookie,
  getFavoritesCookie,
  addToFavoritesCookie,
  removeFromFavoritesCookie,
  isFavoriteCookie,
  COOKIE_KEYS
} from '../utils/cookies';

/**
 * Hook personalizado para gestionar cookies de manera reactiva
 */
export const useCookies = () => {
  const [cookies, setCookies] = useState<Record<string, string>>({});

  // Actualizar estado cuando cambien las cookies
  useEffect(() => {
    const updateCookies = () => {
      const allCookies: Record<string, string> = {};
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          allCookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      });
      setCookies(allCookies);
    };

    updateCookies();
    
    // Escuchar cambios en las cookies (no es perfecto, pero ayuda)
    const interval = setInterval(updateCookies, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const setCookieValue = useCallback((name: string, value: string, options?: any) => {
    setCookie(name, value, options);
    setCookies(prev => ({ ...prev, [name]: value }));
  }, []);

  const deleteCookieValue = useCallback((name: string, options?: any) => {
    deleteCookie(name, options);
    setCookies(prev => {
      const newCookies = { ...prev };
      delete newCookies[name];
      return newCookies;
    });
  }, []);

  return {
    cookies,
    setCookie: setCookieValue,
    getCookie,
    deleteCookie: deleteCookieValue,
    hasCookie,
    // Funciones específicas
    setLanguage: setLanguageCookie,
    getLanguage: getLanguageCookie,
    setTheme: setThemeCookie,
    getTheme: getThemeCookie,
    setAuthToken: setAuthTokenCookie,
    getAuthToken: getAuthTokenCookie,
    deleteAuthToken: deleteAuthTokenCookie,
    setUserPreferences: setUserPreferencesCookie,
    getUserPreferences: getUserPreferencesCookie,
    setTourProgress: setTourProgressCookie,
    getTourProgress: getTourProgressCookie,
    setFavorites: setFavoritesCookie,
    getFavorites: getFavoritesCookie,
    addToFavorites: addToFavoritesCookie,
    removeFromFavorites: removeFromFavoritesCookie,
    isFavorite: isFavoriteCookie,
    COOKIE_KEYS
  };
};

/**
 * Hook específico para el idioma
 */
export const useLanguageCookie = () => {
  const [language, setLanguageState] = useState(getLanguageCookie);

  const setLanguage = useCallback((newLanguage: string) => {
    setLanguageCookie(newLanguage);
    setLanguageState(newLanguage);
  }, []);

  return { language, setLanguage };
};

/**
 * Hook específico para el tema
 */
export const useThemeCookie = () => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(getThemeCookie);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeCookie(newTheme);
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme };
};

/**
 * Hook específico para favoritos
 */
export const useFavoritesCookie = () => {
  const [favorites, setFavoritesState] = useState<string[]>(getFavoritesCookie);

  const addToFavorites = useCallback((locationId: string) => {
    addToFavoritesCookie(locationId);
    setFavoritesState(prev => [...prev, locationId]);
  }, []);

  const removeFromFavorites = useCallback((locationId: string) => {
    removeFromFavoritesCookie(locationId);
    setFavoritesState(prev => prev.filter(id => id !== locationId));
  }, []);

  const isFavorite = useCallback((locationId: string) => {
    return favorites.includes(locationId);
  }, [favorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
};

/**
 * Hook específico para autenticación
 */
export const useAuthCookie = () => {
  const [authToken, setAuthTokenState] = useState<string | null>(getAuthTokenCookie);
  const [rememberMe, setRememberMeState] = useState<boolean>(getCookie(COOKIE_KEYS.REMEMBER_ME) === 'true');

  const setAuthToken = useCallback((token: string, remember: boolean = false) => {
    setAuthTokenCookie(token, remember);
    setAuthTokenState(token);
    setRememberMeState(remember);
  }, []);

  const deleteAuthToken = useCallback(() => {
    deleteAuthTokenCookie();
    setAuthTokenState(null);
    setRememberMeState(false);
  }, []);

  return {
    authToken,
    rememberMe,
    setAuthToken,
    deleteAuthToken
  };
}; 
// Sistema completo de gestión de cookies
export interface CookieOptions {
  expires?: Date | number; // Fecha de expiración o días
  path?: string; // Ruta donde la cookie es válida
  domain?: string; // Dominio donde la cookie es válida
  secure?: boolean; // Solo HTTPS
  sameSite?: 'Strict' | 'Lax' | 'None'; // Política SameSite
  httpOnly?: boolean; // Solo servidor (no accesible desde JavaScript)
}

/**
 * Establece una cookie
 * @param name - Nombre de la cookie
 * @param value - Valor de la cookie
 * @param options - Opciones de configuración
 */
export const setCookie = (
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void => {
  const {
    expires,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Agregar fecha de expiración
  if (expires) {
    let expirationDate: Date;
    if (typeof expires === 'number') {
      expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + expires * 24 * 60 * 60 * 1000);
    } else {
      expirationDate = expires;
    }
    cookieString += `; expires=${expirationDate.toUTCString()}`;
  }

  // Agregar otras opciones
  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Obtiene el valor de una cookie
 * @param name - Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

/**
 * Elimina una cookie
 * @param name - Nombre de la cookie
 * @param options - Opciones de configuración
 */
export const deleteCookie = (
  name: string, 
  options: CookieOptions = {}
): void => {
  setCookie(name, '', {
    ...options,
    expires: new Date(0) // Fecha en el pasado para expirar inmediatamente
  });
};

/**
 * Verifica si una cookie existe
 * @param name - Nombre de la cookie
 * @returns true si la cookie existe
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Obtiene todas las cookies como objeto
 * @returns Objeto con todas las cookies
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  const cookieList = document.cookie.split(';');
  
  for (let cookie of cookieList) {
    cookie = cookie.trim();
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }
  
  return cookies;
};

/**
 * Establece una cookie con expiración en días
 * @param name - Nombre de la cookie
 * @param value - Valor de la cookie
 * @param days - Días hasta que expire
 * @param options - Opciones adicionales
 */
export const setCookieForDays = (
  name: string, 
  value: string, 
  days: number, 
  options: CookieOptions = {}
): void => {
  setCookie(name, value, { ...options, expires: days });
};

/**
 * Establece una cookie de sesión (expira al cerrar el navegador)
 * @param name - Nombre de la cookie
 * @param value - Valor de la cookie
 * @param options - Opciones adicionales
 */
export const setSessionCookie = (
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void => {
  setCookie(name, value, options); // Sin expires = cookie de sesión
};

// Funciones específicas para tu aplicación
export const COOKIE_KEYS = {
  LANGUAGE: 'app_language',
  THEME: 'app_theme',
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
  REMEMBER_ME: 'remember_me',
  OFFLINE_MODE: 'offline_mode',
  SOUND_ENABLED: 'sound_enabled',
  LAST_VISITED: 'last_visited',
  TOUR_PROGRESS: 'tour_progress',
  FAVORITES: 'user_favorites'
} as const;

/**
 * Establece el idioma preferido del usuario
 */
export const setLanguageCookie = (language: string): void => {
  setCookieForDays(COOKIE_KEYS.LANGUAGE, language, 365);
};

/**
 * Obtiene el idioma preferido del usuario
 */
export const getLanguageCookie = (): string => {
  return getCookie(COOKIE_KEYS.LANGUAGE) || 'es';
};

/**
 * Establece el tema preferido del usuario
 */
export const setThemeCookie = (theme: 'light' | 'dark'): void => {
  setCookieForDays(COOKIE_KEYS.THEME, theme, 365);
};

/**
 * Obtiene el tema preferido del usuario
 */
export const getThemeCookie = (): 'light' | 'dark' => {
  return (getCookie(COOKIE_KEYS.THEME) as 'light' | 'dark') || 'light';
};

/**
 * Establece el token de autenticación
 */
export const setAuthTokenCookie = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    setCookieForDays(COOKIE_KEYS.AUTH_TOKEN, token, 30); // 30 días
    setCookieForDays(COOKIE_KEYS.REMEMBER_ME, 'true', 30);
  } else {
    setSessionCookie(COOKIE_KEYS.AUTH_TOKEN, token); // Sesión
    setSessionCookie(COOKIE_KEYS.REMEMBER_ME, 'false');
  }
};

/**
 * Obtiene el token de autenticación
 */
export const getAuthTokenCookie = (): string | null => {
  return getCookie(COOKIE_KEYS.AUTH_TOKEN);
};

/**
 * Elimina el token de autenticación
 */
export const deleteAuthTokenCookie = (): void => {
  deleteCookie(COOKIE_KEYS.AUTH_TOKEN);
  deleteCookie(COOKIE_KEYS.REMEMBER_ME);
};

/**
 * Establece las preferencias del usuario
 */
export const setUserPreferencesCookie = (preferences: any): void => {
  setCookieForDays(COOKIE_KEYS.USER_PREFERENCES, JSON.stringify(preferences), 365);
};

/**
 * Obtiene las preferencias del usuario
 */
export const getUserPreferencesCookie = (): any => {
  const prefs = getCookie(COOKIE_KEYS.USER_PREFERENCES);
  return prefs ? JSON.parse(prefs) : {};
};

/**
 * Establece el progreso del tour
 */
export const setTourProgressCookie = (progress: any): void => {
  setCookieForDays(COOKIE_KEYS.TOUR_PROGRESS, JSON.stringify(progress), 365);
};

/**
 * Obtiene el progreso del tour
 */
export const getTourProgressCookie = (): any => {
  const progress = getCookie(COOKIE_KEYS.TOUR_PROGRESS);
  return progress ? JSON.parse(progress) : {};
};

/**
 * Establece los lugares favoritos del usuario
 */
export const setFavoritesCookie = (favorites: string[]): void => {
  setCookieForDays(COOKIE_KEYS.FAVORITES, JSON.stringify(favorites), 365);
};

/**
 * Obtiene los lugares favoritos del usuario
 */
export const getFavoritesCookie = (): string[] => {
  const favorites = getCookie(COOKIE_KEYS.FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
};

/**
 * Agrega un lugar a favoritos
 */
export const addToFavoritesCookie = (locationId: string): void => {
  const favorites = getFavoritesCookie();
  if (!favorites.includes(locationId)) {
    favorites.push(locationId);
    setFavoritesCookie(favorites);
  }
};

/**
 * Remueve un lugar de favoritos
 */
export const removeFromFavoritesCookie = (locationId: string): void => {
  const favorites = getFavoritesCookie();
  const updatedFavorites = favorites.filter(id => id !== locationId);
  setFavoritesCookie(updatedFavorites);
};

/**
 * Verifica si un lugar está en favoritos
 */
export const isFavoriteCookie = (locationId: string): boolean => {
  const favorites = getFavoritesCookie();
  return favorites.includes(locationId);
}; 
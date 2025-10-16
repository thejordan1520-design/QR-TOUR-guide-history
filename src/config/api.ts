// Configuración de API
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';
// Normalizar para evitar duplicar /api cuando los endpoints ya lo incluyen
const NORMALIZED_BASE = RAW_API_URL.replace(/\/?api\/?$/, '');

export const API_CONFIG = {
  BASE_URL: NORMALIZED_BASE,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile'
    },
    USER: {
      PROFILE: '/api/user/profile',
      PREFERENCES: '/api/user/preferences',
      SUBSCRIPTIONS: '/api/user/subscriptions',
      QR_HISTORY: '/api/user/qr-history'
    },
    CONTENT: {
      TEXTS: '/api/texts',
      PLACES: '/api/places',
      AUDIOS: '/api/audios'
    }
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default API_CONFIG;

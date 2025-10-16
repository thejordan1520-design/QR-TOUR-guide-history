import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar las traducciones directamente
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';

// Función para obtener el idioma desde localStorage o usar el idioma del navegador
const getInitialLanguage = (): string => {
  // Primero intentar obtener desde localStorage
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage && ['es', 'en', 'fr'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Si no hay idioma guardado, usar el idioma del navegador
  const browserLanguage = navigator.language.split('-')[0];
  if (['es', 'en', 'fr'].includes(browserLanguage)) {
    return browserLanguage;
  }
  
  // Fallback a español
  return 'es';
};

// Configuración de i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(), // Usar el idioma inicial detectado
    fallbackLng: 'es',
    debug: false,
    interpolation: {
      escapeValue: false, // react ya escapa por defecto
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      },
      fr: {
        translation: frTranslations
      }
    }
  });

// Función para cambiar idioma y guardar en localStorage
export const changeLanguage = (language: string) => {
  localStorage.setItem('i18nextLng', language);
  i18n.changeLanguage(language);
};

// Función para obtener el idioma actual
export const getCurrentLanguage = (): string => {
  return i18n.language || getInitialLanguage();
};

export default i18n; 
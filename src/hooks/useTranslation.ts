import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface TranslationCache {
  [key: string]: string;
}

export const useTranslation = (language: string = 'es') => {
  const [translations, setTranslations] = useState<TranslationCache>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar traducciones para el idioma especificado
  const loadTranslations = useCallback(async (lang: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc('get_translations_by_language', {
        p_language: lang
      });

      if (fetchError) {
        throw fetchError;
      }

      // Convertir array a objeto para acceso rápido
      const translationMap: TranslationCache = {};
      data?.forEach((item: any) => {
        translationMap[item.key] = item.value;
      });

      setTranslations(translationMap);
      console.log(`✅ Traducciones cargadas para ${lang}:`, Object.keys(translationMap).length);
    } catch (err) {
      console.error('❌ Error cargando traducciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTranslations({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener traducción
  const t = useCallback((key: string, fallback?: string): string => {
    // Si hay traducción disponible, usarla
    if (translations[key]) {
      return translations[key];
    }

    // Si hay fallback proporcionado, usarlo
    if (fallback) {
      return fallback;
    }

    // Si no hay traducción ni fallback, devolver la clave
    return key;
  }, [translations]);

  // Función para obtener traducción con parámetros
  const tWithParams = useCallback((key: string, params: Record<string, string | number>, fallback?: string): string => {
    let translation = t(key, fallback);
    
    // Reemplazar parámetros en la traducción
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translation = translation.replace(`{{${paramKey}}}`, String(paramValue));
    });

    return translation;
  }, [t]);

  // Función para obtener traducción con pluralización básica
  const tPlural = useCallback((key: string, count: number, fallback?: string): string => {
    const translation = t(key, fallback);
    
    // Si la traducción contiene "|", asumir formato de pluralización
    if (translation.includes('|')) {
      const parts = translation.split('|');
      if (count === 1 && parts.length >= 1) {
        return parts[0].trim();
      } else if (count !== 1 && parts.length >= 2) {
        return parts[1].trim();
      }
    }

    return translation;
  }, [t]);

  // Cargar traducciones cuando cambia el idioma
  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  return {
    t,
    tWithParams,
    tPlural,
    loading,
    error,
    translations,
    reloadTranslations: () => loadTranslations(language)
  };
};

// Hook para detectar idioma del navegador
export const useBrowserLanguage = () => {
  const [browserLanguage, setBrowserLanguage] = useState<string>('es');

  useEffect(() => {
    const detectLanguage = () => {
      const lang = navigator.language || navigator.languages?.[0] || 'es';
      // Extraer solo el código del idioma (ej: 'en-US' -> 'en')
      const languageCode = lang.split('-')[0];
      setBrowserLanguage(languageCode);
    };

    detectLanguage();
  }, []);

  return browserLanguage;
};

// Hook para gestión de idiomas
export const useLanguageManager = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('es');
  const [availableLanguages] = useState([
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]);

  const browserLanguage = useBrowserLanguage();

  // Cargar idioma desde localStorage o detectar del navegador
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else if (availableLanguages.some(lang => lang.code === browserLanguage)) {
      setCurrentLanguage(browserLanguage);
    }
  }, [browserLanguage, availableLanguages]);

  const changeLanguage = useCallback((languageCode: string) => {
    if (availableLanguages.some(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferred-language', languageCode);
    }
  }, [availableLanguages]);

  const getCurrentLanguageInfo = useCallback(() => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  }, [currentLanguage, availableLanguages]);

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    getCurrentLanguageInfo,
    browserLanguage
  };
};




import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface WebTextsContextType {
  texts: Record<string, string>;
  getText: (key: string) => string;
  loading: boolean;
  lang: string;
  setLang: (lang: string) => void;
}

const WebTextsContext = createContext<WebTextsContextType | undefined>(undefined);

export const WebTextsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Usar el idioma actual de i18next
  const lang = i18n.language || 'es';

  const setLang = (newLang: string) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Cargar textos desde Supabase (opcional)
  useEffect(() => {
    const loadTexts = async () => {
      setLoading(true);
      try {
        // Usar fallback inmediatamente para evitar loading infinito
        const fallbackTexts: Record<string, string> = {
          'welcome_title': lang === 'en' ? 'Welcome to QR Tour' : 'Bienvenido a QR Tour',
          'welcome_subtitle': lang === 'en' ? 'Discover the history of Dominican Republic' : 'Descubre la historia de República Dominicana',
          'login_button': lang === 'en' ? 'Login' : 'Iniciar Sesión',
          'register_button': lang === 'en' ? 'Register' : 'Registrarse',
          'home_title': lang === 'en' ? 'Home' : 'Inicio',
          'audioLibrary.title': lang === 'en' ? 'Audio Library' : 'Biblioteca de Audio',
          'audioLibrary.subtitle': lang === 'en' ? 'Explore the history of Puerto Plata through professional narrations in multiple languages.' : 'Explora la historia de Puerto Plata a través de narraciones profesionales en múltiples idiomas.',
          'audioLibrary.defaultDuration': lang === 'en' ? '1-2 min' : '1-2 min'
        };
        setTexts(fallbackTexts);
        
        // Intentar cargar desde Supabase en segundo plano (opcional)
        // Comentado temporalmente para evitar errores de importación
        /*
        try {
          const services = await import('../supabaseServices') as any;
          const { data, error } = await services.webTextsService.getWebTextsByLanguage(lang);
          
          if (!error && data) {
            const map: Record<string, string> = {};
            (data || []).forEach((t: any) => { map[t.key] = t.value; });
            setTexts(map);
          }
        } catch (supabaseError: any) {
          console.log('Supabase not available, using fallback texts:', supabaseError.message);
        }
        */
      } catch (error: any) {
        console.log('Backend not available, using local translations:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadTexts();
  }, [lang]);

  const getText = (key: string) => {
    // Primero intentar con react-i18next
    if (t(key) !== key) {
      return t(key);
    }
    
    // Luego intentar con textos cargados
    if (texts[key]) return texts[key];
    
    // Fallback a traducciones hardcodeadas si no se encuentra
    const fallbackTranslations: Record<string, Record<string, string>> = {
      es: {
        'welcome_title': 'Bienvenido a QR Tour',
        'welcome_subtitle': 'Descubre la historia de República Dominicana',
        'login_button': 'Iniciar Sesión',
        'register_button': 'Registrarse',
        'home_title': 'Inicio',
        'audioLibrary.title': 'Biblioteca de Audio',
        'audioLibrary.subtitle': 'Explora la historia de Puerto Plata a través de narraciones profesionales en múltiples idiomas.',
        'audioLibrary.defaultDuration': '1-2 min'
      },
      en: {
        'welcome_title': 'Welcome to QR Tour',
        'welcome_subtitle': 'Discover the history of Dominican Republic',
        'login_button': 'Login',
        'register_button': 'Register',
        'home_title': 'Home',
        'audioLibrary.title': 'Audio Library',
        'audioLibrary.subtitle': 'Explore the history of Puerto Plata through professional narrations in multiple languages.',
        'audioLibrary.defaultDuration': '1-2 min'
      }
    };
    
    return fallbackTranslations[lang]?.[key] || key;
  };

  const value: WebTextsContextType = {
    texts,
    getText,
    loading,
    lang,
    setLang
  };

  return (
    <WebTextsContext.Provider value={value}>
      {children}
    </WebTextsContext.Provider>
  );
};

export const useWebTexts = () => {
  const context = useContext(WebTextsContext);
  if (context === undefined) {
    throw new Error('useWebTexts must be used within a WebTextsProvider');
  }
  return context;
};
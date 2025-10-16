import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation, useLanguageManager } from '../hooks/useTranslation';

interface TranslationContextType {
  t: (key: string, fallback?: string) => string;
  tWithParams: (key: string, params: Record<string, string | number>, fallback?: string) => string;
  tPlural: (key: string, count: number, fallback?: string) => string;
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  availableLanguages: Array<{ code: string; name: string; flag: string }>;
  loading: boolean;
  error: string | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const { t, tWithParams, tPlural, loading, error } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguageManager();

  const value: TranslationContextType = {
    t,
    tWithParams,
    tPlural,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    loading,
    error
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};

// Hook de conveniencia para usar traducciones
export const useT = () => {
  const { t, tWithParams, tPlural } = useTranslationContext();
  return { t, tWithParams, tPlural };
};








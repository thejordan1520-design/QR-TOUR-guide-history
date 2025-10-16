import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'buttons';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showLabel = true,
  variant = 'dropdown'
}) => {
  const { i18n } = useTranslation();
  
  // Solo los 3 idiomas que queremos
  const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const currentLanguage = i18n.language || 'es';

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {false && (
          <span className="text-sm font-medium text-gray-700">Idioma:</span>
        )}
        <div className="flex space-x-1">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={lang.name}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {false && (
        <span className="text-sm font-medium text-gray-700">Idioma:</span>
      )}
      <div className="relative">
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Globe className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
import React, { useState, useEffect } from 'react';
import { useCookies, useLanguageCookie, useThemeCookie, useFavoritesCookie } from '../../hooks/useCookies';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Heart, 
  Volume2, 
  VolumeX,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';

const UserPreferences: React.FC = () => {
  const { theme, setTheme } = useThemeCookie();
  const { language, setLanguage } = useLanguageCookie();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoritesCookie();
  const { setCookie, getCookie } = useCookies();
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return getCookie('sound_enabled') === 'true';
  });
  
  const [offlineMode, setOfflineMode] = useState(() => {
    return getCookie('offline_mode') === 'true';
  });

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    setCookie('sound_enabled', newValue.toString(), { expires: 365 });
  };

  const handleOfflineModeToggle = () => {
    const newValue = !offlineMode;
    setOfflineMode(newValue);
    setCookie('offline_mode', newValue.toString(), { expires: 365 });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleFavoriteToggle = (locationId: string) => {
    if (isFavorite(locationId)) {
      removeFromFavorites(locationId);
    } else {
      addToFavorites(locationId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Preferencias del Usuario</h2>
      </div>

      {/* Idioma */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Idioma</h3>
        </div>
        <div className="flex gap-2">
          {[
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                language === lang.code
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg mr-1">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tema */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {theme === 'dark' ? (
            <Moon className="h-5 w-5 text-gray-600" />
          ) : (
            <Sun className="h-5 w-5 text-gray-600" />
          )}
          <h3 className="font-medium text-gray-900">Tema</h3>
        </div>
        <button
          onClick={handleThemeChange}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Moon className="h-4 w-4" />
              Modo Oscuro
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              Modo Claro
            </>
          )}
        </button>
      </div>

      {/* Sonido */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-gray-600" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-600" />
          )}
          <h3 className="font-medium text-gray-900">Sonido</h3>
        </div>
        <button
          onClick={handleSoundToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            soundEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4" />
              Activado
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4" />
              Desactivado
            </>
          )}
        </button>
      </div>

      {/* Modo Offline */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {offlineMode ? (
            <WifiOff className="h-5 w-5 text-gray-600" />
          ) : (
            <Wifi className="h-5 w-5 text-gray-600" />
          )}
          <h3 className="font-medium text-gray-900">Modo Offline</h3>
        </div>
        <button
          onClick={handleOfflineModeToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            offlineMode
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {offlineMode ? (
            <>
              <WifiOff className="h-4 w-4" />
              Activado
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4" />
              Desactivado
            </>
          )}
        </button>
      </div>

      {/* Favoritos */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Lugares Favoritos</h3>
        </div>
        <div className="space-y-2">
          {[
            { id: 'fortaleza-san-felipe', name: 'Fortaleza San Felipe' },
            { id: 'museo-ambar', name: 'Museo del Ámbar' },
            { id: 'teleferico-puerto-plata', name: 'Teleférico' }
          ].map((location) => (
            <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{location.name}</span>
              <button
                onClick={() => handleFavoriteToggle(location.id)}
                className={`p-1 rounded transition-colors ${
                  isFavorite(location.id)
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite(location.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {favorites.length} lugar{favorites.length !== 1 ? 'es' : ''} en favoritos
        </p>
      </div>

      {/* Información de Cookies */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🍪 Información de Cookies</h4>
        <p className="text-sm text-blue-800">
          Todas estas preferencias se guardan en cookies para recordar tus elecciones 
          entre sesiones. Puedes cambiar estas configuraciones en cualquier momento.
        </p>
      </div>
    </div>
  );
};

export default UserPreferences; 
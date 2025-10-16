import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useAudioModal } from '../hooks/useAudioModal';
import { X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import LimitedAudioPlayer from '../components/ui/LimitedAudioPlayer';

const AudioModalPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Usar el hook optimizado para cargar datos de la ubicación
  const { location, loading, error } = useAudioModal(locationId);

  // Redirigir si hay error o no se encuentra la ubicación
  useEffect(() => {
    if (error || (!loading && !location)) {
      navigate('/biblioteca-react');
    }
  }, [error, loading, location, navigate]);

  const hasFullAccess = () => {
    // Por ahora, todos los usuarios autenticados tienen acceso completo
    return !!user;
  };

  const handleClose = () => {
    navigate('/biblioteca-react');
  };

  const handleBackToLibrary = () => {
    navigate('/biblioteca-react');
  };

  // Control de audio - solo un audio a la vez
  useEffect(() => {
    const handlePlay = (e: Event) => {
      if (e.target instanceof HTMLAudioElement) {
        document.querySelectorAll('audio').forEach(audio => {
          if (audio !== e.target) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      }
    };

    document.addEventListener('play', handlePlay, true);
    return () => document.removeEventListener('play', handlePlay, true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.locationNotFound')}</h2>
          <button
            onClick={handleBackToLibrary}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.backToLibrary')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header con botón de regreso */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToLibrary}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('common.backToLibrary')}</span>
            </button>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del modal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="relative p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{location.name}</h2>
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-80 object-cover rounded-xl mb-4"
                onError={(e) => {
                  e.currentTarget.src = '/places/placeholder.jpg';
                }}
              />
              <p className="text-gray-700 mb-4 text-lg">{location.description}</p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-xl">{t('audioLibrary.history')}</h4>
                <p className="text-gray-700">{location.history}</p>
              </div>
            </div>

            {/* Sección de audios */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{t('audioLibrary.narrations')}</h3>

              {location.audioConfigs && (
                <div className="space-y-6">
                  {location.audioConfigs.spanish && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-medium text-blue-900 mb-3 text-lg">🇪🇸 {t('audioLibrary.languages.spanish')}</h4>
                      <LimitedAudioPlayer
                        src={location.audioConfigs.spanish}
                        title={location.name}
                        subtitle={t('audioLibrary.languages.spanish')}
                        language={t('audioLibrary.languages.spanish')}
                        audioId={`${location.id}-spanish`}
                      />
                    </div>
                  )}

                  {location.audioConfigs.english && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-medium text-green-900 mb-3 text-lg">🇬🇧 {t('audioLibrary.languages.english')}</h4>
                      <LimitedAudioPlayer
                        src={location.audioConfigs.english}
                        title={location.name}
                        subtitle={t('audioLibrary.languages.english')}
                        language={t('audioLibrary.languages.english')}
                        audioId={`${location.id}-english`}
                      />
                    </div>
                  )}

                  {location.audioConfigs.french && (
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h4 className="font-medium text-purple-900 mb-3 text-lg">🇫🇷 {t('audioLibrary.languages.french')}</h4>
                      <LimitedAudioPlayer
                        src={location.audioConfigs.french}
                        title={location.name}
                        subtitle={t('audioLibrary.languages.french')}
                        language="Français"
                        audioId={`${location.id}-french`}
                      />
                    </div>
                  )}
                </div>
              )}

              {!hasFullAccess() && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-center text-white">
                  <h4 className="text-xl font-semibold mb-3">{t('audioLibrary.premiumTitle')}</h4>
                  <p className="mb-6 text-lg">{t('audioLibrary.premiumMsg')}</p>
                  <button
                    onClick={() => navigate('/subscribe')}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
                  >
                    {t('audioLibrary.premiumBtn')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AudioModalPage; 
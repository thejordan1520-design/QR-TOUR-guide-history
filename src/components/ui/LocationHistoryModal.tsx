import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import { useTranslation } from 'react-i18next';
import { getAudioConfig, getAvailableAudios } from '../../config/audioConfig';

// Hook personalizado para detectar cambios de idioma
const useLanguageChange = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  return language;
};

// Componente para reproductores de audio multilingües con límite de demo
interface MultilingualAudioPlayerProps {
  language: string;
  src: string;
  demoTimeLimit: number;
  hasFullAccess: () => boolean;
  t: (key: string) => string;
}

const MultilingualAudioPlayer: React.FC<MultilingualAudioPlayerProps> = ({
  language,
  src,
  demoTimeLimit,
  hasFullAccess,
  t
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDemoLimit, setShowDemoLimit] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTimeValue = audioRef.current.currentTime;
      setCurrentTime(currentTimeValue);
      
      // Verificar límite de 10 segundos para usuarios no suscritos
      if (!hasFullAccess() && currentTimeValue >= demoTimeLimit) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setShowDemoLimit(true);
        setCurrentTime(0);
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Detener otros audios
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      // Resetear estado de demo limit
      setShowDemoLimit(false);
      
      // Establecer volumen al máximo (100%)
      audioRef.current.volume = 1.0;
      
      audioRef.current.play().catch(error => {
        console.error('Error reproduciendo audio:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{t(language)}</h4>
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        {/* Audio element */}
        <audio 
          ref={audioRef} 
          src={src} 
          preload="metadata" 
          controls={false}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
          <h5 className="text-sm font-bold mb-1">{t(language)}</h5>
          <p className="text-green-100 text-xs">{`${t('duration')}: ${formatTime(duration)}`}</p>
          {!hasFullAccess() && (
            <div className="mt-1 bg-yellow-400/20 rounded p-1">
              <p className="text-yellow-200 text-xs font-medium">
                ⏱️ {t('demoLimit')}: {demoTimeLimit}s / {t('fullAudio')}
              </p>
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="p-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
              }}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
              title={t('retroceder10s') || 'Retroceder 10s'}
            >⏪ 10s</button>
            <button
              onClick={handlePlayPause}
              className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl mx-4"
              style={{ minWidth: 56, minHeight: 56 }}
            >
              {isPlaying ? (
                <div className="h-8 w-8 flex items-center justify-center">
                  <div className="w-3 h-8 border-l-4 border-r-4 border-white"></div>
                </div>
              ) : (
                <div className="h-8 w-8 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                </div>
              )}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
              }}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
              title={t('avanzar10s') || 'Avanzar 10s'}
            >10s ⏩</button>
            <select
              className="ml-2 px-2 py-1 rounded border text-xs bg-white"
              value={audioRef.current?.playbackRate || 1}
              onChange={e => {
                if (audioRef.current) audioRef.current.playbackRate = Number(e.target.value);
              }}
              style={{ minWidth: 60 }}
              title={t('velocidad') || 'Velocidad'}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{duration ? formatTime(duration) : '--:--'}</span>
            </div>
            <div className="relative">
              <div className="w-full h-1.5 bg-gray-200 rounded-lg">
                <div 
                  className="h-1.5 bg-green-500 rounded-lg transition-all duration-100"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                {!hasFullAccess() && (
                  <div 
                    className="absolute top-0 h-1.5 bg-yellow-400 opacity-60 rounded-lg"
                    style={{ width: `${(demoTimeLimit / (duration || 1)) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Demo Limit Warning */}
          {showDemoLimit && !hasFullAccess() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <h3 className="text-xs font-medium text-yellow-800">
                    {t('demoTimeLimitReached')}
                  </h3>
                  <div className="mt-1 text-xs text-yellow-700">
                    <p>{t('subscribeToListenFullAudio')}</p>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        window.location.href = '/subscribe';
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded text-xs font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
                    >
                      {t('getPremiumAccess')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LocationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    id: string;
    name: string;
    image: string;
    description: string;
    rating: number;
    duration: string;
    history: string;
    audio: string;
    audios?: {
      es?: string;
      en?: string;
      fr?: string;
    };
  } | null;
}

const LocationHistoryModal: React.FC<LocationHistoryModalProps> = ({ isOpen, onClose, location }) => {
  const { t, i18n, ready } = useTranslation();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Forzar actualización cuando cambia el idioma
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      setForceUpdate(prev => prev + 1);
      // Forzar reload de traducciones
      i18n.reloadResources(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  const { pauseAllAudios, hasFullAccess } = useAudio();

  const [showPremiumPrompt, setShowPremiumPrompt] = React.useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDemoLimit, setShowDemoLimit] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const demoTimeLimit = 10; // 10 segundos para usuarios no suscritos

  // LAZY AUDIO: Solo renderizar audios cuando el modal está abierto
  const [showAudios, setShowAudios] = useState(false);
  useEffect(() => {
    if (isOpen) setShowAudios(true);
    else setShowAudios(false);
  }, [isOpen]);

  // MODAL ESC: Cerrar modal con tecla Escape y clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (e.target && (e.target as HTMLElement).classList.contains('modal-bg')) onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  // CLEANUP: Limpiar audios al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      document.querySelectorAll('.location-modal-audio').forEach(audio => {
        (audio as HTMLAudioElement).pause();
        (audio as HTMLAudioElement).currentTime = 0;
      });
    }
  }, [isOpen]);

  if (!isOpen || !location) return null;

  // audio principal (por compatibilidad) y audios por idioma del mismo origen que BibliotecaReact
  const audioUrl = location.audio;
  // intentar localizar el destino completo si la Home pasó solo el mínimo
  // Nota: evitamos imports circulares; el modal recibe ya el objeto y fallbacks abajo cubren i18n

  console.log('LocationHistoryModal - Audio URL:', audioUrl);
  console.log('LocationHistoryModal - Location:', location);

  // Control de audio funcional
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Detener otros audios
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      // Resetear estado de demo limit
      setShowDemoLimit(false);
      
      // Establecer volumen al máximo (100%)
      audioRef.current.volume = 1.0;
      
      console.log('Reproduciendo audio:', audioUrl);
      audioRef.current.play().catch(error => {
        console.error('Error reproduciendo audio:', error);
      });
    setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTimeValue = audioRef.current.currentTime;
      setCurrentTime(currentTimeValue);
      
      // Verificar límite de 10 segundos para usuarios no suscritos
      if (!hasFullAccess() && currentTimeValue >= demoTimeLimit) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setShowDemoLimit(true);
        setCurrentTime(0);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      key={`${location?.id}-${currentLanguage}-${forceUpdate}`}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-200${isOpen ? '' : ' hidden'}`}
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-xl md:max-w-xl h-[90vh] md:h-auto max-h-[90vh] overflow-y-auto relative flex flex-col mx-2 my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle visual para móvil */}
        <div className="flex justify-center md:hidden pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <button className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white transition-colors duration-200 z-10" onClick={onClose}>
          <X className="h-5 w-5 text-gray-700" />
        </button>
        {/* Header */}
          <div className="relative">
            <img
              src={location.image}
              alt={t(`locations.${location.id}.name`, { defaultValue: location.name })}
            className="w-full h-40 md:h-56 object-cover rounded-t-2xl"
            />
          <h2 className="absolute top-3 left-4 text-lg md:text-xl font-bold text-white drop-shadow-lg px-2 py-1">
              {t(`locations.${location.id}.name`, { defaultValue: location.name })}
            </h2>
          <div className="absolute bottom-3 left-4 flex items-center space-x-1 text-xs md:text-sm">
              <Clock className="h-4 w-4 text-blue-200" />
              <span className="text-white drop-shadow">{location.duration || '0 min'}</span>
          </div>
        </div>
        {/* Content */}
        <div className="p-3 md:p-5 space-y-4 flex-1 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{t('description_title')}</h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {t(`locations.${location.id}.description`, { defaultValue: location.description })}
            </p>
          </div>
          {/* History */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{t('history_title')}</h3>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              {t(`locations.${location.id}.history`, { defaultValue: location.history })}
            </p>
          </div>
          {/* Audio Player */}
            <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">{t('audio_guide_title')}</h3>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <audio
                ref={audioRef}
                src={location.audio}
                preload="metadata"
                controls={false}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="location-modal-audio"
              />
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 md:p-6">
                <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">{`${t('history_of')} ${location.name}`}</h3>
                <p className="text-blue-100 text-xs md:text-sm">{`${t('duration')}: ${location.duration}`}</p>
                {!hasFullAccess() && (
                  <div className="mt-1 md:mt-2 bg-yellow-400/20 rounded-lg p-1 md:p-2">
                    <p className="text-yellow-200 text-xs font-medium">
                      {t('demoLimit')}: 10s / {t('fullAudio')}
                    </p>
                  </div>
                )}
            </div>
              {/* Player Controls */}
              <div className="p-6">
                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                    }}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
                    title={t('retroceder10s') || 'Retroceder 10s'}
                  >⏪ 10s</button>
                  <button
                    onClick={handlePlayPause}
                    className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl mx-4"
                    style={{ minWidth: 56, minHeight: 56 }}
                  >
                    {isPlaying ? (
                      <div className="h-8 w-8 flex items-center justify-center">
                        <div className="w-3 h-8 border-l-4 border-r-4 border-white"></div>
                      </div>
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
                    }}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
                    title={t('avanzar10s') || 'Avanzar 10s'}
                  >10s ⏩</button>
                  <select
                    className="ml-2 px-2 py-1 rounded border text-xs bg-white"
                    value={audioRef.current?.playbackRate || 1}
                    onChange={e => {
                      if (audioRef.current) audioRef.current.playbackRate = Number(e.target.value);
                    }}
                    style={{ minWidth: 60 }}
                    title={t('velocidad') || 'Velocidad'}
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration ? formatTime(duration) : '--:--'}</span>
              </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-lg">
                      <div 
                        className="h-2 bg-blue-500 rounded-lg transition-all duration-100"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                      {!hasFullAccess() && (
                        <div 
                          className="absolute top-0 h-2 bg-yellow-400 opacity-60 rounded-lg"
                          style={{ width: `${(demoTimeLimit / (duration || 1)) * 100}%` }}
                        />
                      )}
              </div>
              </div>
            </div>

                {/* Demo Limit Warning */}
                {showDemoLimit && !hasFullAccess() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
              </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          {t('demoTimeLimitReached')}
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>{t('subscribeToListenFullAudio')}</p>
              </div>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              onClose();
                              window.location.href = '/subscribe';
                            }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
                          >
                            {t('getPremiumAccess')}
                          </button>
              </div>
            </div>
              </div>
            </div>
          )}
              </div>
            </div>
              </div>

          {/* --- Reproductores de audio por idioma --- */}
          {showAudios && (
            <div className="space-y-3 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('audioInDifferentLanguages')}</h3>
              {(location.audios && Object.entries(location.audios).filter(([,src]) => !!src).length > 0
                ? Object.entries(location.audios).filter(([,src]) => !!src).map(([language, src]) => ({ language, src }))
                : getAvailableAudios(location.id)
              ).map(({ language, src }) => (
                <MultilingualAudioPlayer 
                  key={language}
                  language={language}
                  src={src}
                  demoTimeLimit={demoTimeLimit}
                  hasFullAccess={hasFullAccess}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// FEEDBACK PLAY: Componente de audio con feedback visual
const AudioPlayerWithFeedback = ({ src, t, hasFullAccess, demoTimeLimit, language }: any) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoLimit, setShowDemoLimit] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      document.querySelectorAll('.location-modal-audio').forEach(audio => {
        if (audio !== audioRef.current) {
          (audio as HTMLAudioElement).pause();
          (audio as HTMLAudioElement).currentTime = 0;
        }
      });
      setShowDemoLimit(false);
      audioRef.current.play().catch(() => setIsLoading(false));
    }
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleCanPlay = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTimeValue = audioRef.current.currentTime;
      setCurrentTime(currentTimeValue);
      if (!hasFullAccess() && currentTimeValue >= demoTimeLimit) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setShowDemoLimit(true);
        setCurrentTime(0);
      }
    }
  };
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  return (
    <div className="audio-player-block">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        controls={false}
        className="location-modal-audio"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button onClick={handlePlayPause} className="audio-play-btn">
        {isLoading ? 'Cargando...' : isPlaying ? '⏸️' : '▶️'}
      </button>
      {/* ...barra de progreso, controles, feedback visual, etc... */}
      {showDemoLimit && !hasFullAccess() && (
        <div className="demo-limit-msg">{t('demoTimeLimitReached')}</div>
      )}
    </div>
  );
};

export default LocationHistoryModal;
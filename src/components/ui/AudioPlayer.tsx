import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { useTranslation } from 'react-i18next';
import { getOfflineUrl } from '../../utils/offlineStorage';
import { useUserAccess } from '../../hooks/useUserAccess';
import AudioAccessControl from './AudioAccessControl';

interface AudioPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
  autoPlay?: boolean;
  audioId?: string; // ID único para el control global
  offlineMode?: boolean; // Nuevo prop
  // showDownload?: boolean; // Eliminado
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  subtitle,
  autoPlay = false,
  audioId,
  offlineMode = false,
  // showDownload = false // Eliminado
}) => {
  const { playAudio, stopAudio, currentAudioId, isPlaying: globalIsPlaying } = useAudio();
  const { hasAudioAccess, isLoading: accessLoading } = useUserAccess();
  const [isFreeEnded, setIsFreeEnded] = useState(false);
  const FREE_AUDIO_SECONDS = 10; // segundos gratis permitidos
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t } = useTranslation();
  const [resolvedSrc, setResolvedSrc] = useState(src);


  useEffect(() => {
    let isMounted = true;
    getOfflineUrl(src, offlineMode).then(url => {
      if (isMounted) setResolvedSrc(url);
    });
    return () => { isMounted = false; };
  }, [src, offlineMode]);

  const isCurrentAudio = audioId && currentAudioId === audioId;
  const isPlaying = isCurrentAudio && globalIsPlaying;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configurar el audio para evitar el registro en el control de medios del navegador
    audio.setAttribute('data-media-session', 'false');
    audio.setAttribute('data-no-media-session', 'true');

    // Deshabilitar el Media Session API para este elemento
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {});
      navigator.mediaSession.setActionHandler('pause', () => {});
      navigator.mediaSession.setActionHandler('stop', () => {});
    }

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
      if (autoPlay) {
        audio.play().catch(console.error);
      }
    };

      const handleTimeUpdate = () => {
    setCurrentTime(audio.currentTime);
    // Limitar audio gratis para usuarios sin acceso completo
    if (!isPremiumUser() && audio.currentTime >= FREE_AUDIO_SECONDS) {
      audio.pause();
      setIsFreeEnded(true);
    }
  };

    const handlePlay = () => {
      // El estado de reproducción se maneja globalmente
      // Asegurar que no se registre en el control de medios del navegador
      audio.setAttribute('data-media-session', 'false');
    };
    const handlePause = () => {
      // El estado de reproducción se maneja globalmente
    };
    const handleEnded = () => {
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || isLoading || !audioId) return;

    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(audioId, audio);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = Number(e.target.value) / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;


  if (!isPremiumUser()) {
    if (isFreeEnded) {
      return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8 text-center">
          <div className="text-lg font-semibold text-blue-700 mb-4">{t('audio.freeEnded.title')}</div>
          <div className="text-gray-700 mb-6">{t('audio.freeEnded.description')}</div>
          {/* Botón de suscripción */}
          <div className="mb-4">
            <button
              onClick={() => window.location.href = '/subscribe?plan=basic-24h&autoPay=true'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg w-full"
            >
              {t('audio.freeEnded.button')}
            </button>
          </div>
          <div className="text-sm">
            <a href="/subscribe" className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200">
              {t('audio.freeEnded.morePlans')}
            </a>
          </div>
        </div>
      );
    }
    // Mostrar el reproductor pero solo permitir X segundos
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={resolvedSrc} 
        preload="metadata" 
        controls={false}
        style={{ display: 'none' }}
        data-media-session="false"
        data-no-media-session="true"
        onPlay={(e) => {
          // Evitar que se registre en el control de medios del navegador
          e.currentTarget.setAttribute('data-media-session', 'false');
        }}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {subtitle && (
          <p className="text-blue-100 text-sm">{subtitle}</p>
        )}
      </div>

      {/* Player Controls */}
      <div className="p-6">
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={restart}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            disabled={isLoading}
          >
            <RotateCcw className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-8 w-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>

          {/* Botón de descarga eliminado */}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : '--:--'}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              disabled={isLoading || duration === 0}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`
              }}
            />
            {!isPremiumUser() && duration > 0 && (
              <div 
                className="absolute top-0 h-2 bg-red-500 opacity-40 rounded-lg pointer-events-none"
                style={{ width: `${Math.min((FREE_AUDIO_SECONDS / duration) * 100, 100)}%` }}
              />
            )}
          </div>
          {!isPremiumUser() && (
            <div className="text-xs text-amber-600 text-center">
              ⏱️ {t('audio.demoLimit')}: {FREE_AUDIO_SECONDS}s / {t('audio.fullAudio')}
            </div>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Volume2 className="h-5 w-5 text-gray-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${volume * 100}%, #E5E7EB ${volume * 100}%, #E5E7EB 100%)`
            }}
          />
          <span className="text-sm text-gray-500 w-12">{Math.round(volume * 100)}%</span>
        </div>

        {/* Status */}
        {isLoading && (
          <div className="text-center text-sm text-gray-500 mt-4">
            {t('audio.loading')}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <AudioAccessControl>
        {/* Contenido del reproductor de audio */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>

          <audio
            ref={audioRef}
            src={resolvedSrc}
            preload="metadata"
          />

          {/* Controles del reproductor */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }
              }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Rebobinar 10 segundos"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                if (isPlaying) {
                  audioRef.current?.pause();
                } else {
                  audioRef.current?.play();
                }
              }}
              disabled={isLoading}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </AudioAccessControl>
    </div>
  );
};

export default AudioPlayer;
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';

interface LimitedAudioPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
  language?: string;
  autoPlay?: boolean;
  audioId?: string;
}

const LimitedAudioPlayer: React.FC<LimitedAudioPlayerProps> = ({
  src,
  title,
  subtitle,
  language = 'Spanish',
  autoPlay = false,
  audioId
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPremiumUser } = useAudio();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [showDemoLimit, setShowDemoLimit] = useState(false);
  const [demoEnded, setDemoEnded] = useState(false);

  
  const audioRef = useRef<HTMLAudioElement>(null);
  const FREE_AUDIO_SECONDS = 10;

  const isPremium = isPremiumUser();


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
      if (autoPlay && isPremium) {
        audio.play().catch(console.error);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Limitar audio para usuarios no premium
      if (!isPremium && audio.currentTime >= FREE_AUDIO_SECONDS) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setDemoEnded(true);
        setShowDemoLimit(true);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setShowDemoLimit(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
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
  }, [autoPlay, isPremium, FREE_AUDIO_SECONDS]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Detener otros audios
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      setShowDemoLimit(false);
      setDemoEnded(false);
      audioRef.current.play().catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !isPremium) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setDemoEnded(false);
    setShowDemoLimit(false);
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const demoProgress = duration > 0 ? (FREE_AUDIO_SECONDS / duration) * 100 : 0;

  // Si el demo terminó, mostrar mensaje de suscripción
  if (demoEnded && !isPremium) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6 text-center">
        <div className="text-lg font-semibold text-blue-700 mb-4 flex items-center justify-center">
          <Lock className="h-5 w-5 mr-2" />
          {t('audio.freeEnded.title')}
        </div>
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata" 
        controls={false}
        style={{ display: 'none' }}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4">
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        {subtitle && (
          <p className="text-blue-100 text-sm">{subtitle}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-blue-100">{language}</span>
          {!isPremium && (
            <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded">
              ⏱️ {t('audio.demoLimit')}: {FREE_AUDIO_SECONDS}s
            </span>
          )}
        </div>
      </div>

      {/* Player Controls */}
      <div className="p-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={restart}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
          
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-0.5" />
            )}
          </button>
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
              disabled={isLoading || duration === 0 || !isPremium}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`
              }}
            />
            {!isPremium && duration > 0 && (
              <div 
                className="absolute top-0 h-2 bg-red-500 opacity-40 rounded-lg pointer-events-none"
                style={{ width: `${Math.min(demoProgress, 100)}%` }}
              />
            )}
          </div>
          {!isPremium && (
            <div className="text-xs text-amber-600 text-center">
              ⏱️ {t('audio.demoLimit')}: {FREE_AUDIO_SECONDS}s / {t('audio.fullAudio')}
            </div>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Volume2 className="h-4 w-4 text-gray-600" />
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
          <span className="text-sm text-gray-500 w-10">{Math.round(volume * 100)}%</span>
        </div>

        {/* Demo Limit Warning */}
        {showDemoLimit && !isPremium && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-yellow-800">
                  {t('audio.freeEnded.title')}
                </h3>
                <div className="mt-1 text-xs text-yellow-700">
                  <p>{t('audio.freeEnded.description')}</p>
                </div>
                <div className="mt-2 space-y-1">
                  {/* Botón de suscripción para advertencia */}
                  <button
                    onClick={() => window.location.href = '/subscribe?plan=basic-24h&autoPay=true'}
                    className="bg-yellow-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-yellow-700 transition-colors w-full"
                  >
                    {t('audio.freeEnded.button')}
                  </button>
                  <div className="text-xs">
                    <a href="/subscribe" className="text-yellow-700 hover:text-yellow-900 underline transition-colors duration-200">
                      {t('audio.freeEnded.morePlans')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        {isLoading && (
          <div className="text-center text-sm text-gray-500 mt-3">
            {t('audio.loading')}
          </div>
        )}
      </div>

    </div>
  );

  return audioPlayer;
};

export default LimitedAudioPlayer; 
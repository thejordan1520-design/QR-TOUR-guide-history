import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useOfflinePremium } from '../hooks/useOfflinePremium';

interface AudioContextType {
  currentAudioId: string | null;
  isPlaying: boolean;
  playAudio: (audioId: string, audioElement: HTMLAudioElement) => void;
  stopAudio: () => void;
  pauseAllAudios: () => void;
  hasFullAccess: () => boolean;
  isPremiumUser: () => boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Usar try-catch para manejar errores de contexto de forma segura
  let user = null;
  let authContext = null;
  try {
    authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    console.warn('⚠️ AudioProvider: Contexto de autenticación no disponible (no crítico):', error);
    user = null;
    authContext = null;
  }
  
  const { isPremium: offlineIsPremium } = useOfflinePremium();
  
  // Verificar si el usuario tiene acceso premium REAL
  const authIsPremiumUser = (): boolean => {
    if (!authContext || !user) {
      console.log('🔒 AudioContext: No hay contexto de autenticación disponible');
      return false;
    }
    
    // Los admins siempre tienen acceso completo
    if (user.is_admin) {
      console.log('✅ AudioContext: Usuario es admin - acceso completo');
      return true;
    }
    
    // Verificar si tiene suscripción premium activa
    if (user.isSubscribed && user.endTime) {
      const expirationDate = new Date(user.endTime);
      const now = new Date();
      const isActive = expirationDate > now;
      
      console.log(`${isActive ? '✅' : '❌'} AudioContext: Plan premium`, {
        email: user.email,
        expires: user.endTime,
        isActive,
        daysRemaining: Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      });
      
      return isActive;
    }
    
    console.log('❌ AudioContext: Usuario free - sin acceso premium', {
      email: user.email,
      isSubscribed: user.isSubscribed,
      endTime: user.endTime
    });
    
    return false;
  };

  const hasFullAccess = (): boolean => {
    // Verificar acceso online
    if (authIsPremiumUser()) {
      return true;
    }
    
    // Verificar acceso offline
    if (offlineIsPremium) {
      return true;
    }
    
    return false;
  };

  const isPremiumUserAudio = (): boolean => {
    return hasFullAccess();
  };

  const playAudio = (audioId: string, audioElement: HTMLAudioElement) => {
    // Si hay un audio reproduciéndose, detenerlo primero
    if (currentAudioRef.current && currentAudioRef.current !== audioElement) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // Configurar el nuevo audio
    currentAudioRef.current = audioElement;
    setCurrentAudioId(audioId);
    setIsPlaying(true);

    // Configurar el audio para que no aparezca en el control de medios del navegador
    audioElement.controls = false;
    audioElement.preload = 'auto';
    audioElement.setAttribute('data-media-session', 'false');
    audioElement.setAttribute('data-no-media-session', 'true');

    // Reproducir el audio
    audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentAudioId(null);
    });
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setCurrentAudioId(null);
    setIsPlaying(false);
    currentAudioRef.current = null;
  };

  const pauseAllAudios = () => {
    stopAudio();
  };

  return (
    <AudioContext.Provider value={{
      currentAudioId,
      isPlaying,
      playAudio,
      stopAudio,
      pauseAllAudios,
      hasFullAccess,
      isPremiumUser: isPremiumUserAudio
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default useAudio; 
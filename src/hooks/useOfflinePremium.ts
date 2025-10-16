import { useState, useEffect } from 'react';
import { checkOfflinePremiumStatus, getOfflineUserData, isOfflineMode } from '../utils/offlineStorage';

export const useOfflinePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineUser, setOfflineUser] = useState<any>(null);

  useEffect(() => {
    const checkStatus = () => {
      const offline = isOfflineMode();
      setIsOffline(offline);
      
      if (offline) {
        const premiumStatus = checkOfflinePremiumStatus();
        const userData = getOfflineUserData();
        setIsPremium(premiumStatus);
        setOfflineUser(userData);
      } else {
        setIsPremium(false);
        setOfflineUser(null);
      }
    };

    // Verificar estado inicial
    checkStatus();

    // Escuchar cambios de conectividad
    const handleOnline = () => {
      setIsOffline(false);
      setIsPremium(false);
      setOfflineUser(null);
    };

    const handleOffline = () => {
      setIsOffline(true);
      checkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isPremium,
    isOffline,
    offlineUser,
    checkOfflinePremiumStatus,
    getOfflineUserData
  };
};
import { useEffect, useCallback, useRef } from 'react';
import { useAdvertising } from './useAdvertising';

export const useAdvertisingSystem = () => {
  const { currentAd, isVisible, startAdvertising, handleAdClick, closeAdvertisement } = useAdvertising();
  
  // Por ahora, asumir que todos los usuarios son no premium
  const isPremium = false;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAdTimeRef = useRef<number>(0);
  const currentAdIndexRef = useRef<number>(0);
  
  // Intervalo de 60 segundos (1 minuto) para mostrar anuncios
  const AD_INTERVAL = 60 * 1000; // 60 segundos en milisegundos
  
  const startAdvertisingSystem = useCallback(() => {
    // Solo iniciar si el usuario no es premium
    if (isPremium) {
      console.log('Usuario premium, sistema de publicidad deshabilitado');
      return;
    }
    
    console.log('Iniciando sistema de publicidad automática...');
    
    // Mostrar primer anuncio inmediatamente (sin user ID para evitar problemas)
    startAdvertising(undefined, isPremium, 0);
    lastAdTimeRef.current = Date.now();
    
    // Configurar intervalo para anuncios siguientes
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastAd = now - lastAdTimeRef.current;
      
      // Solo mostrar si han pasado al menos 60 segundos (1 minuto)
      if (timeSinceLastAd >= AD_INTERVAL) {
        console.log('⏰ Mostrando siguiente anuncio automáticamente...');
        startAdvertising(undefined, isPremium, currentAdIndexRef.current);
        lastAdTimeRef.current = now;
        currentAdIndexRef.current += 1; // Incrementar índice para siguiente anuncio
      }
    }, AD_INTERVAL);
  }, [startAdvertising, isPremium]);
  
  const stopAdvertisingSystem = useCallback(() => {
    console.log('Deteniendo sistema de publicidad...');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    closeAdvertisement();
  }, [closeAdvertisement]);
  
  // Iniciar/parar sistema basado en estado premium
  useEffect(() => {
    if (isPremium) {
      stopAdvertisingSystem();
    } else {
      startAdvertisingSystem();
    }
    
    return () => {
      stopAdvertisingSystem();
    };
  }, [isPremium, startAdvertisingSystem, stopAdvertisingSystem]);
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return {
    currentAd,
    isVisible,
    handleAdClick,
    closeAdvertisement,
    startAdvertisingSystem,
    stopAdvertisingSystem
  };
};




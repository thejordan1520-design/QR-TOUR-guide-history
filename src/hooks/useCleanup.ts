// Hook optimizado para evitar memory leaks
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para limpiar automáticamente timers, intervalos y conexiones
 */
export const useCleanup = () => {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const connectionsRef = useRef<Set<() => void>>(new Set());

  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    timersRef.current.add(timer);
    return timer;
  }, []);

  const addInterval = useCallback((interval: NodeJS.Timeout) => {
    intervalsRef.current.add(interval);
    return interval;
  }, []);

  const addConnection = useCallback((cleanup: () => void) => {
    connectionsRef.current.add(cleanup);
    return cleanup;
  }, []);

  const setTimeoutSafe = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    return addTimer(timer);
  }, [addTimer]);

  const setIntervalSafe = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    return addInterval(interval);
  }, [addInterval]);

  // Cleanup automático al desmontar
  useEffect(() => {
    return () => {
      // Limpiar timers
      timersRef.current.forEach(timer => {
        clearTimeout(timer);
      });
      timersRef.current.clear();

      // Limpiar intervalos
      intervalsRef.current.forEach(interval => {
        clearInterval(interval);
      });
      intervalsRef.current.clear();

      // Limpiar conexiones
      connectionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Error en cleanup:', error);
        }
      });
      connectionsRef.current.clear();
    };
  }, []);

  return {
    setTimeoutSafe,
    setIntervalSafe,
    addConnection,
    cleanup: () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      intervalsRef.current.forEach(interval => clearInterval(interval));
      connectionsRef.current.forEach(cleanup => cleanup());
    }
  };
};

/**
 * Hook para debounce de funciones
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook para throttling de funciones
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRunRef = useRef<number>(0);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRunRef.current >= delay) {
      lastRunRef.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;

  return throttledCallback;
};

export default useCleanup;








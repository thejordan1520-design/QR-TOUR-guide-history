import { useEffect, useState, useCallback, useRef } from 'react';

// Wrapper para hacer hooks más seguros y resistentes a errores
export const useSafeHook = <T>(
  hookFunction: () => T,
  fallbackValue: T,
  hookName: string = 'UnknownHook'
): T => {
  const [result, setResult] = useState<T>(fallbackValue);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const executeHook = useCallback(async () => {
    try {
      console.log(`🔄 [SafeHook] Ejecutando ${hookName}...`);
      const hookResult = hookFunction();
      
      // Si es una promesa, esperarla
      if (hookResult && typeof (hookResult as any).then === 'function') {
        const resolvedResult = await hookResult;
        setResult(resolvedResult);
        setError(null);
        console.log(`✅ [SafeHook] ${hookName} ejecutado exitosamente`);
      } else {
        setResult(hookResult);
        setError(null);
        console.log(`✅ [SafeHook] ${hookName} ejecutado exitosamente`);
      }
    } catch (err) {
      const error = err as Error;
      console.error(`❌ [SafeHook] Error en ${hookName}:`, error);
      
      setError(error);
      setResult(fallbackValue);
      
      // Reintentar si no hemos alcanzado el máximo
      if (retryCount < maxRetries) {
        console.log(`🔄 [SafeHook] Reintentando ${hookName} en 2 segundos... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      } else {
        console.error(`❌ [SafeHook] ${hookName} falló definitivamente después de ${maxRetries} intentos`);
      }
    }
  }, [hookFunction, fallbackValue, hookName, retryCount, maxRetries]);

  useEffect(() => {
    executeHook();
  }, [executeHook]);

  // Si hay un error persistente, devolver el valor de fallback
  if (error && retryCount >= maxRetries) {
    console.warn(`⚠️ [SafeHook] ${hookName} usando valor de fallback debido a errores persistentes`);
    return fallbackValue;
  }

  return result;
};

// Hook específico para operaciones asíncronas
export const useSafeAsyncHook = <T>(
  asyncFunction: () => Promise<T>,
  fallbackValue: T,
  dependencies: any[] = [],
  hookName: string = 'UnknownAsyncHook'
): { data: T; loading: boolean; error: Error | null; refetch: () => void } => {
  const [data, setData] = useState<T>(fallbackValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 [SafeAsyncHook] Ejecutando ${hookName}...`);
      
      const result = await asyncFunction();
      setData(result);
      console.log(`✅ [SafeAsyncHook] ${hookName} completado exitosamente`);
    } catch (err) {
      const error = err as Error;
      console.error(`❌ [SafeAsyncHook] Error en ${hookName}:`, error);
      setError(error);
      setData(fallbackValue);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, fallbackValue, hookName]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

// Hook para prevenir loops infinitos en useEffect
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = callback;
  }, [callback, ...deps]);
  
  return useCallback((...args: any[]) => {
    if (ref.current) {
      return ref.current(...args);
    }
  }, []) as T;
};

// Hook para manejar timeouts y limpiar recursos
export const useSafeTimeout = () => {
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      timeouts.current.delete(timeoutId);
      callback();
    }, delay);
    
    timeouts.current.add(timeoutId);
    return timeoutId;
  }, []);

  const clearSafeTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    clearTimeout(timeoutId);
    timeouts.current.delete(timeoutId);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeouts.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    setSafeTimeout,
    clearSafeTimeout,
    clearAllTimeouts
  };
};

export default useSafeHook;

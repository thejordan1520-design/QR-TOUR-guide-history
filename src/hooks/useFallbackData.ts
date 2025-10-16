import { ENV_CONFIG } from '../config/environment';
import { logger } from './logger';

// Hook para manejar fallbacks condicionalmente
export const useFallbackData = () => {
  const isFallbackEnabled = ENV_CONFIG.features.enableFallbacks;
  
  const logFallback = (context: string, fallbackUsed: boolean) => {
    if (isFallbackEnabled && fallbackUsed) {
      logger.warn(`[Fallback] ${context} - Usando datos de fallback`);
    }
  };
  
  const executeWithFallback = async <T>(
    primaryAction: () => Promise<T>,
    fallbackAction: () => Promise<T>,
    context: string
  ): Promise<T> => {
    try {
      const result = await primaryAction();
      return result;
    } catch (error) {
      logger.error(`[Fallback] ${context} - Error en acción principal:`, error);
      
      if (isFallbackEnabled) {
        logger.warn(`[Fallback] ${context} - Ejecutando fallback`);
        try {
          const fallbackResult = await fallbackAction();
          logFallback(context, true);
          return fallbackResult;
        } catch (fallbackError) {
          logger.error(`[Fallback] ${context} - Error en fallback:`, fallbackError);
          throw fallbackError;
        }
      } else {
        logger.error(`[Fallback] ${context} - Fallback deshabilitado en producción`);
        throw error;
      }
    }
  };
  
  const getMockData = <T>(mockData: T, context: string): T | null => {
    if (ENV_CONFIG.features.enableMockData) {
      logger.warn(`[Mock] ${context} - Usando datos mock`);
      return mockData;
    }
    
    logger.error(`[Mock] ${context} - Datos mock deshabilitados en producción`);
    return null;
  };
  
  return {
    isFallbackEnabled,
    logFallback,
    executeWithFallback,
    getMockData,
  };
};

// Función utilitaria para crear fallbacks seguros
export const createSafeFallback = <T>(
  primaryData: T | null,
  fallbackData: T,
  context: string
): T => {
  if (primaryData !== null && primaryData !== undefined) {
    return primaryData;
  }
  
  if (ENV_CONFIG.features.enableFallbacks) {
    logger.warn(`[SafeFallback] ${context} - Usando datos de fallback`);
    return fallbackData;
  }
  
  logger.error(`[SafeFallback] ${context} - Fallback deshabilitado en producción`);
  throw new Error(`No hay datos disponibles y fallback está deshabilitado: ${context}`);
};

// Función para validar datos antes de usar
export const validateData = <T>(
  data: T | null | undefined,
  context: string,
  validator?: (data: T) => boolean
): T => {
  if (data === null || data === undefined) {
    throw new Error(`Datos inválidos en ${context}: null o undefined`);
  }
  
  if (validator && !validator(data)) {
    throw new Error(`Datos inválidos en ${context}: falló validación`);
  }
  
  return data;
};

// Función para crear datos de fallback por defecto
export const createDefaultFallback = <T>(
  context: string,
  defaultData: T
): T => {
  if (ENV_CONFIG.features.enableMockData) {
    logger.warn(`[DefaultFallback] ${context} - Usando datos por defecto`);
    return defaultData;
  }
  
  throw new Error(`No hay datos disponibles y fallback está deshabilitado: ${context}`);
};

import { ENV_CONFIG } from '../config/environment';

// Tipos de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interfaz para el logger
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// Configuración del logger
const LOG_CONFIG = {
  level: ENV_CONFIG.logging.level,
  enableConsole: ENV_CONFIG.logging.enableConsole,
  enablePerformance: ENV_CONFIG.logging.enablePerformance,
};

// Colores para diferentes niveles
const LOG_COLORS = {
  debug: '#6B7280',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

// Función para obtener el nivel numérico
const getLevelNumber = (level: LogLevel): number => {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  return levels[level];
};

// Función para formatear el mensaje
const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return `${prefix} ${message}`;
};

// Función principal de logging
const log = (level: LogLevel, message: string, ...args: any[]): void => {
  // Solo loggear si el nivel es suficiente
  if (getLevelNumber(level) < getLevelNumber(LOG_CONFIG.level as LogLevel)) {
    return;
  }
  
  // Solo mostrar en consola en desarrollo
  if (!LOG_CONFIG.enableConsole) {
    return;
  }
  
  const formattedMessage = formatMessage(level, message);
  
  // Aplicar color en desarrollo
  if (ENV_CONFIG.isDevelopment) {
    console.log(`%c${formattedMessage}`, `color: ${LOG_COLORS[level]}`, ...args);
  } else {
    // En producción, usar métodos estándar
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...args);
        break;
      case 'info':
        console.info(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  }
};

// Logger principal
export const logger: Logger = {
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
};

// Logger específico para Supabase
export const supabaseLogger = {
  debug: (message: string, ...args: any[]) => {
    if (ENV_CONFIG.isDevelopment) {
      logger.debug(`[Supabase] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    logger.info(`[Supabase] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    logger.warn(`[Supabase] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    logger.error(`[Supabase] ${message}`, ...args);
  },
};

// Logger específico para Admin
export const adminLogger = {
  debug: (message: string, ...args: any[]) => {
    if (ENV_CONFIG.isDevelopment) {
      logger.debug(`[Admin] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    logger.info(`[Admin] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    logger.warn(`[Admin] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    logger.error(`[Admin] ${message}`, ...args);
  },
};

// Logger específico para Frontend
export const frontendLogger = {
  debug: (message: string, ...args: any[]) => {
    if (ENV_CONFIG.isDevelopment) {
      logger.debug(`[Frontend] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    logger.info(`[Frontend] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    logger.warn(`[Frontend] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    logger.error(`[Frontend] ${message}`, ...args);
  },
};

// Función para medir performance (solo en desarrollo)
export const performanceLogger = {
  start: (label: string): void => {
    if (LOG_CONFIG.enablePerformance && ENV_CONFIG.isDevelopment) {
      console.time(label);
    }
  },
  end: (label: string): void => {
    if (LOG_CONFIG.enablePerformance && ENV_CONFIG.isDevelopment) {
      console.timeEnd(label);
    }
  },
  mark: (label: string): void => {
    if (LOG_CONFIG.enablePerformance && ENV_CONFIG.isDevelopment) {
      console.timeStamp(label);
    }
  },
};

// Función para limpiar logs en producción
export const cleanupLogs = (): void => {
  if (ENV_CONFIG.isProduction) {
    // Limpiar console en producción
    console.clear();
    
    // Deshabilitar console methods en producción
    if (typeof window !== 'undefined') {
      const noop = () => {};
      console.debug = noop;
      console.info = noop;
      console.warn = noop;
      // Mantener console.error para errores críticos
    }
  }
};

// Inicializar limpieza en producción
if (ENV_CONFIG.isProduction) {
  cleanupLogs();
}

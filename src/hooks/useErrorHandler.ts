import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  id: string;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  persist?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logToConsole: true,
  persist: false,
  autoRetry: false,
  retryDelay: 1000,
  maxRetries: 3
};

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const retryCountRef = useRef<Map<string, number>>(new Map());

  const generateErrorId = () => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleError = useCallback((
    error: Error | string | any,
    options: ErrorHandlerOptions = {}
  ) => {
    const opts = { ...defaultOptions, ...options };
    
    // Crear objeto de error estandarizado
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message || 'Error desconocido',
      code: error.code || error.status?.toString() || 'UNKNOWN',
      details: error.details || error.data || error,
      timestamp: new Date(),
      id: generateErrorId()
    };

    // Log a consola si está habilitado
    if (opts.logToConsole) {
      console.error('🚨 Error capturado:', {
        message: errorInfo.message,
        code: errorInfo.code,
        details: errorInfo.details,
        timestamp: errorInfo.timestamp
      });
    }

    // Mostrar toast si está habilitado
    if (opts.showToast) {
      const toastMessage = getErrorMessage(errorInfo);
      toast.error(toastMessage, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      });
    }

    // Agregar error al estado si debe persistir
    if (opts.persist) {
      setErrors(prev => [...prev, errorInfo]);
    }

    // Auto-retry si está habilitado
    if (opts.autoRetry && errorInfo.id) {
      const retryCount = retryCountRef.current.get(errorInfo.id) || 0;
      if (retryCount < (opts.maxRetries || 3)) {
        retryCountRef.current.set(errorInfo.id, retryCount + 1);
        setTimeout(() => {
          // Aquí se podría implementar la lógica de retry
          console.log(`🔄 Reintentando operación (${retryCount + 1}/${opts.maxRetries})`);
        }, opts.retryDelay || 1000);
      }
    }

    return errorInfo;
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      const result = await asyncFn();
      return result;
    } catch (error) {
      handleError(error, options);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    retryCountRef.current.clear();
  }, []);

  const getErrorMessage = (error: ErrorInfo): string => {
    // Mapear códigos de error a mensajes amigables
    const errorMessages: Record<string, string> = {
      'VALIDATION_ERROR': 'Los datos ingresados no son válidos',
      'AUTHENTICATION_ERROR': 'Error de autenticación. Por favor, inicia sesión nuevamente',
      'AUTHORIZATION_ERROR': 'No tienes permisos para realizar esta acción',
      'NETWORK_ERROR': 'Error de conexión. Verifica tu internet',
      'SERVER_ERROR': 'Error del servidor. Inténtalo más tarde',
      'PAYMENT_ERROR': 'Error en el procesamiento del pago',
      'SUBSCRIPTION_ERROR': 'Error con la suscripción',
      'RESERVATION_ERROR': 'Error al procesar la reserva',
      'UPLOAD_ERROR': 'Error al subir archivo',
      'DOWNLOAD_ERROR': 'Error al descargar archivo',
      'UNKNOWN': 'Ha ocurrido un error inesperado'
    };

    // Si hay un mensaje específico, usarlo
    if (error.message && !errorMessages[error.code || 'UNKNOWN']) {
      return error.message;
    }

    // Usar mensaje mapeado por código
    return errorMessages[error.code || 'UNKNOWN'] || errorMessages['UNKNOWN'];
  };

  const getErrorCount = useCallback(() => {
    return errors.length;
  }, [errors]);

  const hasErrors = useCallback(() => {
    return errors.length > 0;
  }, [errors]);

  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  return {
    errors,
    isLoading,
    handleError,
    handleAsyncError,
    clearError,
    clearAllErrors,
    getErrorMessage,
    getErrorCount,
    hasErrors,
    getLatestError
  };
};

export default useErrorHandler;

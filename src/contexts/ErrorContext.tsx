import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorNotification from '../components/ui/ErrorNotification';

export interface ErrorInfo {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface ErrorContextType {
  showError: (error: Omit<ErrorInfo, 'id'>) => void;
  showSuccess: (title: string, message: string, options?: Partial<ErrorInfo>) => void;
  showWarning: (title: string, message: string, options?: Partial<ErrorInfo>) => void;
  showInfo: (title: string, message: string, options?: Partial<ErrorInfo>) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  errors: ErrorInfo[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const generateId = () => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const showError = useCallback((error: Omit<ErrorInfo, 'id'>) => {
    const errorWithId: ErrorInfo = {
      id: generateId(),
      type: 'error',
      duration: 5000,
      persistent: false,
      ...error
    };

    setErrors(prev => [...prev, errorWithId]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options: Partial<ErrorInfo> = {}) => {
    const errorWithId: ErrorInfo = {
      id: generateId(),
      type: 'success',
      title,
      message,
      duration: 3000,
      persistent: false,
      ...options
    };

    setErrors(prev => [...prev, errorWithId]);
  }, []);

  const showWarning = useCallback((title: string, message: string, options: Partial<ErrorInfo> = {}) => {
    const errorWithId: ErrorInfo = {
      id: generateId(),
      type: 'warning',
      title,
      message,
      duration: 4000,
      persistent: false,
      ...options
    };

    setErrors(prev => [...prev, errorWithId]);
  }, []);

  const showInfo = useCallback((title: string, message: string, options: Partial<ErrorInfo> = {}) => {
    const errorWithId: ErrorInfo = {
      id: generateId(),
      type: 'info',
      title,
      message,
      duration: 4000,
      persistent: false,
      ...options
    };

    setErrors(prev => [...prev, errorWithId]);
  }, []);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value: ErrorContextType = {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearError,
    clearAllErrors,
    errors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      
      {/* Error Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {errors.map((error) => (
            <ErrorNotification
              key={error.id}
              id={error.id}
              type={error.type}
              title={error.title}
              message={error.message}
              duration={error.duration}
              persistent={error.persistent}
              onClose={clearError}
            />
          ))}
        </AnimatePresence>
      </div>
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;

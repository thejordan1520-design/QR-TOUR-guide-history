import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorNotificationProps {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
  persistent?: boolean;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  id,
  type,
  title,
  message,
  onClose,
  duration = 5000,
  persistent = false
}) => {
  React.useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, onClose, duration, persistent]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          closeButton: 'text-red-400 hover:text-red-600'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500',
          closeButton: 'text-yellow-400 hover:text-yellow-600'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          closeButton: 'text-blue-400 hover:text-blue-600'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          closeButton: 'text-green-400 hover:text-green-600'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          closeButton: 'text-gray-400 hover:text-gray-600'
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative max-w-sm w-full ${styles.container} border rounded-lg shadow-lg p-4`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {title}
          </h3>
          <p className="mt-1 text-sm opacity-90">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onClose(id)}
            className={`inline-flex rounded-md p-1.5 ${styles.closeButton} hover:bg-opacity-20 transition-colors`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorNotification;

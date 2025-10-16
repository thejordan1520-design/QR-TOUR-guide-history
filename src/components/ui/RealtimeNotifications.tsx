import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface SyncNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  table?: string;
  action?: 'create' | 'update' | 'delete';
}

interface RealtimeNotificationsProps {
  notifications: SyncNotification[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  isConnected: boolean;
}

const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  notifications,
  onRemove,
  onClearAll,
  isConnected
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) return 'Ahora';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    return `${Math.floor(diff / 3600000)}h`;
  };

  if (notifications.length === 0 && isConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Indicador de conexión */}
      <div className={`px-3 py-2 rounded-lg border text-sm flex items-center space-x-2 ${
        isConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
      </div>

      {/* Notificaciones */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-lg border shadow-lg ${getBgColor(notification.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                  {notification.message}
                </p>
                {notification.table && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tabla: {notification.table} • {formatTime(notification.timestamp)}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Botón para limpiar todas las notificaciones */}
      {notifications.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClearAll}
          className="w-full px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar todas ({notifications.length})
        </motion.button>
      )}
    </div>
  );
};

export default RealtimeNotifications;

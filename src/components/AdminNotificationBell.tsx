import React, { useState, useEffect } from 'react';
import { Bell, Mail, Check, X } from 'lucide-react';
import { useSimpleNotifications } from '../hooks/useSimpleNotifications';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface AdminNotificationBellProps {
  className?: string;
}

const AdminNotificationBell: React.FC<AdminNotificationBellProps> = ({ className = '' }) => {
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useSimpleNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Obtener notificaciones recientes (últimas 5 o todas si showAll es true)
  const recentNotifications = notifications.slice(0, showAll ? notifications.length : 5);

  // Obtener icono según el tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'reservation':
        return '📅';
      case 'system':
        return '🔧';
      default:
        return '🔔';
    }
  };

  // Obtener color del badge según el tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'reservation':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setIsOpen(false);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      refetch(); // Recargar notificaciones al abrir
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botón de campana */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificaciones */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notificaciones
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} nuevas
                    </Badge>
                  )}
                </h3>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-64 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Cargando notificaciones...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No hay notificaciones
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.is_read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-xs"
                >
                  {showAll 
                    ? `Mostrar menos (${notifications.length - 5} ocultas)` 
                    : `Ver todas (${notifications.length} total)`
                  }
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNotificationBell;

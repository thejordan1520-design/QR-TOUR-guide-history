import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Bell, Mail, Inbox, Clock, Send, Trash2, AlertTriangle, 
  CheckCircle, Info, Search, Filter, RefreshCw, Archive,
  Star, Eye, EyeOff, MoreVertical
} from 'lucide-react';
import { useSimpleNotifications } from '../hooks/useSimpleNotifications';

interface NotificationMailboxProps {
  className?: string;
}

type MailboxFolder = 'inbox' | 'recent' | 'sent' | 'spam' | 'deleted';

const NotificationMailbox: React.FC<NotificationMailboxProps> = ({ className = '' }) => {
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    deleteNotification,
    refetch 
  } = useSimpleNotifications();

  const [activeFolder, setActiveFolder] = useState<MailboxFolder>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Estadísticas por carpeta
  const getFolderStats = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      inbox: notifications.filter(n => !n.is_read).length, // Todas las no leídas
      recent: notifications.filter(n => 
        new Date(n.created_at) > oneDayAgo
      ).length,
      sent: notifications.length, // Todas las notificaciones
      spam: notifications.filter(n => n.type === 'error' || n.type === 'warning').length,
      deleted: 0 // Las notificaciones eliminadas no se muestran
    };
  };

  const stats = getFolderStats();

  // Filtrar notificaciones según la carpeta activa
  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filtrar por carpeta
    switch (activeFolder) {
      case 'inbox':
        filtered = filtered.filter(n => !n.is_read); // Todas las no leídas
        break;
      case 'recent':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(n => 
          new Date(n.created_at) > oneDayAgo
        );
        break;
      case 'sent':
        filtered = notifications; // Todas las notificaciones
        break;
      case 'spam':
        filtered = filtered.filter(n => n.type === 'error' || n.type === 'warning');
        break;
      case 'deleted':
        filtered = []; // Las notificaciones eliminadas no se muestran
        break;
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  // Manejar selección múltiple
  const handleNotificationSelect = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Acciones masivas
  const handleBulkAction = async (action: 'read' | 'unread' | 'delete') => {
    try {
      for (const id of selectedNotifications) {
        switch (action) {
          case 'read':
            await markAsRead(id);
            break;
          case 'unread':
            await markAsUnread(id);
            break;
          case 'delete':
            await deleteNotification(id);
            break;
        }
      }
      setSelectedNotifications([]);
      await refetch();
    } catch (error) {
      console.error('Error en acción masiva:', error);
    }
  };

  // Obtener icono según el tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Obtener color del badge según el tipo
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const folders = [
    { id: 'inbox', label: 'Recibidas', icon: Inbox, count: stats.inbox },
    { id: 'recent', label: 'Recientes', icon: Clock, count: stats.recent },
    { id: 'sent', label: 'Enviadas', icon: Send, count: stats.sent },
    { id: 'spam', label: 'Spam', icon: AlertTriangle, count: stats.spam },
    { id: 'deleted', label: 'Eliminadas', icon: Trash2, count: stats.deleted }
  ];

  return (
    <div className={`notification-mailbox ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Buzón de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Sidebar con carpetas */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Carpetas</h3>
                {folders.map(folder => {
                  const Icon = folder.icon;
                  return (
                    <Button
                      key={folder.id}
                      variant={activeFolder === folder.id ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveFolder(folder.id as MailboxFolder)}
                    >
                      <Icon className="h-4 w-4" />
                      {folder.label}
                      {folder.count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {folder.count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Área principal */}
            <div className="lg:col-span-3">
              {/* Barra de herramientas */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar notificaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="info">Información</option>
                    <option value="success">Éxito</option>
                    <option value="warning">Advertencia</option>
                    <option value="error">Error</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Acciones masivas */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {selectedNotifications.length} notificación(es) seleccionada(s)
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('read')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Marcar como leídas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('unread')}
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Marcar como no leídas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de notificaciones */}
              <div className="space-y-2">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Cargando notificaciones...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    Error cargando notificaciones: {error}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay notificaciones en esta carpeta
                  </div>
                ) : (
                  <>
                    {/* Checkbox para seleccionar todas */}
                    <div className="flex items-center gap-2 p-2 border-b">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.length === filteredNotifications.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Seleccionar todas</span>
                    </div>

                    {/* Lista de notificaciones */}
                    {filteredNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          notification.is_read 
                            ? 'bg-white hover:bg-gray-50' 
                            : 'bg-blue-50 hover:bg-blue-100'
                        } ${
                          selectedNotifications.includes(notification.id) 
                            ? 'ring-2 ring-blue-500' 
                            : ''
                        }`}
                        onClick={() => handleNotificationSelect(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleNotificationSelect(notification.id)}
                            className="mt-1 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(notification.type)}
                              <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <Badge className={`text-xs ${getTypeBadgeColor(notification.type)}`}>
                                {notification.type}
                              </Badge>
                              {!notification.is_read && (
                                <Badge variant="default" className="text-xs">
                                  Nuevo
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>
                                {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span>Para: {notification.target_audience}</span>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.is_read ? markAsUnread(notification.id) : markAsRead(notification.id);
                              }}
                            >
                              {notification.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationMailbox;

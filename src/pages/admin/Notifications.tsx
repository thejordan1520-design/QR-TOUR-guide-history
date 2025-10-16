import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Bell, Plus, Search, RefreshCw, Send, User, Calendar, AlertCircle, 
  Save, X, Target, Clock, Mail, Inbox, Trash2, Eye, EyeOff
} from 'lucide-react';
import { useAdminNotifications, AdminNotification } from '../../hooks/useAdminNotifications';
import NotificationMailbox from '../../components/NotificationMailbox';

const Notifications = () => {
  const { 
    notifications, 
    loading, 
    error, 
    createNotification, 
    updateNotification, 
    deleteNotification, 
    sendNotification,
    scheduleNotification,
    markAsRead,
    refetch 
  } = useAdminNotifications();

  const [activeTab, setActiveTab] = useState<'mailbox' | 'compose'>('mailbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete' | 'send' | 'schedule'>('none');
  const [editingNotification, setEditingNotification] = useState<Partial<AdminNotification>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const types = ['all', 'info', 'warning', 'error', 'success', 'reservation', 'system', 'promotion'];
  const statuses = ['all', 'draft', 'scheduled', 'sent', 'failed'];
  const audiences = ['all', 'all', 'admin', 'users', 'premium', 'specific'];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesAudience = filterAudience === 'all' || notification.target_audience === filterAudience;
    return matchesSearch && matchesType && matchesStatus && matchesAudience;
  });

  const getTypeBadge = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      reservation: 'bg-purple-100 text-purple-800',
      system: 'bg-gray-100 text-gray-800',
      promotion: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleAddNotification = () => {
    setEditingNotification({
      title: '',
      message: '',
      type: 'info',
      target_audience: 'all',
      status: 'draft'
    });
    setActiveModal('add');
  };

  const handleEditNotification = (notification: AdminNotification) => {
    setEditingNotification(notification);
    setActiveModal('edit');
  };

  const handleViewNotification = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setActiveModal('view');
  };

  const handleDeleteNotification = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setActiveModal('delete');
  };

  const handleSaveNotification = async () => {
    if (!editingNotification.title || !editingNotification.message) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeModal === 'edit' && editingNotification.id) {
        await updateNotification(editingNotification.id, editingNotification);
      } else {
        await createNotification(editingNotification);
      }
      closeAllModals();
      await refetch();
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Error al guardar la notificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedNotification) return;

    setIsSubmitting(true);
    try {
      await deleteNotification(selectedNotification.id);
      closeAllModals();
      await refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error al eliminar la notificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedNotification) return;

    setIsSubmitting(true);
    try {
      await sendNotification(selectedNotification.id);
      await refetch();
      alert('Notificación enviada exitosamente');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error al enviar la notificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleNotification = async () => {
    if (!selectedNotification || !scheduleDate) return;

    setIsSubmitting(true);
    try {
      await scheduleNotification(selectedNotification.id, scheduleDate);
      await refetch();
      alert('Notificación programada exitosamente');
      closeAllModals();
    } catch (error) {
      console.error('Error scheduling notification:', error);
      alert('Error al programar la notificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedNotification(null);
    setEditingNotification({});
    setScheduleDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Notificaciones</h2>
          <p className="text-gray-600">Gestiona las notificaciones y el buzón de mensajes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('compose')} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('mailbox')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mailbox'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Inbox className="w-4 h-4 inline mr-2" />
            Buzón de Mensajes
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Crear Notificación
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'mailbox' && (
        <NotificationMailbox />
      )}

      {activeTab === 'compose' && (
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Enviadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {notifications.filter(n => n.status === 'sent').length}
                    </p>
                  </div>
                  <Send className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Borradores</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {notifications.filter(n => n.status === 'draft').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Programadas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {notifications.filter(n => n.status === 'scheduled').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
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
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  {types.filter(t => t !== 'all').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Todos los estados</option>
                  {statuses.filter(s => s !== 'all').map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Todos los públicos</option>
                  {audiences.filter(a => a !== 'all').map(audience => (
                    <option key={audience} value={audience}>{audience}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones ({filteredNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
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
                  No hay notificaciones que coincidan con los filtros
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            <Badge className={`text-xs ${getTypeBadge(notification.type)}`}>
                              {notification.type}
                            </Badge>
                            <Badge className={`text-xs ${getStatusBadge(notification.status)}`}>
                              {notification.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Para: {notification.target_audience}</span>
                            <span>
                              {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewNotification(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNotification(notification)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                          {notification.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedNotification(notification);
                                setActiveModal('send');
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para crear/editar notificación */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'edit' ? 'Editar Notificación' : 'Nueva Notificación'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  value={editingNotification.title || ''}
                  onChange={(e) => setEditingNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la notificación"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje *
                </label>
                <textarea
                  value={editingNotification.message || ''}
                  onChange={(e) => setEditingNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Contenido de la notificación"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={editingNotification.type || 'info'}
                    onChange={(e) => setEditingNotification(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {types.filter(t => t !== 'all').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audiencia
                  </label>
                  <select
                    value={editingNotification.target_audience || 'all'}
                    onChange={(e) => setEditingNotification(prev => ({ ...prev, target_audience: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {audiences.filter(a => a !== 'all').map(audience => (
                      <option key={audience} value={audience}>{audience}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveNotification} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : activeModal === 'edit' ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver notificación */}
      {activeModal === 'view' && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ver Notificación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedNotification.title}</h4>
                <div className="flex gap-2 mt-2">
                  <Badge className={`text-xs ${getTypeBadge(selectedNotification.type)}`}>
                    {selectedNotification.type}
                  </Badge>
                  <Badge className={`text-xs ${getStatusBadge(selectedNotification.status)}`}>
                    {selectedNotification.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600">{selectedNotification.message}</p>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Audiencia: {selectedNotification.target_audience}</p>
                <p>Creada: {new Date(selectedNotification.created_at).toLocaleString('es-ES')}</p>
                {selectedNotification.sent_at && (
                  <p>Enviada: {new Date(selectedNotification.sent_at).toLocaleString('es-ES')}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              {selectedNotification.status === 'draft' && (
                <Button 
                  onClick={handleSendNotification} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para enviar notificación */}
      {activeModal === 'send' && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enviar Notificación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres enviar la notificación "{selectedNotification.title}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSendNotification} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para programar notificación */}
      {activeModal === 'schedule' && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Programar Notificación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora
                </label>
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleScheduleNotification} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || !scheduleDate}
              >
                {isSubmitting ? 'Programando...' : 'Programar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación */}
      {activeModal === 'delete' && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar la notificación "{selectedNotification.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
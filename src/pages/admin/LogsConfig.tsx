import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  FileText, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Settings, AlertTriangle, Info, Bug,
  Save, X, Database, Clock, Filter, Download as DownloadIcon
} from 'lucide-react';
import { useAdminLogsConfig, AdminSystemLog, AdminConfig } from '../../hooks/useAdminLogsConfig';

const LogsConfig = () => {
  const { 
    systemLogs, 
    configs,
    loading, 
    error, 
    createSystemLog, 
    updateConfig, 
    deleteSystemLog,
    clearOldLogs,
    exportLogs,
    getLogStats,
    refetch 
  } = useAdminLogsConfig();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AdminSystemLog | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<AdminConfig | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view_log' | 'edit_config' | 'add_config' | 'delete_log' | 'clear_logs'>('none');
  const [editingConfig, setEditingConfig] = useState<Partial<AdminConfig>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'config'>('logs');

  const levels = ['all', 'info', 'warning', 'error', 'debug'];
  const events = ['all', 'system_startup', 'user_login', 'database_connection', 'custom_event'];
  const categories = ['all', 'general', 'uploads', 'notifications', 'system', 'localization'];

  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch = log.system_event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesEvent = filterEvent === 'all' || log.system_event === filterEvent;
    return matchesSearch && matchesLevel && matchesEvent;
  });

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getLevelBadge = (level: string) => {
    const colors = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800',
      'debug': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (level: string) => {
    const icons = {
      'info': <Info className="w-4 h-4" />,
      'warning': <AlertTriangle className="w-4 h-4" />,
      'error': <AlertTriangle className="w-4 h-4" />,
      'debug': <Bug className="w-4 h-4" />
    };
    return icons[level as keyof typeof icons] || <Info className="w-4 h-4" />;
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedLog(null);
    setSelectedConfig(null);
    setEditingConfig({});
    setIsSubmitting(false);
  };

  const handleViewLog = (log: AdminSystemLog) => {
    setSelectedLog(log);
    setActiveModal('view_log');
  };

  const handleEditConfig = (config: AdminConfig) => {
    setSelectedConfig(config);
    setEditingConfig(config);
    setActiveModal('edit_config');
  };

  const handleAddConfig = () => {
    setEditingConfig({
      key: '',
      value: '',
      description: '',
      category: 'general',
      is_active: true
    });
    setActiveModal('add_config');
  };

  const handleDeleteLog = (log: AdminSystemLog) => {
    setSelectedLog(log);
    setActiveModal('delete_log');
  };

  const handleClearLogs = () => {
    setActiveModal('clear_logs');
  };

  const handleSaveConfig = async () => {
    if (!editingConfig.key?.trim() || !editingConfig.value?.trim()) {
      alert('La clave y el valor son obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add_config') {
        const newConfig = {
          ...editingConfig,
          id: `config-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        // Simular creación (en un caso real, se guardaría en la base de datos)
        console.log('✅ Configuración creada:', newConfig);
      } else if (activeModal === 'edit_config' && selectedConfig) {
        await updateConfig(selectedConfig.id, editingConfig);
        console.log('✅ Configuración actualizada exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando configuración:', err);
      alert(`Error al guardar configuración: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteLog = async () => {
    if (!selectedLog) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteSystemLog(selectedLog.id);
      console.log('✅ Log eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando log:', err);
      alert(`Error al eliminar log: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmClearLogs = async () => {
    setIsSubmitting(true);
    
    try {
      await clearOldLogs(30);
      console.log('✅ Logs antiguos eliminados exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error limpiando logs:', err);
      alert(`Error al limpiar logs: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Datos actualizados');
    } catch (err) {
      console.error('❌ Error actualizando datos:', err);
    }
  };

  const handleExport = (format: 'json' | 'csv' = 'json') => {
    exportLogs(format);
  };

  const stats = getLogStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando logs y configuraciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logs y Configuración</h2>
          <p className="text-gray-600">Gestiona logs del sistema y configuraciones</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => handleExport('json')} variant="outline">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Exportar JSON
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Logs del Sistema
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configuración
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Errores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Advertencias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'logs' && (
              <>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los niveles</option>
                  {levels.filter(level => level !== 'all').map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los eventos</option>
                  {events.filter(event => event !== 'all').map(event => (
                    <option key={event} value={event}>{event.replace('_', ' ')}</option>
                  ))}
                </select>
              </>
            )}
            <div className="flex gap-2">
              {activeTab === 'logs' && (
                <Button onClick={handleClearLogs} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpiar Logs
                </Button>
              )}
              {activeTab === 'config' && (
                <Button onClick={handleAddConfig} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'logs' ? (
        /* Logs Table */
        <Card>
          <CardHeader>
            <CardTitle>Logs del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {getLevelIcon(log.level)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{log.system_event}</h3>
                          <Badge className={getLevelBadge(log.level)}>
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewLog(log)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleDeleteLog(log)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron logs</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Config Table */
        <Card>
          <CardHeader>
            <CardTitle>Configuraciones del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConfigs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{config.key}</h3>
                        <Badge variant="outline">{config.category}</Badge>
                        <Badge className={config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {config.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                      <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                        {config.value}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEditConfig(config)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredConfigs.length === 0 && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron configuraciones</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Log Modal */}
      {activeModal === 'view_log' && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Log</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Evento</label>
                  <p className="text-gray-900">{selectedLog.system_event}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nivel</label>
                  <Badge className={getLevelBadge(selectedLog.level)}>
                    {selectedLog.level}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <p className="text-gray-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Detalles</label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Config Modal */}
      {(activeModal === 'edit_config' || activeModal === 'add_config') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add_config' ? 'Agregar Configuración' : 'Editar Configuración'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clave *</label>
                  <Input
                    value={editingConfig.key || ''}
                    onChange={(e) => setEditingConfig({...editingConfig, key: e.target.value})}
                    placeholder="site_name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={editingConfig.category || 'general'}
                    onChange={(e) => setEditingConfig({...editingConfig, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(cat => cat !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor *</label>
                <Input
                  value={editingConfig.value || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, value: e.target.value})}
                  placeholder="QR Tour Puerto Plata"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={editingConfig.description || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, description: e.target.value})}
                  placeholder="Descripción de la configuración"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingConfig.is_active ?? true}
                    onChange={(e) => setEditingConfig({...editingConfig, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Configuración activa</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveConfig} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : activeModal === 'edit_config' ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Log Confirmation Modal */}
      {activeModal === 'delete_log' && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este log? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmDeleteLog} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {activeModal === 'clear_logs' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Limpieza</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar todos los logs más antiguos de 30 días? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmClearLogs} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Limpiando...' : 'Limpiar Logs'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsConfig;
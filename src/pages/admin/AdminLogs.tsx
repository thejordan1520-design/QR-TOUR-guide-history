import React, { useState, useMemo } from 'react';
import { useAdminLogs, AdminLog, UserLog, SystemLog, LogStatistics } from '../../hooks/useAdminLogs';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Info, 
  Trash2, 
  RefreshCw, 
  Filter, 
  Search,
  Calendar,
  Clock,
  User,
  Database,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminLogs: React.FC = () => {
  const { 
    adminLogs, 
    userLogs, 
    systemLogs, 
    statistics, 
    loading, 
    error, 
    fetchAllLogs,
    clearLogs 
  } = useAdminLogs();

  const [activeTab, setActiveTab] = useState<'admin' | 'user' | 'system' | 'statistics'>('statistics');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const filteredAdminLogs = useMemo(() => {
    return adminLogs.filter(log => {
      const matchesSearch = (log.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (log.action_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesDate = (!dateRange.start || new Date(log.created_at) >= new Date(dateRange.start)) &&
                         (!dateRange.end || new Date(log.created_at) <= new Date(dateRange.end));
      return matchesSearch && matchesDate;
    });
  }, [adminLogs, searchTerm, dateRange]);

  const filteredUserLogs = useMemo(() => {
    return userLogs.filter(log => {
      const matchesSearch = (log.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (log.action_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesDate = (!dateRange.start || new Date(log.created_at) >= new Date(dateRange.start)) &&
                         (!dateRange.end || new Date(log.created_at) <= new Date(dateRange.end));
      return matchesSearch && matchesDate;
    });
  }, [userLogs, searchTerm, dateRange]);

  const filteredSystemLogs = useMemo(() => {
    return systemLogs.filter(log => {
      const matchesSearch = (log.message?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (log.component?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || log.log_level === filterLevel;
      const matchesDate = (!dateRange.start || new Date(log.created_at) >= new Date(dateRange.start)) &&
                         (!dateRange.end || new Date(log.created_at) <= new Date(dateRange.end));
      return matchesSearch && matchesLevel && matchesDate;
    });
  }, [systemLogs, searchTerm, filterLevel, dateRange]);

  const handleClearLogs = async (logType: 'admin' | 'user' | 'system') => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar los logs de ${logType} más antiguos de 30 días?`)) {
      try {
        await clearLogs(logType);
        alert('Logs eliminados exitosamente');
      } catch (err) {
        alert('Error al eliminar logs: ' + (err as Error).message);
      }
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'WARN': return 'text-yellow-600 bg-yellow-100';
      case 'INFO': return 'text-blue-600 bg-blue-100';
      case 'DEBUG': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionTypeColor = (actionType: string) => {
    if (actionType.includes('CREATE')) return 'text-green-600 bg-green-100';
    if (actionType.includes('UPDATE')) return 'text-blue-600 bg-blue-100';
    if (actionType.includes('DELETE')) return 'text-red-600 bg-red-100';
    if (actionType.includes('LOGIN')) return 'text-purple-600 bg-purple-100';
    if (actionType.includes('ERROR')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) return (
    <div className="p-6">
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Cargando logs...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-bold">Error cargando logs</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchAllLogs}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Logs del Sistema</h1>
        <button
          onClick={fetchAllLogs}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statistics.map((stat) => (
          <div key={stat.log_type} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-500 capitalize">{stat.log_type} Logs</p>
                <p className="text-3xl font-bold text-gray-900">{stat.total_count}</p>
              </div>
              <div className="flex space-x-2">
                {stat.error_count > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {stat.error_count} Errores
                  </span>
                )}
                {stat.warning_count > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {stat.warning_count} Advertencias
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pestañas */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'statistics', label: 'Estadísticas', icon: Activity },
              { id: 'admin', label: 'Logs Admin', icon: Shield },
              { id: 'user', label: 'Logs Usuario', icon: Users },
              { id: 'system', label: 'Logs Sistema', icon: Database },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <input
                type="date"
                placeholder="Fecha inicio"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Fecha fin"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {activeTab === 'system' && (
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="ERROR">Error</option>
                  <option value="WARN">Advertencia</option>
                  <option value="INFO">Info</option>
                  <option value="DEBUG">Debug</option>
                </select>
              )}
            </div>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Resumen de Actividad</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statistics.map((stat) => (
                  <div key={stat.log_type} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize mb-4">{stat.log_type} Logs</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">{stat.total_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Errores:</span>
                        <span className="font-semibold text-red-600">{stat.error_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Advertencias:</span>
                        <span className="font-semibold text-yellow-600">{stat.warning_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Info:</span>
                        <span className="font-semibold text-blue-600">{stat.info_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Logs de Administración</h2>
                <button
                  onClick={() => handleClearLogs('admin')}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center space-x-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tabla</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdminLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionTypeColor(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.target_table || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'user' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Logs de Usuario</h2>
                <button
                  onClick={() => handleClearLogs('user')}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center space-x-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUserLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{log.user_id ? log.user_id.substring(0, 8) + '...' : 'Anónimo'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionTypeColor(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Logs del Sistema</h2>
                <button
                  onClick={() => handleClearLogs('system')}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center space-x-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Componente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSystemLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogLevelColor(log.log_level)}`}>
                            {log.log_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.component}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
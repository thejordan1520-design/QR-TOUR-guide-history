import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Database as DatabaseIcon, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Play, Pause, Settings, Save, X,
  HardDrive, Clock, AlertTriangle, CheckCircle, XCircle,
  Zap, FileText, BarChart3, Activity
} from 'lucide-react';
import { useAdminDatabase, DatabaseTable, DatabaseBackup, DatabaseQuery } from '../../hooks/useAdminDatabase';

const Database = () => {
  const { 
    tables, 
    backups,
    queries,
    loading, 
    error, 
    createBackup, 
    executeQuery, 
    deleteBackup,
    optimizeTable,
    getDatabaseStats,
    refetch 
  } = useAdminDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<DatabaseBackup | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<DatabaseQuery | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view_table' | 'view_backup' | 'view_query' | 'add_backup' | 'execute_query' | 'delete_backup' | 'optimize_table'>('none');
  const [editingBackup, setEditingBackup] = useState<Partial<DatabaseBackup>>({});
  const [queryText, setQueryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'backups' | 'queries'>('tables');

  const statuses = ['all', 'active', 'inactive', 'maintenance'];

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'success': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'active': <CheckCircle className="w-4 h-4" />,
      'inactive': <XCircle className="w-4 h-4" />,
      'maintenance': <Settings className="w-4 h-4" />,
      'completed': <CheckCircle className="w-4 h-4" />,
      'in_progress': <Clock className="w-4 h-4" />,
      'failed': <XCircle className="w-4 h-4" />,
      'success': <CheckCircle className="w-4 h-4" />,
      'error': <XCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedTable(null);
    setSelectedBackup(null);
    setSelectedQuery(null);
    setEditingBackup({});
    setQueryText('');
    setIsSubmitting(false);
  };

  const handleViewTable = (table: DatabaseTable) => {
    setSelectedTable(table);
    setActiveModal('view_table');
  };

  const handleViewBackup = (backup: DatabaseBackup) => {
    setSelectedBackup(backup);
    setActiveModal('view_backup');
  };

  const handleViewQuery = (query: DatabaseQuery) => {
    setSelectedQuery(query);
    setActiveModal('view_query');
  };

  const handleAddBackup = () => {
    setEditingBackup({
      name: `backup_${new Date().toISOString().split('T')[0]}_full`,
      tables_included: tables.map(t => t.name)
    });
    setActiveModal('add_backup');
  };

  const handleExecuteQuery = () => {
    setQueryText('');
    setActiveModal('execute_query');
  };

  const handleDeleteBackup = (backup: DatabaseBackup) => {
    setSelectedBackup(backup);
    setActiveModal('delete_backup');
  };

  const handleOptimizeTable = (table: DatabaseTable) => {
    setSelectedTable(table);
    setActiveModal('optimize_table');
  };

  const handleSaveBackup = async () => {
    if (!editingBackup.name?.trim()) {
      alert('El nombre del respaldo es obligatorio');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createBackup(editingBackup.name, editingBackup.tables_included || []);
      console.log('✅ Respaldo creado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error creando respaldo:', err);
      alert(`Error al crear respaldo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteQuerySubmit = async () => {
    if (!queryText.trim()) {
      alert('La consulta no puede estar vacía');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await executeQuery(queryText);
      console.log('✅ Consulta ejecutada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error ejecutando consulta:', err);
      alert(`Error al ejecutar consulta: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteBackup = async () => {
    if (!selectedBackup) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteBackup(selectedBackup.id);
      console.log('✅ Respaldo eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando respaldo:', err);
      alert(`Error al eliminar respaldo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOptimizeTable = async () => {
    if (!selectedTable) return;
    
    setIsSubmitting(true);
    
    try {
      await optimizeTable(selectedTable.name);
      console.log('✅ Tabla optimizada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error optimizando tabla:', err);
      alert(`Error al optimizar tabla: ${err instanceof Error ? err.message : 'Error desconocido'}`);
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

  const stats = getDatabaseStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando información de base de datos...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Base de Datos</h2>
          <p className="text-gray-600">Gestiona tablas, respaldos y consultas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleAddBackup} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Crear Respaldo
          </Button>
          <Button onClick={handleExecuteQuery} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Ejecutar Consulta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DatabaseIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tablas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tables.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registros</p>
                <p className="text-2xl font-bold text-gray-900">{stats.records.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamaño</p>
                <p className="text-2xl font-bold text-gray-900">{stats.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Respaldos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.backups.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tables'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DatabaseIcon className="w-4 h-4 inline mr-2" />
          Tablas
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'backups'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HardDrive className="w-4 h-4 inline mr-2" />
          Respaldos
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'queries'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Consultas
        </button>
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
            {activeTab === 'tables' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                {statuses.filter(status => status !== 'all').map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'tables' ? (
        /* Tables Table */
        <Card>
          <CardHeader>
            <CardTitle>Tablas de la Base de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTables.map((table) => (
                <div key={table.name} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <DatabaseIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{table.name}</h3>
                          <Badge className={getStatusBadge(table.status)}>
                            {getStatusIcon(table.status)}
                            <span className="ml-1">{table.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{table.records.toLocaleString()} registros</span>
                          <span>{table.size}</span>
                          <span>Actualizado: {new Date(table.last_updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewTable(table)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleOptimizeTable(table)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Optimizar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredTables.length === 0 && (
              <div className="text-center py-8">
                <DatabaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron tablas</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'backups' ? (
        /* Backups Table */
        <Card>
          <CardHeader>
            <CardTitle>Respaldos de la Base de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBackups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{backup.name}</h3>
                          <Badge className={getStatusBadge(backup.status)}>
                            {getStatusIcon(backup.status)}
                            <span className="ml-1">{backup.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{backup.size}</span>
                          <span>Creado: {new Date(backup.created_at).toLocaleString()}</span>
                          <span>{backup.tables_included.length} tablas</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewBackup(backup)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleDeleteBackup(backup)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBackups.length === 0 && (
              <div className="text-center py-8">
                <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron respaldos</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Queries Table */
        <Card>
          <CardHeader>
            <CardTitle>Historial de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <div key={query.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusBadge(query.status)}>
                            {getStatusIcon(query.status)}
                            <span className="ml-1">{query.status}</span>
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {query.execution_time}ms
                          </span>
                          <span className="text-sm text-gray-600">
                            {query.result_count} resultados
                          </span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                          {query.query}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(query.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleViewQuery(query)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredQueries.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron consultas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Table Modal */}
      {activeModal === 'view_table' && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Tabla</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-gray-900">{selectedTable.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedTable.status)}>
                    {getStatusIcon(selectedTable.status)}
                    <span className="ml-1">{selectedTable.status}</span>
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registros</label>
                  <p className="text-gray-900">{selectedTable.records.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                  <p className="text-gray-900">{selectedTable.size}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                <p className="text-gray-900">{new Date(selectedTable.last_updated).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleOptimizeTable(selectedTable);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Optimizar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Backup Modal */}
      {activeModal === 'add_backup' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crear Respaldo</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Respaldo *</label>
                <Input
                  value={editingBackup.name || ''}
                  onChange={(e) => setEditingBackup({...editingBackup, name: e.target.value})}
                  placeholder="backup_2025_09_29_full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tablas a Incluir</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {tables.map((table) => (
                    <label key={table.name} className="flex items-center gap-2 p-1">
                      <input
                        type="checkbox"
                        checked={editingBackup.tables_included?.includes(table.name) || false}
                        onChange={(e) => {
                          const currentTables = editingBackup.tables_included || [];
                          if (e.target.checked) {
                            setEditingBackup({
                              ...editingBackup,
                              tables_included: [...currentTables, table.name]
                            });
                          } else {
                            setEditingBackup({
                              ...editingBackup,
                              tables_included: currentTables.filter(t => t !== table.name)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{table.name} ({table.records} registros)</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveBackup} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creando...' : 'Crear Respaldo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Query Modal */}
      {activeModal === 'execute_query' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ejecutar Consulta SQL</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Consulta SQL *</label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="SELECT * FROM users LIMIT 10;"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={8}
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Advertencia</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Ten cuidado con las consultas que modifican datos. Las consultas de solo lectura son más seguras.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleExecuteQuerySubmit} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Play className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Ejecutando...' : 'Ejecutar Consulta'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Backup Confirmation Modal */}
      {activeModal === 'delete_backup' && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el respaldo "{selectedBackup.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmDeleteBackup} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Optimize Table Confirmation Modal */}
      {activeModal === 'optimize_table' && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Optimización</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres optimizar la tabla "{selectedTable.name}"? Esto puede tomar algunos minutos.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmOptimizeTable} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Optimizando...' : 'Optimizar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Database;
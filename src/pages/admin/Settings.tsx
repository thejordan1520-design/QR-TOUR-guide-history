import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Settings as SettingsIcon, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Save, X, AlertTriangle, CheckCircle, Clock,
  RotateCcw, Filter, Save as SaveIcon, FileText, Code
} from 'lucide-react';
import { useAdminSettings, AdminSetting } from '../../hooks/useAdminSettings';

const Settings = () => {
  const { 
    settings, 
    loading, 
    error, 
    createSetting, 
    updateSetting,
    deleteSetting,
    getSettingValue,
    setSettingValue,
    exportSettings,
    importSettings,
    resetToDefaults,
    getSettingsStats,
    searchSettings,
    validateSettingValue,
    refetch 
  } = useAdminSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSetting, setSelectedSetting] = useState<AdminSetting | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete' | 'import' | 'reset'>('none');
  const [editingSetting, setEditingSetting] = useState<Partial<AdminSetting>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const types = ['all', 'string', 'number', 'boolean', 'json', 'array'];

  const filteredSettings = searchSettings(searchTerm).filter(setting => {
    const matchesType = filterType === 'all' || setting.setting_type === filterType;
    return matchesType;
  });

  const getTypeBadge = (type: string) => {
    const colors = {
      'string': 'bg-blue-100 text-blue-800',
      'number': 'bg-green-100 text-green-800',
      'boolean': 'bg-purple-100 text-purple-800',
      'json': 'bg-orange-100 text-orange-800',
      'array': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'string': <FileText className="w-4 h-4" />,
      'number': <FileText className="w-4 h-4" />,
      'boolean': <CheckCircle className="w-4 h-4" />,
      'json': <Code className="w-4 h-4" />,
      'array': <Code className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedSetting(null);
    setEditingSetting({});
    setIsSubmitting(false);
    setValidationError(null);
  };

  const handleViewSetting = (setting: AdminSetting) => {
    setSelectedSetting(setting);
    setActiveModal('view');
  };

  const handleEditSetting = (setting: AdminSetting) => {
    setSelectedSetting(setting);
    setEditingSetting(setting);
    setActiveModal('edit');
  };

  const handleAddSetting = () => {
    setEditingSetting({
      setting_key: '',
      setting_value: '',
      setting_type: 'string',
      description: ''
    });
    setActiveModal('add');
  };

  const handleDeleteSetting = (setting: AdminSetting) => {
    setSelectedSetting(setting);
    setActiveModal('delete');
  };

  const handleResetSettings = () => {
    setActiveModal('reset');
  };

  const handleSaveSetting = async () => {
    if (!editingSetting.setting_key?.trim()) {
      setValidationError('La clave es obligatoria');
      return;
    }
    if (!editingSetting.setting_value?.trim()) {
      setValidationError('El valor es obligatorio');
      return;
    }

    // Validar valor según el tipo
    if (editingSetting.setting_type && editingSetting.setting_value) {
      const isValid = validateSettingValue(editingSetting.setting_value, editingSetting.setting_type);
      if (!isValid) {
        setValidationError(`Valor inválido para el tipo ${editingSetting.setting_type}`);
        return;
      }
    }

    setIsSubmitting(true);
    setValidationError(null);
    
    try {
      if (activeModal === 'add') {
        await createSetting(editingSetting as Partial<AdminSetting>);
        console.log('✅ Configuración creada exitosamente');
      } else if (activeModal === 'edit' && selectedSetting) {
        await updateSetting(selectedSetting.id, editingSetting as Partial<AdminSetting>);
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

  const handleConfirmDelete = async () => {
    if (!selectedSetting) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteSetting(selectedSetting.id);
      console.log('✅ Configuración eliminada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando configuración:', err);
      alert(`Error al eliminar configuración: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsSubmitting(true);
    
    try {
      await resetToDefaults();
      console.log('✅ Configuraciones restablecidas a valores por defecto');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error restableciendo configuraciones:', err);
      alert(`Error al restablecer configuraciones: ${err instanceof Error ? err.message : 'Error desconocido'}`);
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

  const handleExport = (format: 'json' | 'env' = 'json') => {
    exportSettings(format);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const settingsData = JSON.parse(text);
          await importSettings(settingsData);
          console.log('✅ Configuraciones importadas exitosamente');
        } catch (error) {
          console.error('❌ Error importando configuraciones:', error);
          alert('Error al importar el archivo');
        }
      }
    };
    input.click();
  };

  const handleQuickUpdate = async (setting: AdminSetting, newValue: string) => {
    try {
      await setSettingValue(setting.setting_key, newValue, setting.setting_type);
      console.log('✅ Configuración actualizada rápidamente');
    } catch (err) {
      console.error('❌ Error actualizando configuración:', err);
      alert(`Error al actualizar configuración: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const stats = getSettingsStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando configuraciones...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          <p className="text-gray-600">Gestiona la configuración del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleAddSetting} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Configuración
          </Button>
          <Button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <SettingsIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actualizadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentlyUpdated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Necesitan Atención</p>
                <p className="text-2xl font-bold text-gray-900">{stats.needsAttention}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tipos</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byType).length}</p>
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
                  placeholder="Buscar configuraciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              {types.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('json')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button onClick={() => handleExport('env')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                ENV
              </Button>
              <Button onClick={handleResetSettings} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSettings.map((setting) => (
              <div key={setting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{setting.setting_key}</h3>
                        <Badge className={getTypeBadge(setting.setting_type)}>
                          {getTypeIcon(setting.setting_type)}
                          <span className="ml-1">{setting.setting_type}</span>
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={setting.setting_value}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (validateSettingValue(newValue, setting.setting_type)) {
                                handleQuickUpdate(setting, newValue);
                              }
                            }}
                            className="flex-1"
                            placeholder="Valor de la configuración"
                          />
                          <Button
                            onClick={() => handleQuickUpdate(setting, setting.setting_value)}
                            size="sm"
                            variant="outline"
                          >
                            <SaveIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {setting.description && (
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Actualizado: {new Date(setting.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewSetting(setting)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => handleEditSetting(setting)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteSetting(setting)}
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
          {filteredSettings.length === 0 && (
            <div className="text-center py-8">
              <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron configuraciones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Setting Modal */}
      {activeModal === 'view' && selectedSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Configuración</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clave</label>
                  <p className="text-gray-900 font-mono">{selectedSetting.setting_key}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <Badge className={getTypeBadge(selectedSetting.setting_type)}>
                    {getTypeIcon(selectedSetting.setting_type)}
                    <span className="ml-1">{selectedSetting.setting_type}</span>
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {selectedSetting.setting_value}
                </pre>
              </div>
              {selectedSetting.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-900">{selectedSetting.description}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Actualización</label>
                <p className="text-gray-900">{new Date(selectedSetting.updated_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditSetting(selectedSetting);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Setting Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Nueva Configuración' : 'Editar Configuración'}
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
                    value={editingSetting.setting_key || ''}
                    onChange={(e) => setEditingSetting({...editingSetting, setting_key: e.target.value})}
                    placeholder="site_name"
                    disabled={activeModal === 'edit'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                  <select
                    value={editingSetting.setting_type || 'string'}
                    onChange={(e) => setEditingSetting({...editingSetting, setting_type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {types.filter(type => type !== 'all').map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor *</label>
                <textarea
                  value={editingSetting.setting_value || ''}
                  onChange={(e) => setEditingSetting({...editingSetting, setting_value: e.target.value})}
                  placeholder="Valor de la configuración"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                {editingSetting.setting_type && editingSetting.setting_value && (
                  <div className="mt-1">
                    {validateSettingValue(editingSetting.setting_value, editingSetting.setting_type) ? (
                      <span className="text-green-600 text-sm">✓ Valor válido</span>
                    ) : (
                      <span className="text-red-600 text-sm">✗ Valor inválido para el tipo {editingSetting.setting_type}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={editingSetting.description || ''}
                  onChange={(e) => setEditingSetting({...editingSetting, description: e.target.value})}
                  placeholder="Descripción de la configuración"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            
            {validationError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {validationError}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSetting} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : activeModal === 'edit' ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Setting Confirmation Modal */}
      {activeModal === 'delete' && selectedSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar la configuración "{selectedSetting.setting_key}"? Esta acción no se puede deshacer.
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

      {/* Reset Settings Confirmation Modal */}
      {activeModal === 'reset' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Restablecimiento</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres restablecer todas las configuraciones a sus valores por defecto? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmReset} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Restableciendo...' : 'Restablecer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
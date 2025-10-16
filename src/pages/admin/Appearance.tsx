import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAdminAppearance, AppearanceSetting } from '../../hooks/useAdminAppearance';
import { 
  Palette, 
  Save, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Settings,
  Type,
  Layout,
  Zap,
  AlertTriangle
} from 'lucide-react';

const AdminAppearance: React.FC = () => {
  const { 
    settings, 
    loading, 
    error, 
    fetchSettings,
    createSetting,
    updateSetting,
    deleteSetting
  } = useAdminAppearance();

  const [editingSetting, setEditingSetting] = useState<AppearanceSetting | null>(null);
  const [isCreatingSetting, setIsCreatingSetting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Agrupar configuraciones por tipo
  const settingsByType = useMemo(() => {
    return settings.reduce((acc, setting) => {
      if (!acc[setting.setting_type]) {
        acc[setting.setting_type] = [];
      }
      acc[setting.setting_type].push(setting);
      return acc;
    }, {} as Record<string, AppearanceSetting[]>);
  }, [settings]);

  // Filtrar configuraciones
  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.setting_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (setting.description && setting.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !selectedType || setting.setting_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSaveSetting = async (setting: AppearanceSetting, newValue: any) => {
    try {
      setIsSubmitting(true);
      await updateSetting(setting.setting_key, newValue);
      setEditingSetting(null);
    } catch (err) {
      console.error('Error saving setting:', err);
      alert('Error al guardar configuración: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSetting = async (settingData: Partial<AppearanceSetting>) => {
    try {
      setIsSubmitting(true);
      await createSetting(settingData);
      setIsCreatingSetting(false);
    } catch (err) {
      console.error('Error creating setting:', err);
      alert('Error al crear configuración: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSetting = async (settingKey: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      try {
        setIsSubmitting(true);
        await deleteSetting(settingKey);
      } catch (err) {
        console.error('Error deleting setting:', err);
        alert('Error al eliminar configuración: ' + (err as Error).message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error cargando configuraciones</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Button 
                  onClick={fetchSettings}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Apariencia</h1>
          <p className="text-gray-600 mt-1">Gestiona la apariencia y tema de la aplicación</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            onClick={() => setIsCreatingSetting(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Configuración
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar configuraciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="text">Texto</option>
              <option value="color">Color</option>
              <option value="url">URL</option>
              <option value="number">Número</option>
              <option value="boolean">Booleano</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de configuraciones */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Cargando configuraciones...</p>
          </CardContent>
        </Card>
      ) : filteredSettings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay configuraciones</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType 
                ? 'No se encontraron configuraciones con esos filtros.' 
                : 'Comienza agregando tu primera configuración.'}
            </p>
            {!searchTerm && !selectedType && (
              <Button 
                onClick={() => setIsCreatingSetting(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primera Configuración
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSettings.map((setting) => (
            <Card key={setting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{setting.setting_key}</h3>
                      <Badge variant={setting.is_active ? "default" : "secondary"}>
                        {setting.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        {setting.setting_type}
                      </Badge>
                      {setting.category && (
                        <Badge variant="outline">
                          {setting.category}
                        </Badge>
                      )}
                    </div>
                    
                    {setting.description && (
                      <p className="text-gray-600 mb-3">{setting.description}</p>
                    )}
                    
                    <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Valor:</strong> {typeof setting.setting_value === 'object' 
                          ? JSON.stringify(setting.setting_value) 
                          : String(setting.setting_value)}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-2">
                      <span>Creado: {new Date(setting.created_at).toLocaleDateString()}</span>
                      {setting.updated_at !== setting.created_at && (
                        <span className="ml-4">
                          Actualizado: {new Date(setting.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSetting(setting)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSetting(setting.setting_key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para editar configuración */}
      {editingSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Editar Configuración: {editingSetting.setting_key}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                {editingSetting.setting_type === 'json' ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    value={typeof editingSetting.setting_value === 'object' 
                      ? JSON.stringify(editingSetting.setting_value, null, 2)
                      : String(editingSetting.setting_value)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditingSetting({ ...editingSetting, setting_value: parsed });
                      } catch {
                        setEditingSetting({ ...editingSetting, setting_value: e.target.value });
                      }
                    }}
                  />
                ) : editingSetting.setting_type === 'boolean' ? (
                  <select
                    value={String(editingSetting.setting_value)}
                    onChange={(e) => setEditingSetting({ ...editingSetting, setting_value: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Verdadero</option>
                    <option value="false">Falso</option>
                  </select>
                ) : (
                  <Input
                    type={editingSetting.setting_type === 'number' ? 'number' : 'text'}
                    value={String(editingSetting.setting_value)}
                    onChange={(e) => {
                      const value = editingSetting.setting_type === 'number' 
                        ? parseFloat(e.target.value) 
                        : e.target.value;
                      setEditingSetting({ ...editingSetting, setting_value: value });
                    }}
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Input
                  value={editingSetting.description || ''}
                  onChange={(e) => setEditingSetting({ ...editingSetting, description: e.target.value })}
                  placeholder="Descripción de la configuración"
                />
              </div>
            </CardContent>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={() => setEditingSetting(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => handleSaveSetting(editingSetting, editingSetting.setting_value)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal para crear configuración */}
      {isCreatingSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Agregar Nueva Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clave *
                  </label>
                  <Input
                    placeholder="clave.configuracion"
                    onChange={(e) => setEditingSetting({ 
                      ...editingSetting, 
                      setting_key: e.target.value 
                    } as AppearanceSetting)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    onChange={(e) => setEditingSetting({ 
                      ...editingSetting, 
                      setting_type: e.target.value 
                    } as AppearanceSetting)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="text">Texto</option>
                    <option value="color">Color</option>
                    <option value="url">URL</option>
                    <option value="number">Número</option>
                    <option value="boolean">Booleano</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <Input
                  placeholder="Valor de la configuración"
                  onChange={(e) => setEditingSetting({ 
                    ...editingSetting, 
                    setting_value: e.target.value 
                  } as AppearanceSetting)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Input
                  placeholder="Descripción de la configuración"
                  onChange={(e) => setEditingSetting({ 
                    ...editingSetting, 
                    description: e.target.value 
                  } as AppearanceSetting)}
                />
              </div>
            </CardContent>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={() => setIsCreatingSetting(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => handleCreateSetting(editingSetting as AppearanceSetting)}
                disabled={isSubmitting || !editingSetting?.setting_key || !editingSetting?.setting_value}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Crear
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAppearance;
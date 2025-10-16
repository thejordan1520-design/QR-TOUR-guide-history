import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  QrCode, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Copy, ExternalLink, BarChart3, Save, X, Calendar
} from 'lucide-react';
import { useAdminQRCodes, AdminQRCode } from '../../hooks/useAdminQRCodes';

const QRCodes = () => {
  const { 
    qrCodes, 
    loading, 
    error, 
    createQRCode, 
    updateQRCode, 
    deleteQRCode, 
    toggleQRCodeStatus,
    generateQRCode,
    refetch 
  } = useAdminQRCodes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQRCode, setSelectedQRCode] = useState<AdminQRCode | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingQRCode, setEditingQRCode] = useState<Partial<AdminQRCode>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resourceTypes = ['all', 'destination', 'restaurant', 'service', 'excursion', 'event'];
  const statuses = ['all', 'activo', 'inactivo'];

  const filteredQRCodes = qrCodes.filter(qrCode => {
    const matchesSearch = qrCode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qrCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (qrCode.resource_id?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesType = filterType === 'all' || qrCode.resource_type === filterType;
    const matchesStatus = filterStatus === 'all' || (qrCode.is_active ? 'activo' : 'inactivo') === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: string) => {
    const colors = {
      'destination': 'bg-blue-100 text-blue-800',
      'restaurant': 'bg-green-100 text-green-800',
      'service': 'bg-purple-100 text-purple-800',
      'excursion': 'bg-orange-100 text-orange-800',
      'event': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedQRCode(null);
    setEditingQRCode({});
    setIsSubmitting(false);
  };

  const handleViewQRCode = (qrCode: AdminQRCode) => {
    setSelectedQRCode(qrCode);
    setActiveModal('view');
  };

  const handleEditQRCode = (qrCode: AdminQRCode) => {
    setSelectedQRCode(qrCode);
    setEditingQRCode(qrCode);
    setActiveModal('edit');
  };

  const handleAddQRCode = () => {
    setEditingQRCode({
      code: '',
      title: '',
      resource_type: 'destination',
      resource_id: '',
      metadata: null,
      is_active: true,
      created_by: 'admin',
      created_by_email: 'admin@system.com',
      is_premium: false,
      destination_id: null,
      qr_data: null
    });
    setActiveModal('add');
  };

  const handleDeleteQRCode = (qrCode: AdminQRCode) => {
    setSelectedQRCode(qrCode);
    setActiveModal('delete');
  };

  const handleSaveQRCode = async () => {
    if (!editingQRCode.code?.trim() || !editingQRCode.title?.trim()) {
      alert('El código y título son obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createQRCode(editingQRCode);
        console.log('✅ Código QR creado exitosamente');
      } else if (activeModal === 'edit' && selectedQRCode) {
        await updateQRCode(selectedQRCode.id, editingQRCode);
        console.log('✅ Código QR actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando código QR:', err);
      alert(`Error al guardar código QR: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedQRCode) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteQRCode(selectedQRCode.id);
      console.log('✅ Código QR eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando código QR:', err);
      alert(`Error al eliminar código QR: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Códigos QR actualizados');
    } catch (err) {
      console.error('❌ Error actualizando códigos QR:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando códigos QR...');
    const dataStr = JSON.stringify(qrCodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'codigos-qr.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando códigos QR...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedQRCodes = JSON.parse(e.target?.result as string);
            console.log('✅ Códigos QR importados:', importedQRCodes.length);
            // Aquí podrías implementar la lógica para importar códigos QR
          } catch (error) {
            console.error('❌ Error al importar:', error);
            alert('Error al importar el archivo');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado al portapapeles');
  };

  const totalQRCodes = qrCodes.length;
  const activeQRCodes = qrCodes.filter(q => q.is_active).length;
  const inactiveQRCodes = qrCodes.filter(q => !q.is_active).length;
  const premiumQRCodes = qrCodes.filter(q => q.is_premium).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando códigos QR...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Códigos QR</h2>
          <p className="text-gray-600">Gestiona los códigos QR del sistema</p>
        </div>
        <Button onClick={handleAddQRCode} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Código QR
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalQRCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeQRCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveQRCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-gray-900">{premiumQRCodes}</p>
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
                  placeholder="Buscar códigos QR..."
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                {resourceTypes.filter(type => type !== 'all').map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Código QR</th>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Resource ID</th>
                  <th className="text-left p-3">Creado por</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQRCodes.map((qrCode) => (
                  <tr key={qrCode.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{qrCode.code}</p>
                          <p className="text-xs text-gray-500">ID: {qrCode.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{qrCode.title}</p>
                        {qrCode.is_premium && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getTypeBadge(qrCode.resource_type)}>
                        {qrCode.resource_type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">{qrCode.resource_id}</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-medium">{qrCode.created_by}</p>
                        <p className="text-xs text-gray-500">{qrCode.created_by_email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(qrCode.is_active)}>
                        {qrCode.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewQRCode(qrCode)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditQRCode(qrCode)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleCopyCode(qrCode.code)}
                          variant="outline"
                          size="sm"
                          title="Copiar código"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteQRCode(qrCode)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-500 p-4">
            Mostrando {filteredQRCodes.length} de {totalQRCodes} códigos QR
          </div>
        </CardContent>
      </Card>

      {/* View QR Code Modal */}
      {activeModal === 'view' && selectedQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Código QR</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <p className="text-gray-900 font-mono">{selectedQRCode.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <p className="text-gray-900">{selectedQRCode.title}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Recurso</label>
                  <Badge className={getTypeBadge(selectedQRCode.resource_type)}>
                    {selectedQRCode.resource_type}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                  <p className="text-gray-900">{selectedQRCode.resource_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado por</label>
                  <p className="text-gray-900">{selectedQRCode.created_by}</p>
                  <p className="text-sm text-gray-500">{selectedQRCode.created_by_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedQRCode.is_active)}>
                    {selectedQRCode.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="text-gray-900">{new Date(selectedQRCode.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                  <p className="text-gray-900">{new Date(selectedQRCode.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedQRCode.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Metadatos</label>
                  <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">{selectedQRCode.metadata}</p>
                </div>
              )}
              {selectedQRCode.destination_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination ID</label>
                  <p className="text-gray-900">{selectedQRCode.destination_id}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditQRCode(selectedQRCode);
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

      {/* Add/Edit QR Code Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Agregar Nuevo Código QR' : 'Editar Código QR'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Código *</label>
                <Input
                  value={editingQRCode.code || ''}
                  onChange={(e) => setEditingQRCode({...editingQRCode, code: e.target.value})}
                  placeholder="Código único del QR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Título *</label>
                <Input
                  value={editingQRCode.title || ''}
                  onChange={(e) => setEditingQRCode({...editingQRCode, title: e.target.value})}
                  placeholder="Título del código QR"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Recurso</label>
                  <select
                    value={editingQRCode.resource_type || ''}
                    onChange={(e) => setEditingQRCode({...editingQRCode, resource_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {resourceTypes.filter(type => type !== 'all').map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                  <Input
                    value={editingQRCode.resource_id || ''}
                    onChange={(e) => setEditingQRCode({...editingQRCode, resource_id: e.target.value})}
                    placeholder="ID del recurso asociado"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Metadatos</label>
                <textarea
                  value={editingQRCode.metadata || ''}
                  onChange={(e) => setEditingQRCode({...editingQRCode, metadata: e.target.value})}
                  placeholder="Metadatos adicionales (JSON)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination ID</label>
                  <Input
                    value={editingQRCode.destination_id || ''}
                    onChange={(e) => setEditingQRCode({...editingQRCode, destination_id: e.target.value})}
                    placeholder="ID del destino (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">QR Data</label>
                  <Input
                    value={editingQRCode.qr_data || ''}
                    onChange={(e) => setEditingQRCode({...editingQRCode, qr_data: e.target.value})}
                    placeholder="Datos del QR (opcional)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={editingQRCode.is_active ? 'activo' : 'inactivo'}
                    onChange={(e) => setEditingQRCode({...editingQRCode, is_active: e.target.value === 'activo'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={editingQRCode.is_premium || false}
                    onChange={(e) => setEditingQRCode({...editingQRCode, is_premium: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">
                    Es Premium
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveQRCode} 
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

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el código QR "{selectedQRCode.title}"? Esta acción no se puede deshacer.
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

export default QRCodes;
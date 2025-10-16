import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  ShoppingCart, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, MapPin, Clock, Star, Save, X, Phone, DollarSign, ArrowUpDown
} from 'lucide-react';
import { useAdminSupermarkets, AdminSupermarket } from '../../hooks/useAdminSupermarkets';
import { clearOrderingState } from '../../utils/smartOrderUtils';

const Supermarkets = () => {
  const { 
    supermarkets, 
    loading, 
    error, 
    createSupermarket, 
    updateSupermarket, 
    deleteSupermarket, 
    toggleSupermarketStatus,
    refetch 
  } = useAdminSupermarkets();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSupermarket, setSelectedSupermarket] = useState<AdminSupermarket | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingSupermarket, setEditingSupermarket] = useState<Partial<AdminSupermarket>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordering, setOrdering] = useState<{[id: string]: number}>({});

  const categories = ['all', 'supermercado', 'minimarket', 'tienda', 'farmacia', 'conveniencia'];
  const statuses = ['all', 'activo', 'inactivo'];

  const filteredSupermarkets = supermarkets.filter(supermarket => {
    const matchesSearch = supermarket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supermarket.location?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                         (supermarket.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesCategory = filterCategory === 'all' || supermarket.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (supermarket.is_active ? 'activo' : 'inactivo') === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (category: string | null) => {
    const colors = {
      supermercado: 'bg-blue-100 text-blue-800',
      minimarket: 'bg-green-100 text-green-800',
      tienda: 'bg-purple-100 text-purple-800',
      farmacia: 'bg-red-100 text-red-800',
      conveniencia: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedSupermarket(null);
    setEditingSupermarket({});
    setIsSubmitting(false);
  };

  const handleViewSupermarket = (supermarket: AdminSupermarket) => {
    setSelectedSupermarket(supermarket);
    setActiveModal('view');
  };

  const handleEditSupermarket = (supermarket: AdminSupermarket) => {
    setSelectedSupermarket(supermarket);
    setEditingSupermarket(supermarket);
    setActiveModal('edit');
  };

  const handleAddSupermarket = () => {
    setEditingSupermarket({
      name: '',
      description: '',
      location: '',
      phone: null,
      phone_display: '',
      website_url: '',
      image_url: '',
      category: 'supermercado',
      rating: 0,
      opening_hours: '',
      schedule: null,
      latitude: null,
      longitude: null,
      is_active: true,
      display_order: 999,
      order_position: 0
    });
    setActiveModal('add');
  };

  const handleDeleteSupermarket = (supermarket: AdminSupermarket) => {
    setSelectedSupermarket(supermarket);
    setActiveModal('delete');
  };

  const handleSaveSupermarket = async () => {
    if (!editingSupermarket.name?.trim()) {
      alert('El nombre del supermercado es obligatorio');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createSupermarket(editingSupermarket);
        console.log('✅ Supermercado creado exitosamente');
      } else if (activeModal === 'edit' && selectedSupermarket) {
        await updateSupermarket(selectedSupermarket.id, editingSupermarket);
        console.log('✅ Supermercado actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando supermercado:', err);
      alert(`Error al guardar supermercado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupermarket) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteSupermarket(selectedSupermarket.id);
      console.log('✅ Supermercado eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando supermercado:', err);
      alert(`Error al eliminar supermercado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Supermercados actualizados');
    } catch (err) {
      console.error('❌ Error actualizando supermercados:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando supermercados...');
    const dataStr = JSON.stringify(supermarkets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'supermercados.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando supermercados...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSupermarkets = JSON.parse(e.target?.result as string);
            console.log('✅ Supermercados importados:', importedSupermarkets.length);
            // Aquí podrías implementar la lógica para importar supermercados
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

  const totalSupermarkets = supermarkets.length;
  const activeSupermarkets = supermarkets.filter(s => s.is_active).length;
  const inactiveSupermarkets = supermarkets.filter(s => !s.is_active).length;
  const avgRating = supermarkets.length > 0 
    ? (supermarkets.reduce((sum, s) => sum + (s.rating || 0), 0) / supermarkets.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando supermercados...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Supermercados</h2>
          <p className="text-gray-600">Gestiona los supermercados y tiendas</p>
        </div>
        <Button onClick={handleAddSupermarket} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Supermercado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalSupermarkets}</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeSupermarkets}</p>
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
                <p className="text-2xl font-bold text-gray-900">{inactiveSupermarkets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
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
                  placeholder="Buscar supermercados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.filter(cat => cat !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
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

      {/* Supermarkets Table con drag & drop */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DragDropContext
              onDragEnd={async (result: DropResult) => {
                const { destination, source } = result;
                if (!destination) return;
                if (destination.index === source.index) return;
                
                // Recalcular todas las posiciones para evitar duplicados
                const newSupermarkets = [...filteredSupermarkets];
                const [movedItem] = newSupermarkets.splice(source.index, 1);
                newSupermarkets.splice(destination.index, 0, movedItem);
                
                try {
                  // Usar sistema de orden dinámico con swap automático
                  const draggedSupermarket = filteredSupermarkets[source.index];
                  const targetPosition = destination.index + 1; // Posiciones empiezan en 1
                  
                  console.log(`🔄 Drag & Drop: ${draggedSupermarket.name} → posición ${targetPosition}`);
                  
                  await updateOrderPosition(draggedSupermarket.id, targetPosition);
                  
                  console.log('✅ Drag & Drop completado con sistema dinámico');
                } catch (err) {
                  console.error('❌ Error en drag & drop dinámico:', err);
                }
              }}
            >
              <Droppable droppableId="supermarkets-table">
                {(provided) => (
            <table className="w-full" ref={provided.innerRef} {...provided.droppableProps}>
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Supermercado</th>
                  <th className="text-left p-3">Ubicación</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Orden</th>
                  <th className="text-left p-3">Teléfono</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupermarkets.map((supermarket, index) => (
                  <Draggable key={supermarket.id} draggableId={supermarket.id} index={index}>
                    {(rowProvided) => (
                  <tr ref={rowProvided.innerRef} {...rowProvided.draggableProps} {...rowProvided.dragHandleProps} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{supermarket.name}</p>
                          <p className="text-sm text-gray-500">ID: {supermarket.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{supermarket.location || 'Sin ubicación'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getCategoryBadge(supermarket.category)}>
                        {supermarket.category || 'Sin especificar'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{supermarket.rating || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          max={supermarkets.length}
                          className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                          value={ordering[supermarket.id] ?? supermarket.order_position ?? 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value > 0 && value <= supermarkets.length) {
                              setOrdering(prev => ({ ...prev, [supermarket.id]: value }));
                            }
                          }}
                          onBlur={async () => {
                            const newOrder = ordering[supermarket.id];
                            if (newOrder == null || newOrder <= 0 || Number.isNaN(newOrder)) return;
                            
                            try {
                              console.log(`🔄 Input manual: ${supermarket.name} → posición ${newOrder}`);
                              await updateOrderPosition(supermarket.id, newOrder);
                              
                              // Limpiar el estado local después de la actualización
                              setOrdering(prev => clearOrderingState(prev, supermarket.id));
                              
                              console.log('✅ Actualización manual completada');
                            } catch (err) {
                              console.error('❌ Error en actualización manual:', err);
                              // Resetear el valor si hay error
                              setOrdering(prev => clearOrderingState(prev, supermarket.id));
                            }
                          }}
                          title={`Posición actual: ${supermarket.order_position}. Rango válido: 1-${supermarkets.length}`}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{supermarket.phone_display || supermarket.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(supermarket.is_active)}>
                        {supermarket.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewSupermarket(supermarket)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditSupermarket(supermarket)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteSupermarket(supermarket)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                    )}
                  </Draggable>
                ))}
              </tbody>
              {provided.placeholder}
            </table>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className="mt-4 text-sm text-gray-500 p-4">
            Mostrando {filteredSupermarkets.length} de {totalSupermarkets} supermercados
          </div>
        </CardContent>
      </Card>

      {/* View Supermarket Modal */}
      {activeModal === 'view' && selectedSupermarket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Supermercado</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-gray-900">{selectedSupermarket.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <Badge className={getCategoryBadge(selectedSupermarket.category)}>
                    {selectedSupermarket.category || 'Sin especificar'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="text-gray-900">{selectedSupermarket.description || 'Sin descripción'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <p className="text-gray-900">{selectedSupermarket.location || 'Sin ubicación'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{selectedSupermarket.rating || 0}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-gray-900">{selectedSupermarket.phone_display || selectedSupermarket.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horarios</label>
                  <p className="text-gray-900">{selectedSupermarket.opening_hours || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                  <p className="text-gray-900">{selectedSupermarket.website_url || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedSupermarket.is_active)}>
                    {selectedSupermarket.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditSupermarket(selectedSupermarket);
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

      {/* Add/Edit Supermarket Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Agregar Nuevo Supermercado' : 'Editar Supermercado'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <Input
                  value={editingSupermarket.name || ''}
                  onChange={(e) => setEditingSupermarket({...editingSupermarket, name: e.target.value})}
                  placeholder="Nombre del supermercado"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={editingSupermarket.category || ''}
                    onChange={(e) => setEditingSupermarket({...editingSupermarket, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(cat => cat !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingSupermarket.rating || 0}
                    onChange={(e) => setEditingSupermarket({...editingSupermarket, rating: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <Input
                  value={editingSupermarket.location || ''}
                  onChange={(e) => setEditingSupermarket({...editingSupermarket, location: e.target.value})}
                  placeholder="Ubicación del supermercado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={editingSupermarket.description || ''}
                  onChange={(e) => setEditingSupermarket({...editingSupermarket, description: e.target.value})}
                  placeholder="Descripción del supermercado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <Input
                    value={editingSupermarket.phone_display || ''}
                    onChange={(e) => setEditingSupermarket({...editingSupermarket, phone_display: e.target.value})}
                    placeholder="(809) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horarios</label>
                  <Input
                    value={editingSupermarket.opening_hours || ''}
                    onChange={(e) => setEditingSupermarket({...editingSupermarket, opening_hours: e.target.value})}
                    placeholder="ej: 08:00 - 22:00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                  <Input
                    value={editingSupermarket.website_url || ''}
                    onChange={(e) => setEditingSupermarket({...editingSupermarket, website_url: e.target.value})}
                    placeholder="www.supermercado.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                  <Input
                    value={editingSupermarket.image_url || ''}
                    onChange={(e) => setEditingSupermarket({...editingSupermarket, image_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  value={editingSupermarket.is_active ? 'activo' : 'inactivo'}
                  onChange={(e) => setEditingSupermarket({...editingSupermarket, is_active: e.target.value === 'activo'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSupermarket} 
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
      {activeModal === 'delete' && selectedSupermarket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el supermercado "{selectedSupermarket.name}"? Esta acción no se puede deshacer.
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

export default Supermarkets;
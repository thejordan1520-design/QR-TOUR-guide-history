import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Utensils, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Star, MapPin, Clock, Save, X, Phone, DollarSign, ArrowUpDown
} from 'lucide-react';
import { useAdminRestaurants, AdminRestaurant } from '../../hooks/useAdminRestaurants';
import { clearOrderingState } from '../../utils/smartOrderUtils';

const Restaurants = () => {
  const { 
    restaurants, 
    loading, 
    error, 
    createRestaurant, 
    updateRestaurant, 
    updateOrderPosition,
    deleteRestaurant, 
    toggleRestaurantStatus,
    refetch 
  } = useAdminRestaurants();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<AdminRestaurant | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingRestaurant, setEditingRestaurant] = useState<Partial<AdminRestaurant>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordering, setOrdering] = useState<{[id: string]: number}>({});

  const cuisines = ['all', 'colombiana', 'internacional', 'italiana', 'asiática', 'mexicana', 'café', 'mariscos'];
  const statuses = ['all', 'activo', 'inactivo'];
  const priceRanges = ['all', '$', '$$', '$$$', '$$$$'];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (restaurant.location?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                         (restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesCuisine = filterCuisine === 'all' || restaurant.cuisine_type === filterCuisine;
    const matchesStatus = filterStatus === 'all' || (restaurant.is_active ? 'activo' : 'inactivo') === filterStatus;
    const matchesPriceRange = filterPriceRange === 'all' || restaurant.price_range === filterPriceRange;
    return matchesSearch && matchesCuisine && matchesStatus && matchesPriceRange;
  });

  const getCuisineBadge = (cuisine: string | null) => {
    const colors = {
      colombiana: 'bg-green-100 text-green-800',
      internacional: 'bg-purple-100 text-purple-800',
      italiana: 'bg-red-100 text-red-800',
      asiática: 'bg-orange-100 text-orange-800',
      mexicana: 'bg-yellow-100 text-yellow-800',
      café: 'bg-yellow-100 text-yellow-800',
      mariscos: 'bg-blue-100 text-blue-800'
    };
    return colors[cuisine as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getPriceRangeBadge = (priceRange: string | null) => {
    const colors = {
      '$': 'bg-green-100 text-green-800',
      '$$': 'bg-yellow-100 text-yellow-800',
      '$$$': 'bg-orange-100 text-orange-800',
      '$$$$': 'bg-red-100 text-red-800'
    };
    return colors[priceRange as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Funciones de acciones
  const handleViewRestaurant = (restaurant: AdminRestaurant) => {
    setSelectedRestaurant(restaurant);
    setActiveModal('view');
  };

  const handleEditRestaurant = (restaurant: AdminRestaurant) => {
    setSelectedRestaurant(restaurant);
    setEditingRestaurant({ ...restaurant });
    setActiveModal('edit');
  };

  const handleAddRestaurant = () => {
    setEditingRestaurant({
      name: '',
      description: '',
      address: '',
      phone: '',
      phone_display: '',
      email: '',
      website: '',
      website_url: '',
      image_url: '',
      cuisine_type: 'colombiana',
      price_range: '$$',
      rating: 0,
      opening_hours: '',
      hours: '',
      latitude: null,
      longitude: null,
      location: null,
      is_active: true,
      display_order: 999,
      order_position: 0
    });
    setActiveModal('add');
  };

  const handleDeleteRestaurant = (restaurant: AdminRestaurant) => {
    setSelectedRestaurant(restaurant);
    setActiveModal('delete');
  };

  const handleSaveRestaurant = async () => {
    if (!editingRestaurant.name?.trim()) {
      alert('El nombre del restaurante es obligatorio');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createRestaurant(editingRestaurant);
        console.log('✅ Restaurante creado exitosamente');
      } else if (activeModal === 'edit' && selectedRestaurant) {
        await updateRestaurant(selectedRestaurant.id, editingRestaurant);
        console.log('✅ Restaurante actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando restaurante:', err);
      alert(`Error al guardar restaurante: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRestaurant) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteRestaurant(selectedRestaurant.id);
      console.log('✅ Restaurante eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando restaurante:', err);
      alert(`Error al eliminar restaurante: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Restaurantes actualizados');
    } catch (err) {
      console.error('❌ Error actualizando restaurantes:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando restaurantes...');
    const dataStr = JSON.stringify(restaurants, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'restaurantes.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando restaurantes...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedRestaurants = JSON.parse(e.target?.result as string);
            console.log('✅ Restaurantes importados:', importedRestaurants.length);
            // Aquí podrías implementar la lógica para importar restaurantes
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

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedRestaurant(null);
    setEditingRestaurant({});
  };

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.is_active).length;
  const averageRating = restaurants.length > 0 ? restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurants.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurantes</h2>
          <p className="text-gray-600">Gestiona los restaurantes y establecimientos gastronómicos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            onClick={handleAddRestaurant}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Restaurante
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Restaurantes</p>
                <p className="text-2xl font-bold">{totalRestaurants}</p>
              </div>
              <Utensils className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Restaurantes Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeRestaurants}</p>
              </div>
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Restaurantes Inactivos</p>
                <p className="text-2xl font-bold text-red-600">{totalRestaurants - activeRestaurants}</p>
              </div>
              <Utensils className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, ubicación o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'all' ? 'Todas las cocinas' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'Todos los estados' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priceRanges.map(priceRange => (
                  <option key={priceRange} value={priceRange}>
                    {priceRange === 'all' ? 'Todos los precios' : priceRange}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table con drag & drop */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Restaurantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DragDropContext
              onDragEnd={async (result: DropResult) => {
                const { destination, source } = result;
                if (!destination) return;
                if (destination.index === source.index) return;
                
                // Recalcular todas las posiciones para evitar duplicados
                const newRestaurants = [...filteredRestaurants];
                const [movedItem] = newRestaurants.splice(source.index, 1);
                newRestaurants.splice(destination.index, 0, movedItem);
                
                try {
                  // Usar sistema de orden dinámico con swap automático
                  const draggedRestaurant = filteredRestaurants[source.index];
                  const targetPosition = destination.index + 1; // Posiciones empiezan en 1
                  
                  console.log(`🔄 Drag & Drop: ${draggedRestaurant.name} → posición ${targetPosition}`);
                  
                  await updateOrderPosition(draggedRestaurant.id, targetPosition);
                  
                  console.log('✅ Drag & Drop completado con sistema dinámico');
                } catch (err) {
                  console.error('❌ Error en drag & drop dinámico:', err);
                }
              }}
            >
              <Droppable droppableId="restaurants-table">
                {(provided) => (
            <table className="w-full" ref={provided.innerRef} {...provided.droppableProps}>
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Restaurante</th>
                  <th className="text-left p-3">Ubicación</th>
                  <th className="text-left p-3">Cocina</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Precio</th>
                  <th className="text-left p-3">Orden</th>
                  <th className="text-left p-3">Teléfono</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((restaurant, index) => (
                  <Draggable key={restaurant.id} draggableId={restaurant.id} index={index}>
                    {(rowProvided) => (
                  <tr ref={rowProvided.innerRef} {...rowProvided.draggableProps} {...rowProvided.dragHandleProps} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {restaurant.image_url ? (
                          <img
                            src={restaurant.image_url}
                            alt={restaurant.name}
                            className="w-10 h-10 rounded object-cover border"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }}
                          />
                        ) : (
                          <Utensils className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <p className="font-medium">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">ID: {restaurant.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{restaurant.address || restaurant.location || 'Sin ubicación'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getCuisineBadge(restaurant.cuisine_type)}>
                        {restaurant.cuisine_type || 'Sin especificar'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{restaurant.rating || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getPriceRangeBadge(restaurant.price_range)}>
                        {restaurant.price_range || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          max={restaurants.length}
                          className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                          value={ordering[restaurant.id] ?? restaurant.order_position ?? 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value > 0 && value <= restaurants.length) {
                              setOrdering(prev => ({ ...prev, [restaurant.id]: value }));
                            }
                          }}
                          onBlur={async () => {
                            const newOrder = ordering[restaurant.id];
                            if (newOrder == null || newOrder <= 0 || Number.isNaN(newOrder)) return;
                            
                            try {
                              console.log(`🔄 Input manual: ${restaurant.name} → posición ${newOrder}`);
                              await updateOrderPosition(restaurant.id, newOrder);
                              
                              // Limpiar el estado local después de la actualización
                              setOrdering(prev => clearOrderingState(prev, restaurant.id));
                              
                              console.log('✅ Actualización manual completada');
                            } catch (err) {
                              console.error('❌ Error en actualización manual:', err);
                              // Resetear el valor si hay error
                              setOrdering(prev => clearOrderingState(prev, restaurant.id));
                            }
                          }}
                          title={`Posición actual: ${restaurant.order_position}. Rango válido: 1-${restaurants.length}`}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{restaurant.phone || restaurant.phone_display || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(restaurant.is_active)}>
                        {restaurant.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewRestaurant(restaurant)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditRestaurant(restaurant)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteRestaurant(restaurant)}
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
          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredRestaurants.length} de {totalRestaurants} restaurantes
          </div>
        </CardContent>
      </Card>

      {/* View Restaurant Modal */}
      {activeModal === 'view' && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Restaurante</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-sm text-gray-900">{selectedRestaurant.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cocina</label>
                  <Badge className={getCuisineBadge(selectedRestaurant.cuisine_type)}>
                    {selectedRestaurant.cuisine_type || 'Sin especificar'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedRestaurant.is_active)}>
                    {selectedRestaurant.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <p className="text-sm text-gray-900">{selectedRestaurant.address || selectedRestaurant.location || 'Sin ubicación'}</p>
              </div>
              {selectedRestaurant.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-900">{selectedRestaurant.rating || 0}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rango de Precio</label>
                  <Badge className={getPriceRangeBadge(selectedRestaurant.price_range)}>
                    {selectedRestaurant.price_range || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.phone || selectedRestaurant.phone_display || 'N/A'}</p>
                </div>
              </div>
              {(selectedRestaurant.email || selectedRestaurant.website) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedRestaurant.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedRestaurant.email}</p>
                    </div>
                  )}
                  {selectedRestaurant.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                      <p className="text-sm text-gray-900">{selectedRestaurant.website}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Restaurant Modal */}
      {(activeModal === 'edit' || activeModal === 'add') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'edit' ? 'Editar Restaurante' : 'Agregar Nuevo Restaurante'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <Input
                  value={editingRestaurant.name || ''}
                  onChange={(e) => setEditingRestaurant({...editingRestaurant, name: e.target.value})}
                  placeholder="Nombre del restaurante"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cocina</label>
                  <select
                    value={editingRestaurant.cuisine_type || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, cuisine_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {cuisines.filter(cuisine => cuisine !== 'all').map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rango de Precio</label>
                  <select
                    value={editingRestaurant.price_range || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, price_range: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priceRanges.filter(price => price !== 'all').map(price => (
                      <option key={price} value={price}>{price}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <Input
                  value={editingRestaurant.address || ''}
                  onChange={(e) => setEditingRestaurant({...editingRestaurant, address: e.target.value})}
                  placeholder="Dirección completa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={editingRestaurant.description || ''}
                  onChange={(e) => setEditingRestaurant({...editingRestaurant, description: e.target.value})}
                  placeholder="Descripción del restaurante"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <Input
                    value={editingRestaurant.phone || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, phone: e.target.value})}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={editingRestaurant.email || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, email: e.target.value})}
                    placeholder="restaurante@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                  <Input
                    value={editingRestaurant.website || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, website: e.target.value})}
                    placeholder="www.restaurante.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                  <Input
                    value={editingRestaurant.image_url || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, image_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingRestaurant.rating || 0}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, rating: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horarios</label>
                  <Input
                    value={editingRestaurant.opening_hours || ''}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, opening_hours: e.target.value})}
                    placeholder="ej: 12:00 - 23:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={editingRestaurant.is_active ? 'activo' : 'inactivo'}
                    onChange={(e) => setEditingRestaurant({...editingRestaurant, is_active: e.target.value === 'activo'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveRestaurant} 
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
      {activeModal === 'delete' && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el restaurante "{selectedRestaurant.name}"? Esta acción no se puede deshacer.
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

export default Restaurants;
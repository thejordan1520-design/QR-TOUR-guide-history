import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import SelectNative from '../../components/ui/select-native';
import { useAdminPlaces, AdminPlace } from '../../hooks/useAdminPlaces';
import { clearOrderingState } from '../../utils/smartOrderUtils';
import {
  MapPin, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Star, Users, Map, Save, X, Calendar, Phone, Globe, Mail, ArrowUpDown
} from 'lucide-react';

const Places = () => {
  const { 
    places, 
    loading, 
    error, 
    refetch, 
    createPlace, 
    updatePlace, 
    updateOrderPosition,
    deletePlace, 
    togglePlaceStatus 
  } = useAdminPlaces();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<AdminPlace | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingPlace, setEditingPlace] = useState<Partial<AdminPlace>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [ordering, setOrdering] = useState<{[id: string]: number}>({});
  // Reordenar por input numérico actualización en tiempo real

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'religioso', label: 'Religioso' },
    { value: 'historico', label: 'Histórico' },
    { value: 'natural', label: 'Natural' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'gastronomico', label: 'Gastronómico' },
    { value: 'playa', label: 'Playa' },
    { value: 'montaña', label: 'Montaña' },
    { value: 'ciudad', label: 'Ciudad' },
    { value: 'museo', label: 'Museo' },
    { value: 'parque', label: 'Parque' }
  ];

  const statuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'suspended', label: 'Suspendido' }
  ];

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (place.description && place.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || place.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (place.is_active ? 'active' : 'inactive') === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    const colors = {
      religioso: 'bg-purple-100 text-purple-800',
      historico: 'bg-yellow-100 text-yellow-800',
      natural: 'bg-green-100 text-green-800',
      cultural: 'bg-blue-100 text-blue-800',
      gastronomico: 'bg-orange-100 text-orange-800',
      playa: 'bg-cyan-100 text-cyan-800',
      montaña: 'bg-emerald-100 text-emerald-800',
      ciudad: 'bg-gray-100 text-gray-800',
      museo: 'bg-indigo-100 text-indigo-800',
      parque: 'bg-lime-100 text-lime-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Funciones de acciones
  const handleViewPlace = (place: AdminPlace) => {
    setSelectedPlace(place);
    setActiveModal('view');
  };

  const handleEditPlace = (place: AdminPlace) => {
    setSelectedPlace(place);
    setEditingPlace({ ...place });
    setActiveModal('edit');
  };

  const handleAddPlace = () => {
    setEditingPlace({
      name: '',
      category: 'religioso',
      description: '',
      is_active: true,
      rating: 0,
      latitude: 19.7976, // Coordenadas por defecto de Puerto Plata
      longitude: -70.6934, // Coordenadas por defecto de Puerto Plata
      title: '',
      image_url: null,
      audio_es: null,
      audio_en: null,
      audio_fr: null
    });
    setActiveModal('add');
  };

  const handleDeletePlace = (place: AdminPlace) => {
    setSelectedPlace(place);
    setActiveModal('delete');
  };

  const handleSavePlace = async () => {
    // Validar solo campos esenciales
    if (!editingPlace.name || editingPlace.name.trim() === '') {
      alert('El nombre del lugar es requerido');
      return;
    }

    setIsLoading(true);
    
    try {
      // Preparar datos para enviar a Supabase - solo campos que existen en la tabla destinations
      const placeData = {
        name: editingPlace.name.trim(),
        description: editingPlace.description || null,
        latitude: editingPlace.latitude || null,
        longitude: editingPlace.longitude || null,
        category: editingPlace.category || 'religioso',
        images: null, // null en lugar de array vacío
        rating: editingPlace.rating || 0,
        reviews_count: 0, // Valor por defecto
        is_featured: false, // Valor por defecto
        is_active: editingPlace.is_active !== false, // Por defecto true
        display_order: 0, // Valor por defecto
        unique_id: null, // null por defecto
        serial_code: Date.now(), // Número en lugar de string
        slug: editingPlace.name.toLowerCase().replace(/\s+/g, '-'),
        audio_en: editingPlace.audio_en || null,
        audio_es: editingPlace.audio_es || null,
        audio_fr: editingPlace.audio_fr || null,
        title: editingPlace.title || null,
        image_url: editingPlace.image_url || null,
        audios: null, // null en lugar de array vacío
        order_position: 0 // Valor por defecto
      };

      console.log('🔍 Datos preparados para enviar:', placeData);

      if (activeModal === 'add') {
        await createPlace(placeData);
        console.log('✅ Lugar creado exitosamente');
      } else if (activeModal === 'edit' && selectedPlace) {
        await updatePlace(selectedPlace.id, placeData);
        console.log('✅ Lugar actualizado exitosamente');
      }
      closeAllModals();
    } catch (error) {
      console.error('❌ Error al guardar lugar:', error);
      alert(`Error al guardar el lugar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlace) return;
    
    setIsLoading(true);
    
    try {
      await deletePlace(selectedPlace.id);
      console.log('✅ Lugar eliminado exitosamente');
      closeAllModals();
    } catch (error) {
      console.error('❌ Error al eliminar lugar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    console.log('🔄 Actualizando lugares...');
    
    try {
      await refetch();
      console.log('✅ Lugares actualizados');
    } catch (error) {
      console.error('❌ Error al actualizar lugares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando lugares...');
    const dataStr = JSON.stringify(places, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'lugares.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando lugares...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedPlaces = JSON.parse(e.target?.result as string);
            setPlaces(importedPlaces);
            console.log('✅ Lugares importados:', importedPlaces.length);
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
    setSelectedPlace(null);
    setEditingPlace({});
  };

  const totalPlaces = places.length;
  const activePlaces = places.filter(p => p.is_active).length;
  const totalReviews = places.reduce((sum, p) => sum + (p.reviews_count || 0), 0);
  const averageRating = places.length > 0 
    ? places.reduce((sum, p) => sum + (p.rating || 0), 0) / places.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lugares</h2>
          <p className="text-gray-600">Gestiona los lugares turísticos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            onClick={handleAddPlace}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Lugar
            </Button>
            </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lugares</p>
                <p className="text-2xl font-bold">{totalPlaces}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lugares Activos</p>
                <p className="text-2xl font-bold text-green-600">{activePlaces}</p>
              </div>
              <Map className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reseñas</p>
                <p className="text-2xl font-bold">{totalReviews.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
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
                  placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            </div>
            <div className="w-full sm:w-48">
              <SelectNative
                value={filterCategory}
                onChange={setFilterCategory}
                options={categories}
                placeholder="Selecciona categoría"
              />
            </div>
            <div className="w-full sm:w-48">
              <SelectNative
                value={filterStatus}
                onChange={setFilterStatus}
                options={statuses}
                placeholder="Selecciona estado"
              />
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

      {/* Places Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Lugares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DragDropContext
              onDragEnd={async (result: DropResult) => {
                const { destination, source } = result;
                if (!destination) return;
                if (destination.index === source.index) return;
                
                try {
                  // Usar sistema de orden dinámico con swap automático
                  const draggedPlace = filteredPlaces[source.index];
                  const targetPosition = destination.index + 1; // Posiciones empiezan en 1
                  
                  console.log(`🔄 Drag & Drop: ${draggedPlace.name} → posición ${targetPosition}`);
                  
                  await updateOrderPosition(draggedPlace.id, targetPosition);
                  
                  console.log('✅ Drag & Drop completado con sistema dinámico');
                } catch (err) {
                  console.error('❌ Error en drag & drop dinámico:', err);
                }
              }}
            >
              <Droppable droppableId="places-table">
                {(provided) => (
                  <table className="w-full" ref={provided.innerRef} {...provided.droppableProps}>
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Lugar</th>
                  <th className="text-left p-3">Coordenadas</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Reseñas</th>
                  <th className="text-left p-3">Orden</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Cargando lugares...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : filteredPlaces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No se encontraron lugares
                    </td>
                  </tr>
                ) : (
                  filteredPlaces.map((place, index) => (
                    <Draggable key={place.id} draggableId={place.id} index={index}>
                      {(rowProvided) => (
                    <tr ref={rowProvided.innerRef} {...rowProvided.draggableProps} {...rowProvided.dragHandleProps} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {place.image_url ? (
                            <img
                              src={place.image_url}
                              alt={place.name}
                              className="w-10 h-10 rounded object-cover border"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }}
                            />
                          ) : (
                            <MapPin className="w-4 h-4 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">{place.name}</p>
                            <p className="text-sm text-gray-500">ID: {place.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">
                            {place.latitude && place.longitude 
                              ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}` 
                              : 'Sin coordenadas'
                            }
                          </p>
                          <p className="text-sm text-gray-500">{place.description || 'Sin descripción'}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getCategoryBadge(place.category)}>
                          {place.category || 'Sin categoría'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{place.rating || 0}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{(place.reviews_count || 0).toLocaleString()}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            min="1"
                            max={places.length}
                            className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                            value={ordering[place.id] ?? place.order_position ?? 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0 && value <= places.length) {
                                setOrdering(prev => ({ ...prev, [place.id]: value }));
                              }
                            }}
                            onBlur={async () => {
                              const newOrder = ordering[place.id];
                              if (newOrder == null || newOrder <= 0 || Number.isNaN(newOrder)) return;
                              
                              try {
                                console.log(`🔄 Input manual: ${place.name} → posición ${newOrder}`);
                                await updateOrderPosition(place.id, newOrder);
                                
                                // Limpiar el estado local después de la actualización
                                setOrdering(prev => clearOrderingState(prev, place.id));
                                
                                console.log('✅ Actualización manual completada');
                              } catch (err) {
                                console.error('❌ Error en actualización manual:', err);
                                // Resetear el valor si hay error
                                setOrdering(prev => clearOrderingState(prev, place.id));
                              }
                            }}
                            title={`Posición actual: ${place.order_position}. Rango válido: 1-${places.length}`}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusBadge(place.is_active)}>
                          {place.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewPlace(place)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleEditPlace(place)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeletePlace(place)}
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
                  ))
                )}
                {provided.placeholder}
              </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredPlaces.length} de {totalPlaces} lugares
          </div>
        </CardContent>
      </Card>

      {/* View Place Modal */}
      {activeModal === 'view' && selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Lugar</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-sm text-gray-900">{selectedPlace.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <Badge className={getCategoryBadge(selectedPlace.category)}>
                  {selectedPlace.category || 'Sin categoría'}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <p className="text-sm text-gray-900">{selectedPlace.location || 'Sin ubicación'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <p className="text-sm text-gray-900">{selectedPlace.address || 'Sin dirección'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coordenadas</label>
                <p className="text-sm text-gray-900">
                  {selectedPlace.latitude && selectedPlace.longitude 
                    ? `${selectedPlace.latitude}, ${selectedPlace.longitude}` 
                    : 'Sin coordenadas'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="text-sm text-gray-900">{selectedPlace.description || 'Sin descripción'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-900">{selectedPlace.rating || 0}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visualizaciones</label>
                  <p className="text-sm text-gray-900">{(selectedPlace.view_count || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-sm text-gray-900">{selectedPlace.phone || 'Sin teléfono'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedPlace.email || 'Sin email'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <Badge className={getStatusBadge(selectedPlace.is_active)}>
                  {selectedPlace.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
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

      {/* Edit/Add Place Modal */}
      {(activeModal === 'edit' || activeModal === 'add') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'edit' ? 'Editar Lugar' : 'Agregar Nuevo Lugar'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Nombre</Label>
                <Input
                  value={editingPlace.name || ''}
                  onChange={(e) => setEditingPlace({...editingPlace, name: e.target.value})}
                  placeholder="Nombre del lugar"
                />
              </div>
              <div>
                <SelectNative
                  label="Categoría"
                  value={editingPlace.category || 'restaurant'}
                  onChange={(value) => setEditingPlace({...editingPlace, category: value})}
                  options={categories.filter(cat => cat.value !== 'all')}
                  placeholder="Selecciona categoría"
                />
              </div>
              <div>
                <Label className="font-semibold">Descripción</Label>
                <Textarea
                  value={editingPlace.description || ''}
                  onChange={(e) => setEditingPlace({...editingPlace, description: e.target.value})}
                  placeholder="Descripción del lugar"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Latitud</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingPlace.latitude || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, latitude: parseFloat(e.target.value) || null})}
                    placeholder="10.3910"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Longitud</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingPlace.longitude || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, longitude: parseFloat(e.target.value) || null})}
                    placeholder="-75.4794"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingPlace.rating || 0}
                    onChange={(e) => setEditingPlace({...editingPlace, rating: parseFloat(e.target.value) || 0})}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Estado</Label>
                  <SelectNative
                    value={editingPlace.is_active ? 'active' : 'inactive'}
                    onChange={(value) => setEditingPlace({...editingPlace, is_active: value === 'active'})}
                    options={[
                      { value: 'active', label: 'Activo' },
                      { value: 'inactive', label: 'Inactivo' }
                    ]}
                    placeholder="Selecciona estado"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Título</Label>
                  <Input
                    value={editingPlace.title || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, title: e.target.value})}
                    placeholder="Título del lugar"
                  />
                </div>
                <div>
                  <Label className="font-semibold">URL de Imagen</Label>
                  <Input
                    value={editingPlace.image_url || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, image_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-semibold">Audio Español</Label>
                  <Input
                    value={editingPlace.audio_es || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, audio_es: e.target.value})}
                    placeholder="https://ejemplo.com/audio-es.mp3"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Audio Inglés</Label>
                  <Input
                    value={editingPlace.audio_en || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, audio_en: e.target.value})}
                    placeholder="https://ejemplo.com/audio-en.mp3"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Audio Francés</Label>
                  <Input
                    value={editingPlace.audio_fr || ''}
                    onChange={(e) => setEditingPlace({...editingPlace, audio_fr: e.target.value})}
                    placeholder="https://ejemplo.com/audio-fr.mp3"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePlace} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : activeModal === 'edit' ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el lugar "{selectedPlace.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Places;
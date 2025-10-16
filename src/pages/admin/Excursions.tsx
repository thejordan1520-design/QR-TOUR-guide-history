import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Compass, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Clock, DollarSign, Users, Star, Save, X, MapPin, Phone, Globe, ArrowUpDown
} from 'lucide-react';
import { useAdminExcursions, AdminExcursion } from '../../hooks/useAdminExcursions';
import { clearOrderingState } from '../../utils/smartOrderUtils';

const Excursions = () => {
  const {
    excursions,
    loading,
    error,
    fetchExcursions,
    createExcursion,
    updateExcursion,
    updateOrderPosition,
    deleteExcursion,
    toggleExcursionStatus
  } = useAdminExcursions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedExcursion, setSelectedExcursion] = useState<AdminExcursion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordering, setOrdering] = useState<{[id: string]: number}>({});
  const [formData, setFormData] = useState<Partial<AdminExcursion>>({
    name: '',
    description: '',
    price: null,
    image_url: '',
    location: '',
    phone: '',
    website_url: '',
    is_active: true,
    order_position: 0,
    display_order: 0
  });

  // Función para cerrar todos los modales
  const closeAllModals = () => {
    setActiveModal(null);
    setSelectedExcursion(null);
    setIsSubmitting(false);
    setFormData({
      name: '',
      description: '',
      price: null,
      image_url: '',
      location: '',
      phone: '',
      website_url: '',
      is_active: true,
      order_position: 0,
      display_order: 0
    });
  };

  // Función para abrir modal de agregar
  const handleAddExcursion = () => {
    setFormData({
      name: '',
      description: '',
      price: null,
      image_url: '',
      location: '',
      phone: '',
      website_url: '',
      is_active: true,
      order_position: 0,
      display_order: 0
    });
    setActiveModal('add');
  };

  // Función para abrir modal de editar
  const handleEditExcursion = (excursion: AdminExcursion) => {
    setSelectedExcursion(excursion);
    setFormData(excursion);
    setActiveModal('edit');
  };

  // Función para abrir modal de ver
  const handleViewExcursion = (excursion: AdminExcursion) => {
    setSelectedExcursion(excursion);
    setActiveModal('view');
  };

  // Función para abrir modal de eliminar
  const handleDeleteExcursion = (excursion: AdminExcursion) => {
    setSelectedExcursion(excursion);
    setActiveModal('delete');
  };

  // Función para guardar excursión
  const handleSaveExcursion = async () => {
    try {
      setIsSubmitting(true);
      console.log('🔍 Guardando excursión...');
      console.log('🔍 Modal activo:', activeModal);
      console.log('🔍 Datos del formulario:', formData);
      
      if (activeModal === 'add') {
        console.log('🔍 Creando nueva excursión...');
        await createExcursion(formData);
        console.log('✅ Excursión creada exitosamente');
      } else if (activeModal === 'edit' && selectedExcursion) {
        console.log('🔍 Actualizando excursión existente...');
        await updateExcursion(selectedExcursion.id, formData);
        console.log('✅ Excursión actualizada exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error saving excursion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al ${activeModal === 'add' ? 'crear' : 'actualizar'} excursión: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedExcursion) return;
    
    try {
      setIsSubmitting(true);
      console.log('🔍 Eliminando excursión:', selectedExcursion.id);
      await deleteExcursion(selectedExcursion.id);
      console.log('✅ Excursión eliminada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error deleting excursion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al eliminar excursión: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cambiar estado
  const handleToggleStatus = async (excursion: AdminExcursion) => {
    try {
      console.log('🔍 Cambiando estado de excursión:', excursion.id, 'de', excursion.is_active ? 'activo' : 'inactivo', 'a', !excursion.is_active ? 'activo' : 'inactivo');
      await toggleExcursionStatus(excursion.id);
      console.log('✅ Estado cambiado exitosamente');
    } catch (err) {
      console.error('❌ Error toggling status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al cambiar estado: ${errorMessage}`);
    }
  };

  // Filtrar excursiones
  const filteredExcursions = excursions.filter(excursion => {
    const matchesSearch = excursion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         excursion.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         excursion.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || 
                         (filterStatus === 'activo' && excursion.is_active) ||
                         (filterStatus === 'inactivo' && !excursion.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Función para obtener badge de estado
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
    );
  };

  // Estadísticas
  const stats = {
    total: excursions.length,
    activos: excursions.filter(e => e.is_active).length,
    inactivos: excursions.filter(e => !e.is_active).length,
    precioPromedio: excursions.length > 0 
      ? Math.round(excursions.reduce((sum, e) => sum + (e.price || 0), 0) / excursions.length)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando excursiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchExcursions} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
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
          <h2 className="text-2xl font-bold">Excursiones</h2>
          <p className="text-gray-600">Gestiona las excursiones turísticas</p>
        </div>
        <Button onClick={handleAddExcursion} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Excursión
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Compass className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactivos}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-purple-600">${stats.precioPromedio.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar excursiones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo activos</option>
              <option value="inactivo">Solo inactivos</option>
            </select>
            <Button onClick={fetchExcursions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de excursiones con drag & drop */}
      <DragDropContext
        onDragEnd={async (result: DropResult) => {
          const { destination, source } = result;
          if (!destination) return;
          if (destination.index === source.index) return;
          
          try {
            // Usar sistema de orden dinámico con swap automático
            const draggedExcursion = filteredExcursions[source.index];
            const targetPosition = destination.index + 1; // Posiciones empiezan en 1
            
            console.log(`🔄 Drag & Drop: ${draggedExcursion.name} → posición ${targetPosition}`);
            
            await updateOrderPosition(draggedExcursion.id, targetPosition);
            
            console.log('✅ Drag & Drop completado con sistema dinámico');
          } catch (err) {
            console.error('❌ Error en drag & drop dinámico:', err);
          }
        }}
      >
        <Droppable droppableId="excursions-list">
          {(provided) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" ref={provided.innerRef} {...provided.droppableProps}>
        {filteredExcursions.map((excursion, index) => (
          <Draggable key={excursion.id} draggableId={excursion.id} index={index}>
            {(dragProvided) => (
          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{excursion.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {/* Control de orden */}
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max={excursions.length}
                      className="w-12 px-1 py-0 text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500"
                      value={ordering[excursion.id] ?? excursion.order_position ?? 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0 && value <= excursions.length) {
                          setOrdering(prev => ({ ...prev, [excursion.id]: value }));
                        }
                      }}
                      onBlur={async () => {
                        const newOrder = ordering[excursion.id];
                        if (newOrder == null || newOrder <= 0 || Number.isNaN(newOrder)) return;
                        
                        try {
                          console.log(`🔄 Input manual: ${excursion.name} → posición ${newOrder}`);
                          await updateOrderPosition(excursion.id, newOrder);
                          
                          // Limpiar el estado local después de la actualización
                          setOrdering(prev => clearOrderingState(prev, excursion.id));
                          
                          console.log('✅ Actualización manual completada');
                        } catch (err) {
                          console.error('❌ Error en actualización manual:', err);
                          // Resetear el valor si hay error
                          setOrdering(prev => clearOrderingState(prev, excursion.id));
                        }
                      }}
                      title={`Posición actual: ${excursion.order_position}. Rango válido: 1-${excursions.length}`}
                    />
                  </div>
                  {getStatusBadge(excursion.is_active)}
                </div>
              </div>
            </CardHeader>
                <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {excursion.image_url && (
                  <img
                    src={excursion.image_url}
                    alt={excursion.name}
                    className="w-12 h-12 rounded object-cover border"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }}
                  />
                )}
                {excursion.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{excursion.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                {excursion.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {excursion.location}
                  </div>
                )}
                
                {excursion.price && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${excursion.price.toLocaleString()}
                  </div>
                )}
                
                {excursion.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {excursion.phone}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewExcursion(excursion)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditExcursion(excursion)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteExcursion(excursion)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant={excursion.is_active ? "destructive" : "default"}
                  onClick={() => handleToggleStatus(excursion)}
                >
                  {excursion.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
          )}
        </Droppable>
      </DragDropContext>

      {filteredExcursions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Compass className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron excursiones</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primera excursión'
              }
            </p>
            {(!searchTerm && filterStatus === 'todos') && (
              <Button onClick={handleAddExcursion}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Excursión
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {activeModal === 'add' && (
              <>
                <h3 className="text-lg font-semibold mb-4">Nueva Excursión</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nombre de la excursión"
                      required
                    />
                    {(!formData.name || formData.name.trim() === '') && (
                      <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descripción de la excursión"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio (USD)</label>
                    <Input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || null})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ubicación</label>
                    <Input
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ubicación de la excursión"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL del sitio web</label>
                    <Input
                      value={formData.website_url || ''}
                      onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL de imagen</label>
                    <Input
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>
              </>
            )}

            {activeModal === 'edit' && (
              <>
                <h3 className="text-lg font-semibold mb-4">Editar Excursión</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nombre de la excursión"
                      required
                    />
                    {(!formData.name || formData.name.trim() === '') && (
                      <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descripción de la excursión"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio (USD)</label>
                    <Input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || null})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ubicación</label>
                    <Input
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ubicación de la excursión"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL del sitio web</label>
                    <Input
                      value={formData.website_url || ''}
                      onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL de imagen</label>
                    <Input
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>
              </>
            )}

            {activeModal === 'view' && selectedExcursion && (
              <>
                <h3 className="text-lg font-semibold mb-4">Ver Excursión</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nombre</label>
                    <p className="text-lg">{selectedExcursion.name}</p>
                  </div>
                  {selectedExcursion.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Descripción</label>
                      <p>{selectedExcursion.description}</p>
                    </div>
                  )}
                  {selectedExcursion.price && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Precio</label>
                      <p>${selectedExcursion.price.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedExcursion.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Ubicación</label>
                      <p>{selectedExcursion.location}</p>
                    </div>
                  )}
                  {selectedExcursion.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                      <p>{selectedExcursion.phone}</p>
                    </div>
                  )}
                  {selectedExcursion.website_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Sitio web</label>
                      <a href={selectedExcursion.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedExcursion.website_url}
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estado</label>
                    {getStatusBadge(selectedExcursion.is_active)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Creado</label>
                    <p>{new Date(selectedExcursion.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </>
            )}

            {activeModal === 'delete' && selectedExcursion && (
              <>
                <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
                <p className="mb-4">
                  ¿Estás seguro de que quieres eliminar la excursión "{selectedExcursion.name}"?
                </p>
                <p className="text-sm text-red-600 mb-4">
                  Esta acción no se puede deshacer.
                </p>
              </>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              {activeModal === 'add' || activeModal === 'edit' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={closeAllModals}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveExcursion}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {activeModal === 'add' ? 'Crear' : 'Actualizar'}
                      </>
                    )}
                  </Button>
                </>
              ) : activeModal === 'delete' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={closeAllModals}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={closeAllModals}>
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Excursions;
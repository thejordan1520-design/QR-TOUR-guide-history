import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Briefcase, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, DollarSign, Clock, Star, Save, X, MapPin, User, Phone, ArrowUpDown
} from 'lucide-react';
import { useAdminServices, AdminService } from '../../hooks/useAdminServices';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { clearOrderingState } from '../../utils/smartOrderUtils';

const Services = () => {
  const { 
    services, 
    loading, 
    error, 
    createService, 
    updateService, 
    deleteService, 
    toggleServiceStatus,
    refetch 
  } = useAdminServices();

  const {
    categories: serviceCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    refetch: refetchCategories
  } = useServiceCategories();

  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete' | 'add_category' | 'edit_category' | 'delete_category'>('none');
  const [editingService, setEditingService] = useState<Partial<AdminService>>({});
  const [editingCategory, setEditingCategory] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordering, setOrdering] = useState<{[id: string]: number}>({});

  const categories = ['all', 'Taxis', 'Guías Turísticos', 'excursions', 'events', 'bus', 'turismo', 'transporte', 'alimentación', 'entretenimiento', 'Sin especificar'];
  const types = ['all', 'taxi', 'tourist_guide', 'excursions', 'events', 'bus', 'individual', 'grupal', 'empresarial', 'familiar'];
  const statuses = ['all', 'activo', 'inactivo'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.location?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                         (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesType = filterType === 'all' || service.service_type === filterType;
    const matchesStatus = filterStatus === 'all' || (service.is_active ? 'activo' : 'inactivo') === filterStatus;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getCategoryBadge = (category: string | null) => {
    const colors = {
      'Taxis': 'bg-yellow-100 text-yellow-800',
      'Guías Turísticos': 'bg-blue-100 text-blue-800',
      'excursions': 'bg-green-100 text-green-800',
      'events': 'bg-purple-100 text-purple-800',
      'bus': 'bg-cyan-100 text-cyan-800',
      'turismo': 'bg-indigo-100 text-indigo-800',
      'transporte': 'bg-orange-100 text-orange-800',
      'alimentación': 'bg-red-100 text-red-800',
      'entretenimiento': 'bg-pink-100 text-pink-800',
      'Sin especificar': 'bg-gray-100 text-gray-800'
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
    setSelectedService(null);
    setEditingService({});
    setEditingCategory({});
    setIsSubmitting(false);
  };

  const handleViewService = (service: AdminService) => {
    setSelectedService(service);
    setActiveModal('view');
  };

  const handleEditService = (service: AdminService) => {
    setSelectedService(service);
    setEditingService(service);
    setActiveModal('edit');
  };

  const handleAddService = () => {
    setEditingService({
      name: '',
      service_type: 'individual',
      phone: null,
      phone_display: '',
      image_url: '',
      description: '',
      location: '',
      website_url: '',
      email: '',
      rating: 0,
      is_active: true,
      display_order: 999,
      category: 'turismo',
      price: ''
    });
    setActiveModal('add');
  };

  const handleAddCategory = () => {
    setEditingCategory({
      name: '',
      description: '',
      icon: '💼',
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
      is_active: true,
      display_order: 999,
      route: ''
    });
    setActiveModal('add_category');
  };

  const handleDeleteService = (service: AdminService) => {
    setSelectedService(service);
    setActiveModal('delete');
  };

  const handleSaveService = async () => {
    if (!editingService.name?.trim()) {
      alert('El nombre del servicio es obligatorio');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createService(editingService);
        console.log('✅ Servicio creado exitosamente');
      } else if (activeModal === 'edit' && selectedService) {
        await updateService(selectedService.id, editingService);
        console.log('✅ Servicio actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando servicio:', err);
      alert(`Error al guardar servicio: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedService) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteService(selectedService.id);
      console.log('✅ Servicio eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando servicio:', err);
      alert(`Error al eliminar servicio: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Servicios actualizados');
    } catch (err) {
      console.error('❌ Error actualizando servicios:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando servicios...');
    const dataStr = JSON.stringify(services, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'servicios.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando servicios...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedServices = JSON.parse(e.target?.result as string);
            console.log('✅ Servicios importados:', importedServices.length);
            // Aquí podrías implementar la lógica para importar servicios
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

  const totalServices = services.length;
  const activeServices = services.filter(s => s.is_active).length;
  const inactiveServices = services.filter(s => !s.is_active).length;
  const avgRating = services.length > 0 
    ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando servicios...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
          <p className="text-gray-600">Gestiona los servicios turísticos y comerciales</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddCategory} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Categoría
          </Button>
          <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Servicio
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Servicios ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categorías ({serviceCategories.length})
          </button>
        </nav>
      </div>

      {/* Contenido de Servicios */}
      {activeTab === 'services' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeServices}</p>
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
                <p className="text-2xl font-bold text-gray-900">{inactiveServices}</p>
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
                  placeholder="Buscar servicios..."
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
                {serviceCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
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

      {/* Services Table con drag & drop */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DragDropContext
              onDragEnd={async (result: DropResult) => {
                const { destination, source } = result;
                if (!destination) return;
                if (destination.index === source.index) return;
                
                // Recalcular todas las posiciones para evitar duplicados
                const newServices = [...filteredServices];
                const [movedItem] = newServices.splice(source.index, 1);
                newServices.splice(destination.index, 0, movedItem);
                
                try {
                  // Usar sistema de orden dinámico con swap automático
                  const draggedService = filteredServices[source.index];
                  const targetPosition = destination.index + 1; // Posiciones empiezan en 1
                  
                  console.log(`🔄 Drag & Drop: ${draggedService.name} → posición ${targetPosition}`);
                  
                  await updateOrderPosition(draggedService.id, targetPosition);
                  
                  console.log('✅ Drag & Drop completado con sistema dinámico');
                } catch (err) {
                  console.error('❌ Error en drag & drop dinámico:', err);
                }
              }}
            >
              <Droppable droppableId="services-table">
                {(provided) => (
            <table className="w-full" ref={provided.innerRef} {...provided.droppableProps}>
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Servicio</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Precio</th>
                  <th className="text-left p-3">Orden</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <Draggable key={service.id} draggableId={service.id} index={index}>
                    {(rowProvided) => (
                  <tr ref={rowProvided.innerRef} {...rowProvided.draggableProps} {...rowProvided.dragHandleProps} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-10 h-10 rounded object-cover border"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/places/placeholder.jpg'; }}
                          />
                        ) : (
                          <Briefcase className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">ID: {service.id}</p>
                          <p className="text-xs text-blue-600">
                            {service.source_table === 'services' ? 'Servicio General' :
                             service.source_table === 'taxi_drivers' ? 'Taxi' :
                             service.source_table === 'tourist_guides' ? 'Guía Turístico' : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getCategoryBadge(service.category)}>
                        {service.category || 'Sin especificar'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">{service.service_type || 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{service.rating || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{service.price || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          max={services.length}
                          className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                          value={ordering[service.id] ?? service.order_position ?? service.display_order ?? 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value > 0 && value <= services.length) {
                              setOrdering(prev => ({ ...prev, [service.id]: value }));
                            }
                          }}
                          onBlur={async () => {
                            const newOrder = ordering[service.id];
                            if (newOrder == null || newOrder <= 0 || Number.isNaN(newOrder)) return;
                            
                            try {
                              console.log(`🔄 Input manual: ${service.name} → posición ${newOrder}`);
                              await updateOrderPosition(service.id, newOrder);
                              
                              // Limpiar el estado local después de la actualización
                              setOrdering(prev => clearOrderingState(prev, service.id));
                              
                              console.log('✅ Actualización manual completada');
                            } catch (err) {
                              console.error('❌ Error en actualización manual:', err);
                              // Resetear el valor si hay error
                              setOrdering(prev => clearOrderingState(prev, service.id));
                            }
                          }}
                          title={`Posición actual: ${service.order_position || service.display_order}. Rango válido: 1-${services.length}`}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(service.is_active)}>
                        {service.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewService(service)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditService(service)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteService(service)}
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
            Mostrando {filteredServices.length} de {totalServices} servicios
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Contenido de Categorías */}
      {activeTab === 'categories' && (
        <>
          {/* Tabla de Categorías */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3">Categoría</th>
                      <th className="text-left p-3">Icono</th>
                      <th className="text-left p-3">Descripción</th>
                      <th className="text-left p-3">Ruta</th>
                      <th className="text-left p-3">Orden</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceCategories.map((category) => (
                      <tr key={category.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500">ID: {category.id}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-white ${category.gradient}`}>
                            <span className="text-xl">{category.icon}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">{category.description || 'Sin descripción'}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-blue-600">{category.route}</span>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-gray-100 text-gray-800">
                            {category.display_order}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {category.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedCategory(category);
                                setEditingCategory(category);
                                setActiveModal('edit_category');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedCategory(category);
                                setActiveModal('delete_category');
                              }}
                              variant="outline"
                              size="sm"
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
                Mostrando {serviceCategories.length} categorías
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* View Service Modal */}
      {activeModal === 'view' && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Servicio</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-gray-900">{selectedService.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <Badge className={getCategoryBadge(selectedService.category)}>
                    {selectedService.category || 'Sin especificar'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-gray-900">{selectedService.service_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{selectedService.rating || 0}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="text-gray-900">{selectedService.description || 'Sin descripción'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <p className="text-gray-900">{selectedService.location || 'Sin ubicación'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <p className="text-gray-900">{selectedService.price || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-gray-900">{selectedService.phone_display || selectedService.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedService.email || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                <p className="text-gray-900">{selectedService.website_url || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <Badge className={getStatusBadge(selectedService.is_active)}>
                  {selectedService.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditService(selectedService);
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

      {/* Add/Edit Service Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Agregar Nuevo Servicio' : 'Editar Servicio'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <Input
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  placeholder="Nombre del servicio"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una categoría</option>
                    {serviceCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={editingService.service_type || ''}
                    onChange={(e) => setEditingService({...editingService, service_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {types.filter(type => type !== 'all').map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  placeholder="Descripción del servicio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <Input
                    value={editingService.location || ''}
                    onChange={(e) => setEditingService({...editingService, location: e.target.value})}
                    placeholder="Ubicación del servicio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <Input
                    value={editingService.price || ''}
                    onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                    placeholder="ej: $50,000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <Input
                    value={editingService.phone_display || ''}
                    onChange={(e) => setEditingService({...editingService, phone_display: e.target.value})}
                    placeholder="(809) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={editingService.email || ''}
                    onChange={(e) => setEditingService({...editingService, email: e.target.value})}
                    placeholder="servicio@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                  <Input
                    value={editingService.website_url || ''}
                    onChange={(e) => setEditingService({...editingService, website_url: e.target.value})}
                    placeholder="www.servicio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingService.rating || 0}
                    onChange={(e) => setEditingService({...editingService, rating: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                <Input
                  value={editingService.image_url || ''}
                  onChange={(e) => setEditingService({...editingService, image_url: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  value={editingService.is_active ? 'activo' : 'inactivo'}
                  onChange={(e) => setEditingService({...editingService, is_active: e.target.value === 'activo'})}
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
                onClick={handleSaveService} 
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
      {activeModal === 'delete' && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el servicio "{selectedService.name}"? Esta acción no se puede deshacer.
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

      {/* Add Category Modal */}
      {activeModal === 'add_category' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Agregar Nueva Categoría</h3>
                <p className="text-sm text-gray-600 mt-1">Crea una nueva categoría de servicios para el frontend público</p>
              </div>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Nombre de la categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <Input
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  placeholder="Ej: Farmacias, Hospedaje Local, Real Estate"
                  className="w-full"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  placeholder="Descripción breve de la categoría"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Icono (Emoji o Lucide) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono *
                </label>
                <select
                  value={editingCategory.icon || '💼'}
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <optgroup label="Categorías Existentes">
                    <option value="🍴">🍴 Restaurantes</option>
                    <option value="🛒">🛒 Supermercados</option>
                    <option value="🚖">🚖 Taxis</option>
                    <option value="👨‍🏫">👨‍🏫 Guías Turísticos</option>
                    <option value="⛰️">⛰️ Excursiones</option>
                    <option value="🚌">🚌 Buses</option>
                    <option value="📅">📅 Eventos</option>
                  </optgroup>
                  <optgroup label="Nuevas Categorías">
                    <option value="💊">💊 Farmacias</option>
                    <option value="🏨">🏨 Hospedaje/Hoteles</option>
                    <option value="🏠">🏠 Real Estate</option>
                    <option value="☕">☕ Cafeterías</option>
                    <option value="🛍️">🛍️ Tiendas</option>
                    <option value="💼">💼 Servicios Profesionales</option>
                    <option value="🔧">🔧 Reparaciones</option>
                    <option value="💇">💇 Peluquerías/Salones</option>
                    <option value="💪">💪 Gimnasios</option>
                    <option value="❤️">❤️ Salud/Médicos</option>
                    <option value="✈️">✈️ Transporte Aéreo</option>
                    <option value="🎭">🎭 Entretenimiento</option>
                    <option value="🎨">🎨 Arte y Cultura</option>
                    <option value="📚">📚 Educación</option>
                    <option value="🏖️">🏖️ Playas</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">El emoji se convertirá en un icono profesional en el frontend</p>
              </div>

              {/* Gradiente/Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color/Gradiente
                </label>
                <select
                  value={editingCategory.gradient || 'bg-gradient-to-br from-gray-500 to-gray-600'}
                  onChange={(e) => setEditingCategory({...editingCategory, gradient: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bg-gradient-to-br from-rose-500 to-pink-500">Rosa a Pink (Restaurantes)</option>
                  <option value="bg-gradient-to-br from-emerald-500 to-teal-500">Esmeralda a Teal (Supermercados)</option>
                  <option value="bg-gradient-to-br from-amber-500 to-orange-500">Ámbar a Naranja (Taxis)</option>
                  <option value="bg-gradient-to-br from-sky-500 to-blue-500">Cielo a Azul (Guías)</option>
                  <option value="bg-gradient-to-br from-violet-500 to-purple-500">Violeta a Púrpura (Excursiones)</option>
                  <option value="bg-gradient-to-br from-cyan-500 to-indigo-500">Cyan a Índigo (Buses)</option>
                  <option value="bg-gradient-to-br from-fuchsia-500 to-pink-600">Fucsia a Pink (Eventos)</option>
                  <option value="bg-gradient-to-br from-red-500 to-rose-600">Rojo a Rosa (Farmacias)</option>
                  <option value="bg-gradient-to-br from-blue-500 to-cyan-600">Azul a Cyan (Hospedaje)</option>
                  <option value="bg-gradient-to-br from-green-500 to-emerald-600">Verde a Esmeralda (Real Estate)</option>
                  <option value="bg-gradient-to-br from-yellow-500 to-orange-500">Amarillo a Naranja</option>
                  <option value="bg-gradient-to-br from-purple-500 to-indigo-600">Púrpura a Índigo</option>
                  <option value="bg-gradient-to-br from-gray-500 to-gray-600">Gris</option>
                </select>
                <div className="mt-2 p-4 rounded-lg text-white text-center font-semibold" style={{background: editingCategory.gradient?.replace('bg-gradient-to-br', 'linear-gradient(to bottom right,').replace('from-', '').replace('to-', ', ').replace(/-(\d+)/g, '') || 'gray'}}>
                  Vista Previa del Color
                </div>
              </div>

              {/* Ruta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruta en el Frontend
                </label>
                <Input
                  value={editingCategory.route || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, route: e.target.value})}
                  placeholder="Ej: /services/pharmacies"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Se generará automáticamente si no se especifica</p>
              </div>

              {/* Orden de visualización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden de Visualización
                </label>
                <Input
                  type="number"
                  value={editingCategory.display_order || 999}
                  onChange={(e) => setEditingCategory({...editingCategory, display_order: parseInt(e.target.value)})}
                  className="w-full"
                  min={0}
                />
                <p className="text-xs text-gray-500 mt-1">Menor número = aparece primero</p>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCategory.is_active ?? true}
                  onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Categoría activa (visible en el frontend)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!editingCategory.name?.trim()) {
                    alert('El nombre de la categoría es obligatorio');
                    return;
                  }
                  
                  setIsSubmitting(true);
                  try {
                    console.log('📂 Creando categoría:', editingCategory);
                    await createCategory(editingCategory);
                    alert('✅ Categoría creada exitosamente');
                    await refetchCategories();
                    closeAllModals();
                  } catch (err) {
                    console.error('Error creando categoría:', err);
                    alert('❌ Error al crear categoría: ' + (err instanceof Error ? err.message : 'Error desconocido'));
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!editingCategory.name?.trim() || isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creando...' : 'Crear Categoría'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {activeModal === 'edit_category' && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Editar Categoría</h3>
                <p className="text-sm text-gray-600 mt-1">Modifica los detalles de la categoría</p>
              </div>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Reutilizar los mismos campos del modal de agregar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría *</label>
                <Input
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.is_active ?? true}
                    onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Categoría activa (visible en el frontend)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button onClick={closeAllModals} variant="outline">Cancelar</Button>
              <Button 
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await updateCategory(selectedCategory.id, editingCategory);
                    alert('✅ Categoría actualizada exitosamente');
                    await refetchCategories();
                    closeAllModals();
                  } catch (err) {
                    alert('❌ Error al actualizar categoría');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!editingCategory.name?.trim() || isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {activeModal === 'delete_category' && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar la categoría "{selectedCategory.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">Cancelar</Button>
              <Button 
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await deleteCategory(selectedCategory.id);
                    alert('✅ Categoría eliminada exitosamente');
                    await refetchCategories();
                    closeAllModals();
                  } catch (err) {
                    alert('❌ Error al eliminar categoría');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
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

export default Services;
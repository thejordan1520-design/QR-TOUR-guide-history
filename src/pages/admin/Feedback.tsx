import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  MessageSquare, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Star, User, CheckCircle, Save, X, Mail, Calendar, ThumbsUp
} from 'lucide-react';
import { useAdminFeedback, AdminFeedback } from '../../hooks/useAdminFeedback';

const Feedback = () => {
  const { 
    feedback, 
    loading, 
    error, 
    createFeedback, 
    updateFeedback, 
    deleteFeedback, 
    addAdminResponse,
    togglePublicStatus,
    incrementHelpfulCount,
    publishAsTestimony,
    featureInHomePage,
    refetch 
  } = useAdminFeedback();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedback | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete' | 'response'>('none');
  const [editingFeedback, setEditingFeedback] = useState<Partial<AdminFeedback>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  const categories = ['all', 'general', 'excursion', 'restaurant', 'service', 'event', 'complaint', 'suggestion'];
  const ratings = ['all', '5', '4', '3', '2', '1'];
  const statuses = ['all', 'public', 'private', 'responded', 'pending'];

  const filteredFeedback = feedback.filter(feedbackItem => {
    const matchesSearch = feedbackItem.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (feedbackItem.destination_title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                         feedbackItem.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || feedbackItem.category === filterCategory;
    const matchesRating = filterRating === 'all' || feedbackItem.rating.toString() === filterRating;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'public' && feedbackItem.is_public) ||
      (filterStatus === 'private' && !feedbackItem.is_public) ||
      (filterStatus === 'responded' && feedbackItem.admin_response) ||
      (filterStatus === 'pending' && !feedbackItem.admin_response);
    return matchesSearch && matchesCategory && matchesRating && matchesStatus;
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'general': 'bg-gray-100 text-gray-800',
      'excursion': 'bg-blue-100 text-blue-800',
      'restaurant': 'bg-green-100 text-green-800',
      'service': 'bg-purple-100 text-purple-800',
      'event': 'bg-orange-100 text-orange-800',
      'complaint': 'bg-red-100 text-red-800',
      'suggestion': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (feedbackItem: AdminFeedback) => {
    if (feedbackItem.admin_response) {
      return 'bg-green-100 text-green-800';
    } else if (feedbackItem.is_public) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (feedbackItem: AdminFeedback) => {
    if (feedbackItem.admin_response) {
      return 'Respondido';
    } else if (feedbackItem.is_public) {
      return 'Público';
    } else {
      return 'Privado';
    }
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedFeedback(null);
    setEditingFeedback({});
    setAdminResponse('');
    setIsSubmitting(false);
  };

  const handleViewFeedback = (feedbackItem: AdminFeedback) => {
    setSelectedFeedback(feedbackItem);
    setActiveModal('view');
  };

  const handleEditFeedback = (feedbackItem: AdminFeedback) => {
    setSelectedFeedback(feedbackItem);
    setEditingFeedback(feedbackItem);
    setActiveModal('edit');
  };

  const handleAddFeedback = () => {
    setEditingFeedback({
      user_id: '',
      destination_id: null,
      destination_title: null,
      destination_description: null,
      rating: 5,
      comment: '',
      category: 'general',
      is_public: true,
      admin_response: null,
      responded_at: null,
      helpful_count: 0,
      display_order: 999
    });
    setActiveModal('add');
  };

  const handleDeleteFeedback = (feedbackItem: AdminFeedback) => {
    setSelectedFeedback(feedbackItem);
    setActiveModal('delete');
  };

  const handleAddResponse = (feedbackItem: AdminFeedback) => {
    setSelectedFeedback(feedbackItem);
    setAdminResponse('');
    setActiveModal('response');
  };

  const handleSaveFeedback = async () => {
    if (!editingFeedback.comment?.trim() || !editingFeedback.user_id?.trim()) {
      alert('Comentario y usuario son obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createFeedback(editingFeedback);
        console.log('✅ Feedback creado exitosamente');
      } else if (activeModal === 'edit' && selectedFeedback) {
        await updateFeedback(selectedFeedback.id, editingFeedback);
        console.log('✅ Feedback actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando feedback:', err);
      alert(`Error al guardar feedback: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFeedback) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteFeedback(selectedFeedback.id);
      console.log('✅ Feedback eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando feedback:', err);
      alert(`Error al eliminar feedback: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !adminResponse.trim()) {
      alert('La respuesta es obligatoria');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addAdminResponse(selectedFeedback.id, adminResponse);
      console.log('✅ Respuesta agregada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error agregando respuesta:', err);
      alert(`Error al agregar respuesta: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublic = async (feedbackItem: AdminFeedback) => {
    try {
      await togglePublicStatus(feedbackItem.id);
      console.log('✅ Estado público actualizado');
    } catch (err) {
      console.error('❌ Error actualizando estado público:', err);
      alert(`Error al actualizar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleIncrementHelpful = async (feedbackItem: AdminFeedback) => {
    try {
      await incrementHelpfulCount(feedbackItem.id);
      console.log('✅ Contador de útil incrementado');
    } catch (err) {
      console.error('❌ Error incrementando contador:', err);
      alert(`Error al incrementar contador: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handlePublishTestimony = async (feedbackItem: AdminFeedback) => {
    try {
      await publishAsTestimony(feedbackItem.id);
      const action = feedbackItem.is_published ? 'despublicado' : 'publicado';
      console.log(`✅ Testimonio ${action} exitosamente`);
    } catch (err) {
      console.error('❌ Error publicando testimonio:', err);
      alert(`Error al publicar testimonio: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleFeatureInHomePage = async (feedbackItem: AdminFeedback) => {
    try {
      // Si se está quitando de destacados, no preguntar orden
      if (feedbackItem.is_featured) {
        await featureInHomePage(feedbackItem.id, 0);
        console.log('✅ Testimonio quitado de HomePage');
        return;
      }

      // Si se está agregando, determinar el siguiente orden disponible
      const featuredTestimonials = feedback.filter(f => f.is_featured);
      
      if (featuredTestimonials.length >= 3) {
        alert('Ya hay 3 testimonios destacados en la HomePage. Debes quitar uno primero.');
        return;
      }

      // Determinar siguiente orden (1, 2, o 3)
      const usedOrders = featuredTestimonials.map(f => f.featured_order || 0);
      let nextOrder = 1;
      while (usedOrders.includes(nextOrder) && nextOrder <= 3) {
        nextOrder++;
      }

      await featureInHomePage(feedbackItem.id, nextOrder);
      console.log(`✅ Testimonio destacado en HomePage (posición ${nextOrder})`);
    } catch (err) {
      console.error('❌ Error destacando en HomePage:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Feedback actualizado');
    } catch (err) {
      console.error('❌ Error actualizando feedback:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando feedback...');
    const dataStr = JSON.stringify(feedback, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'feedback.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando feedback...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedFeedback = JSON.parse(e.target?.result as string);
            console.log('✅ Feedback importado:', importedFeedback.length);
            // Aquí podrías implementar la lógica para importar feedback
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

  const totalFeedback = feedback.length;
  const publicFeedback = feedback.filter(f => f.is_public).length;
  const respondedFeedback = feedback.filter(f => f.admin_response).length;
  const avgRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando feedback...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
          <p className="text-gray-600">Gestiona los comentarios y reseñas de usuarios</p>
        </div>
        <Button onClick={handleAddFeedback} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Feedback
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Públicos</p>
                <p className="text-2xl font-bold text-gray-900">{publicFeedback}</p>
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
                <p className="text-sm font-medium text-gray-600">Respondidos</p>
                <p className="text-2xl font-bold text-gray-900">{respondedFeedback}</p>
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
                  placeholder="Buscar feedback..."
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
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los ratings</option>
                {ratings.filter(rating => rating !== 'all').map(rating => (
                  <option key={rating} value={rating}>{rating} estrellas</option>
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

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Usuario</th>
                  <th className="text-left p-3">Destino</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Comentario</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((feedbackItem) => (
                  <tr key={feedbackItem.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {feedbackItem.user?.display_name || feedbackItem.user?.email || feedbackItem.user_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(feedbackItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-sm">{feedbackItem.destination_title || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{feedbackItem.destination_id || ''}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {getRatingStars(feedbackItem.rating)}
                        <span className="text-sm font-medium ml-1">{feedbackItem.rating}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{feedbackItem.comment}</p>
                        {feedbackItem.admin_response && (
                          <p className="text-xs text-blue-600 mt-1">Respondido</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getCategoryBadge(feedbackItem.category)}>
                        {feedbackItem.category}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(feedbackItem)}>
                        {getStatusText(feedbackItem)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <Button
                          onClick={() => handleViewFeedback(feedbackItem)}
                          variant="outline"
                          size="sm"
                          title="Ver detalles"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleAddResponse(feedbackItem)}
                          variant="outline"
                          size="sm"
                          title="Responder"
                          className={feedbackItem.admin_response ? 'bg-blue-50' : ''}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handlePublishTestimony(feedbackItem)}
                          variant="outline"
                          size="sm"
                          title={feedbackItem.is_published ? 'Despublicar testimonio' : 'Publicar como testimonio'}
                          className={feedbackItem.is_published ? 'bg-yellow-50 border-yellow-300' : ''}
                        >
                          {feedbackItem.is_published ? '⭐' : '📰'}
                        </Button>
                        <Button
                          onClick={() => handleFeatureInHomePage(feedbackItem)}
                          variant="outline"
                          size="sm"
                          title={feedbackItem.is_featured ? `Quitar de HomePage (Pos. ${feedbackItem.featured_order})` : 'Destacar en HomePage (máx. 3)'}
                          className={feedbackItem.is_featured ? 'bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300' : ''}
                        >
                          {feedbackItem.is_featured ? `🏠${feedbackItem.featured_order}` : '🏠'}
                        </Button>
                        <Button
                          onClick={() => handleTogglePublic(feedbackItem)}
                          variant="outline"
                          size="sm"
                          title={feedbackItem.is_public ? 'Hacer privado' : 'Hacer público'}
                        >
                          {feedbackItem.is_public ? '🔒' : '🌐'}
                        </Button>
                        <Button
                          onClick={() => handleEditFeedback(feedbackItem)}
                          variant="outline"
                          size="sm"
                          title="Editar"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteFeedback(feedbackItem)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
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
            Mostrando {filteredFeedback.length} de {totalFeedback} feedback
          </div>
        </CardContent>
      </Card>

      {/* View Feedback Modal */}
      {activeModal === 'view' && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Feedback</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="text-gray-900">{selectedFeedback.user_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center gap-1">
                    {getRatingStars(selectedFeedback.rating)}
                    <span className="ml-2 font-medium">{selectedFeedback.rating}/5</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destino</label>
                  <p className="text-gray-900">{selectedFeedback.destination_title || 'N/A'}</p>
                  {selectedFeedback.destination_id && (
                    <p className="text-sm text-gray-500">ID: {selectedFeedback.destination_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <Badge className={getCategoryBadge(selectedFeedback.category)}>
                    {selectedFeedback.category}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comentario</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedFeedback.comment}</p>
              </div>
              {selectedFeedback.admin_response && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Respuesta del Admin</label>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded">{selectedFeedback.admin_response}</p>
                  {selectedFeedback.responded_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Respondido el: {new Date(selectedFeedback.responded_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedFeedback)}>
                    {getStatusText(selectedFeedback)}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Útil</label>
                  <p className="text-gray-900">{selectedFeedback.helpful_count} personas</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="text-gray-900">{new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditFeedback(selectedFeedback);
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

      {/* Add Response Modal */}
      {activeModal === 'response' && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Responder Feedback</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {/* Feedback Original */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Original</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {selectedFeedback.user?.display_name || selectedFeedback.user?.email || 'Usuario'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRatingStars(selectedFeedback.rating)}
                      <span className="text-sm ml-1">{selectedFeedback.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-900 text-sm">{selectedFeedback.comment}</p>
                </div>
              </div>

              {/* Respuestas Rápidas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 Respuestas Rápidas (Haz clic para usar)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {/* Respuesta Positiva */}
                  <button
                    type="button"
                    onClick={() => setAdminResponse("¡Muchas gracias por tu comentario! 😊 Nos alegra mucho que hayas disfrutado tu experiencia con QR Tour. Tu opinión es muy valiosa para nosotros y nos motiva a seguir mejorando. ¡Esperamos verte pronto nuevamente!")}
                    className="p-3 text-left border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">😊</span>
                      <div className="flex-1">
                        <div className="font-medium text-green-900 mb-1">Respuesta Positiva (4-5 ⭐)</div>
                        <p className="text-sm text-green-700 line-clamp-2 group-hover:line-clamp-none">
                          "¡Muchas gracias por tu comentario! Nos alegra mucho que hayas disfrutado tu experiencia..."
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Respuesta Negativa */}
                  <button
                    type="button"
                    onClick={() => setAdminResponse("Lamentamos mucho tu experiencia. 😔 Tu feedback es muy importante para nosotros y tomaremos acciones inmediatas para mejorar. Un miembro de nuestro equipo se pondrá en contacto contigo pronto para resolver cualquier inconveniente. Gracias por tu paciencia.")}
                    className="p-3 text-left border-2 border-red-200 bg-red-50 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">😔</span>
                      <div className="flex-1">
                        <div className="font-medium text-red-900 mb-1">Respuesta Negativa (1-2 ⭐)</div>
                        <p className="text-sm text-red-700 line-clamp-2 group-hover:line-clamp-none">
                          "Lamentamos mucho tu experiencia. Tu feedback es muy importante y tomaremos acciones..."
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Respuesta Neutral */}
                  <button
                    type="button"
                    onClick={() => setAdminResponse("Gracias por compartir tu experiencia con nosotros. 👍 Valoramos mucho tu opinión y estamos trabajando constantemente para mejorar nuestros servicios. Si tienes alguna sugerencia específica, no dudes en contactarnos. ¡Hasta pronto!")}
                    className="p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">👍</span>
                      <div className="flex-1">
                        <div className="font-medium text-blue-900 mb-1">Respuesta Neutral (3 ⭐)</div>
                        <p className="text-sm text-blue-700 line-clamp-2 group-hover:line-clamp-none">
                          "Gracias por compartir tu experiencia con nosotros. Valoramos mucho tu opinión..."
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Respuesta Personalizada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✏️ Personalizar Respuesta *
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Selecciona una respuesta rápida arriba o escribe tu propia respuesta aquí..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {adminResponse.length} caracteres
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitResponse} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || !adminResponse.trim()}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Feedback Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Agregar Nuevo Feedback' : 'Editar Feedback'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario ID *</label>
                <Input
                  value={editingFeedback.user_id || ''}
                  onChange={(e) => setEditingFeedback({...editingFeedback, user_id: e.target.value})}
                  placeholder="ID del usuario"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destino ID</label>
                  <Input
                    value={editingFeedback.destination_id || ''}
                    onChange={(e) => setEditingFeedback({...editingFeedback, destination_id: e.target.value})}
                    placeholder="ID del destino"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título del Destino</label>
                  <Input
                    value={editingFeedback.destination_title || ''}
                    onChange={(e) => setEditingFeedback({...editingFeedback, destination_title: e.target.value})}
                    placeholder="Título del destino"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <select
                    value={editingFeedback.rating || 5}
                    onChange={(e) => setEditingFeedback({...editingFeedback, rating: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} estrellas</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={editingFeedback.category || 'general'}
                    onChange={(e) => setEditingFeedback({...editingFeedback, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(cat => cat !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comentario *</label>
                <textarea
                  value={editingFeedback.comment || ''}
                  onChange={(e) => setEditingFeedback({...editingFeedback, comment: e.target.value})}
                  placeholder="Comentario del usuario..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción del Destino</label>
                <textarea
                  value={editingFeedback.destination_description || ''}
                  onChange={(e) => setEditingFeedback({...editingFeedback, destination_description: e.target.value})}
                  placeholder="Descripción del destino..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editingFeedback.is_public || false}
                  onChange={(e) => setEditingFeedback({...editingFeedback, is_public: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                  Es público
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveFeedback} 
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
      {activeModal === 'delete' && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este feedback? Esta acción no se puede deshacer.
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

export default Feedback;
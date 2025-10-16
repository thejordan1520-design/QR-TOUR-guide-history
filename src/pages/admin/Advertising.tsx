import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Megaphone, Plus, Search, RefreshCw, Edit, Trash2, Save, Eye, MousePointer, 
  Clock, Calendar, AlertTriangle, Power, PowerOff, Image as ImageIcon
} from 'lucide-react';
import { useAdminAdvertising, AdminAdvertisement } from '../../hooks/useAdminAdvertising';

const Advertising = () => {
  const { 
    advertisements, 
    loading, 
    error, 
    fetchAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementStatus
  } = useAdminAdvertising();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdminAdvertisement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingAd, setEditingAd] = useState<Partial<AdminAdvertisement>>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    target_url: '',
    is_active: true,
    priority: 1,
    display_duration: 60,
    expires_at: ''
  });

  const filteredAds = advertisements.filter(ad =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad.description && ad.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateAdvertisement = async () => {
    // Validación básica
    if (!editingAd.title?.trim()) {
      alert('El título es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createAdvertisement(editingAd);
      
      setActiveModal(null);
      setEditingAd({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        target_url: '',
        is_active: true,
        priority: 1,
        display_duration: 60,
        expires_at: ''
      });
    } catch (err) {
      console.error('Error creando anuncio:', err);
      alert('Error al crear anuncio: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdvertisement = async () => {
    if (!selectedAd) return;
    
    try {
      setIsSubmitting(true);
      await updateAdvertisement(selectedAd.id, editingAd);
      setActiveModal(null);
      setSelectedAd(null);
      setEditingAd({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        target_url: '',
        is_active: true,
        priority: 1,
        display_duration: 60,
        expires_at: ''
      });
    } catch (err) {
      console.error('Error actualizando anuncio:', err);
      alert('Error al actualizar anuncio: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdvertisement = async () => {
    if (!selectedAd) return;
    
    try {
      setIsSubmitting(true);
      await deleteAdvertisement(selectedAd.id);
      setActiveModal(null);
      setSelectedAd(null);
    } catch (err) {
      console.error('Error eliminando anuncio:', err);
      alert('Error al eliminar anuncio: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAdvertisementStatus(id);
    } catch (err) {
      console.error('Error cambiando estado:', err);
      alert('Error al cambiar estado: ' + (err as Error).message);
    }
  };

  const handleAddAd = () => {
    setEditingAd({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      target_url: '',
      is_active: true,
      priority: 1,
      display_duration: 60,
      expires_at: ''
    });
    setActiveModal('add');
  };

  const handleEditAd = (ad: AdminAdvertisement) => {
    setSelectedAd(ad);
    setEditingAd(ad);
    setActiveModal('edit');
  };

  const handleDeleteAd = (ad: AdminAdvertisement) => {
    setSelectedAd(ad);
    setActiveModal('delete');
  };

  const closeAllModals = () => {
    setActiveModal(null);
    setSelectedAd(null);
    setEditingAd({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      target_url: '',
      is_active: true,
      priority: 1,
      display_duration: 60,
      expires_at: ''
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error cargando anuncios</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Button 
                  onClick={fetchAdvertisements}
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
          <h1 className="text-3xl font-bold text-gray-900">Publicidad</h1>
          <p className="text-gray-600 mt-1">Gestiona los anuncios y banners de la aplicación</p>
        </div>
        <Button onClick={handleAddAd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Anuncio
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar anuncios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchAdvertisements}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de anuncios */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Cargando anuncios...</p>
          </CardContent>
        </Card>
      ) : filteredAds.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay anuncios</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No se encontraron anuncios con ese criterio de búsqueda.' : 'Comienza agregando tu primer anuncio.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddAd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Anuncio
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Imagen miniatura */}
                  <div className="flex-shrink-0 mr-4">
                    {ad.image_url ? (
                      <div className="relative">
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        Prioridad: {ad.priority}
                      </Badge>
                    </div>
                    
                    {ad.description && (
                      <p className="text-gray-600 mb-3">{ad.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{ad.view_count || 0} vistas</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MousePointer className="w-4 h-4" />
                        <span>{ad.click_count || 0} clics</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{ad.display_duration}s</span>
                      </div>
                      {ad.expires_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Expira: {new Date(ad.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={ad.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(ad.id)}
                      className={ad.is_active ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "bg-green-600 hover:bg-green-700"}
                      title={ad.is_active ? "Desactivar anuncio" : "Activar anuncio"}
                    >
                      {ad.is_active ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAd(ad)}
                      title="Editar anuncio"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAd(ad)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar anuncio"
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

      {/* Modal para agregar/editar anuncio */}
      {activeModal === 'add' || activeModal === 'edit' ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>
                {activeModal === 'add' ? 'Agregar Anuncio' : 'Editar Anuncio'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  value={editingAd.title || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  placeholder="Título del anuncio"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={editingAd.description || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                  placeholder="Descripción del anuncio"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Imagen
                  </label>
                  <Input
                    value={editingAd.image_url || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, image_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {/* Vista previa de la imagen */}
                  {editingAd.image_url && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                      <div className="relative">
                        <img
                          src={editingAd.image_url}
                          alt="Vista previa"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Enlace
                  </label>
                  <Input
                    value={editingAd.link_url || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, link_url: e.target.value })}
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={editingAd.priority || 1}
                    onChange={(e) => setEditingAd({ ...editingAd, priority: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (segundos)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingAd.display_duration || 60}
                    onChange={(e) => setEditingAd({ ...editingAd, display_duration: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Expiración
                  </label>
                  <Input
                    type="date"
                    value={editingAd.expires_at ? new Date(editingAd.expires_at).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingAd({ ...editingAd, expires_at: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingAd.is_active || false}
                  onChange={(e) => setEditingAd({ ...editingAd, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Anuncio activo
                </label>
              </div>
            </CardContent>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={closeAllModals}>
                Cancelar
              </Button>
              <Button
                onClick={activeModal === 'add' ? handleCreateAdvertisement : handleUpdateAdvertisement}
                disabled={isSubmitting || !editingAd.title?.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {activeModal === 'add' ? 'Crear' : 'Actualizar'}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Modal de confirmación de eliminación */}
      {activeModal === 'delete' && selectedAd ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">Eliminar Anuncio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar el anuncio "{selectedAd.title}"? 
                Esta acción no se puede deshacer.
              </p>
            </CardContent>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={closeAllModals}>
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteAdvertisement}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default Advertising;
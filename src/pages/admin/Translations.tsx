import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Languages, Plus, Search, RefreshCw, Edit, Trash2, Check, X, Save, 
  AlertTriangle
} from 'lucide-react';
import { useAdminTranslations, Translation } from '../../hooks/useAdminTranslations';

const Translations = () => {
  const { 
    translations, 
    loading, 
    error, 
    fetchTranslations,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    toggleTranslationStatus
  } = useAdminTranslations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedContext, setSelectedContext] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingTranslation, setEditingTranslation] = useState<Partial<Translation>>({
    key: '',
    language: 'es',
    value: '',
    context: 'general',
    category: 'ui',
    is_active: true
  });

  const contexts = ['admin', 'frontend', 'global', 'email', 'system'];
  const categories = ['ui', 'nav', 'messages', 'errors', 'success', 'form', 'services', 'profile', 'subscription'];
  const languages = ['es', 'en', 'fr'];

  // Filtrar traducciones
  const filteredTranslations = translations.filter((translation: Translation) => {
    const matchesSearch = translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !selectedLanguage || translation.language === selectedLanguage;
    const matchesContext = !selectedContext || translation.context === selectedContext;
    const matchesCategory = !selectedCategory || translation.category === selectedCategory;
    
    return matchesSearch && matchesLanguage && matchesContext && matchesCategory;
  });

  const handleCreateTranslation = async () => {
    try {
      setIsSubmitting(true);
      await createTranslation(editingTranslation);
      setActiveModal(null);
      setEditingTranslation({
        key: '',
        language: 'es',
        value: '',
        context: 'general',
        category: 'ui',
        is_active: true
      });
    } catch (err) {
      console.error('Error creando traducción:', err);
      alert('Error al crear traducción: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTranslation = async () => {
    if (!selectedTranslation) return;
    
    try {
      setIsSubmitting(true);
      await updateTranslation(selectedTranslation.id, editingTranslation);
      setActiveModal(null);
      setSelectedTranslation(null);
      setEditingTranslation({
        key: '',
        language: 'es',
        value: '',
        context: 'general',
        category: 'ui',
        is_active: true
      });
    } catch (err) {
      console.error('Error actualizando traducción:', err);
      alert('Error al actualizar traducción: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTranslation = async () => {
    if (!selectedTranslation) return;
    
    try {
      setIsSubmitting(true);
      await deleteTranslation(selectedTranslation.id);
      setActiveModal(null);
      setSelectedTranslation(null);
    } catch (err) {
      console.error('Error eliminando traducción:', err);
      alert('Error al eliminar traducción: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleTranslationStatus(id);
    } catch (err) {
      console.error('Error cambiando estado:', err);
      alert('Error al cambiar estado: ' + (err as Error).message);
    }
  };

  const handleAddTranslation = () => {
    setEditingTranslation({
      key: '',
      language: selectedLanguage,
      value: '',
      context: 'general',
      category: 'ui',
      is_active: true
    });
    setActiveModal('add');
  };

  const handleEditTranslation = (translation: Translation) => {
    setSelectedTranslation(translation);
    setEditingTranslation(translation);
    setActiveModal('edit');
  };

  const handleDeleteTranslationClick = (translation: Translation) => {
    setSelectedTranslation(translation);
    setActiveModal('delete');
  };

  const closeAllModals = () => {
    setActiveModal(null);
    setSelectedTranslation(null);
    setEditingTranslation({
      key: '',
      language: 'es',
      value: '',
      context: 'general',
      category: 'ui',
      is_active: true
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
                <h3 className="text-lg font-semibold text-red-800">Error cargando traducciones</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Button 
                  onClick={fetchTranslations}
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
          <h1 className="text-3xl font-bold text-gray-900">Traducciones</h1>
          <p className="text-gray-600 mt-1">Gestiona las traducciones de la aplicación</p>
        </div>
        <Button onClick={handleAddTranslation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Traducción
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar traducciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los idiomas</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los contextos</option>
              {contexts.map(context => (
                <option key={context} value={context}>{context}</option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Button 
                variant="outline" 
                onClick={fetchTranslations}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de traducciones */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Cargando traducciones...</p>
          </CardContent>
        </Card>
      ) : filteredTranslations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Languages className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay traducciones</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedLanguage || selectedContext || selectedCategory 
                ? 'No se encontraron traducciones con esos filtros.' 
                : 'Comienza agregando tu primera traducción.'}
            </p>
            {!searchTerm && !selectedLanguage && !selectedContext && !selectedCategory && (
              <Button onClick={handleAddTranslation} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primera Traducción
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTranslations.map((translation) => (
            <Card key={translation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{translation.key}</h3>
                      <Badge variant={translation.is_active ? "default" : "secondary"}>
                        {translation.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        {translation.language.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {translation.context}
                      </Badge>
                      <Badge variant="outline">
                        {translation.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{translation.value}</p>
                    
                    <div className="text-sm text-gray-500">
                      <span>Creado: {new Date(translation.created_at).toLocaleDateString()}</span>
                      {translation.updated_at !== translation.created_at && (
                        <span className="ml-4">
                          Actualizado: {new Date(translation.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(translation.id)}
                    >
                      {translation.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTranslation(translation)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTranslationClick(translation)}
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

      {/* Modal para agregar/editar traducción */}
      {activeModal === 'add' || activeModal === 'edit' ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>
                {activeModal === 'add' ? 'Agregar Traducción' : 'Editar Traducción'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clave *
                  </label>
                  <Input
                    value={editingTranslation.key || ''}
                    onChange={(e) => setEditingTranslation({ ...editingTranslation, key: e.target.value })}
                    placeholder="clave.traduccion"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma *
                  </label>
                  <select
                    value={editingTranslation.language || 'es'}
                    onChange={(e) => setEditingTranslation({ ...editingTranslation, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={editingTranslation.value || ''}
                  onChange={(e) => setEditingTranslation({ ...editingTranslation, value: e.target.value })}
                  placeholder="Texto traducido"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contexto
                  </label>
                  <select
                    value={editingTranslation.context || 'general'}
                    onChange={(e) => setEditingTranslation({ ...editingTranslation, context: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {contexts.map(context => (
                      <option key={context} value={context}>{context}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={editingTranslation.category || 'ui'}
                    onChange={(e) => setEditingTranslation({ ...editingTranslation, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingTranslation.is_active || false}
                  onChange={(e) => setEditingTranslation({ ...editingTranslation, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Traducción activa
                </label>
              </div>
            </CardContent>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={closeAllModals}>
                Cancelar
              </Button>
              <Button
                onClick={activeModal === 'add' ? handleCreateTranslation : handleUpdateTranslation}
                disabled={isSubmitting || !editingTranslation.key || !editingTranslation.value}
                className="bg-blue-600 hover:bg-blue-700"
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
      {activeModal === 'delete' && selectedTranslation ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">Eliminar Traducción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar la traducción "{selectedTranslation.key}"? 
                Esta acción no se puede deshacer.
              </p>
            </CardContent>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={closeAllModals}>
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteTranslation}
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

export default Translations;
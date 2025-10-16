import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Trophy, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Star, Target, Zap, Save, X, Award, Crown
} from 'lucide-react';
import { useAdminGamification, AdminBadge } from '../../hooks/useAdminGamification';

const Gamification = () => {
  const { 
    badges, 
    loading, 
    error, 
    createBadge, 
    updateBadge, 
    deleteBadge, 
    toggleBadgeStatus,
    refetch 
  } = useAdminGamification();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<AdminBadge | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingBadge, setEditingBadge] = useState<Partial<AdminBadge>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  const types = ['all', 'qr_scans', 'visits', 'reviews', 'shares', 'streak', 'special'];
  const statuses = ['all', 'active', 'inactive'];

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || badge.rarity === filterRarity;
    const matchesType = filterType === 'all' || badge.requirement_type === filterType;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? badge.is_active : !badge.is_active);
    return matchesSearch && matchesRarity && matchesType && matchesStatus;
  });

  const getRarityBadge = (rarity: string) => {
    const colors = {
      'common': 'bg-gray-100 text-gray-800',
      'uncommon': 'bg-green-100 text-green-800',
      'rare': 'bg-blue-100 text-blue-800',
      'epic': 'bg-purple-100 text-purple-800',
      'legendary': 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'qr_scans': 'bg-blue-100 text-blue-800',
      'visits': 'bg-green-100 text-green-800',
      'reviews': 'bg-yellow-100 text-yellow-800',
      'shares': 'bg-purple-100 text-purple-800',
      'streak': 'bg-red-100 text-red-800',
      'special': 'bg-pink-100 text-pink-800'
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
    setSelectedBadge(null);
    setEditingBadge({});
    setIsSubmitting(false);
  };

  const handleViewBadge = (badge: AdminBadge) => {
    setSelectedBadge(badge);
    setActiveModal('view');
  };

  const handleEditBadge = (badge: AdminBadge) => {
    setSelectedBadge(badge);
    setEditingBadge(badge);
    setActiveModal('edit');
  };

  const handleAddBadge = () => {
    setEditingBadge({
      name: '',
      description: '',
      icon: '🏆',
      requirement_type: 'qr_scans',
      requirement_value: 1,
      rarity: 'common',
      reward_points: 10,
      is_active: true
    });
    setActiveModal('add');
  };

  const handleDeleteBadge = (badge: AdminBadge) => {
    setSelectedBadge(badge);
    setActiveModal('delete');
  };

  const handleSaveBadge = async () => {
    if (!editingBadge.name?.trim() || !editingBadge.description?.trim()) {
      alert('El nombre y descripción son obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createBadge(editingBadge);
        console.log('✅ Insignia creada exitosamente');
      } else if (activeModal === 'edit' && selectedBadge) {
        await updateBadge(selectedBadge.id, editingBadge);
        console.log('✅ Insignia actualizada exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando insignia:', err);
      alert(`Error al guardar insignia: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBadge) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteBadge(selectedBadge.id);
      console.log('✅ Insignia eliminada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando insignia:', err);
      alert(`Error al eliminar insignia: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Insignias actualizadas');
    } catch (err) {
      console.error('❌ Error actualizando insignias:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando insignias...');
    const dataStr = JSON.stringify(badges, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'insignias.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando insignias...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedBadges = JSON.parse(e.target?.result as string);
            console.log('✅ Insignias importadas:', importedBadges.length);
            // Aquí podrías implementar la lógica para importar insignias
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

  const totalBadges = badges.length;
  const activeBadges = badges.filter(b => b.is_active).length;
  const inactiveBadges = badges.filter(b => !b.is_active).length;
  const totalPoints = badges.reduce((sum, b) => sum + b.reward_points, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando insignias...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Gamificación</h2>
          <p className="text-gray-600">Gestiona las insignias y logros</p>
        </div>
        <Button onClick={handleAddBadge} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear Insignia
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalBadges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{activeBadges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveBadges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
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
                  placeholder="Buscar insignias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las rarezas</option>
                {rarities.filter(rarity => rarity !== 'all').map(rarity => (
                  <option key={rarity} value={rarity}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</option>
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

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <Card key={badge.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{badge.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                </div>
                <Badge className={getStatusBadge(badge.is_active)}>
                  {badge.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getRarityBadge(badge.rarity)}>
                  {badge.rarity}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{badge.reward_points} pts</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {badge.requirement_type.replace('_', ' ')}: {badge.requirement_value}
                  </span>
                </div>
                <Badge className={getTypeBadge(badge.requirement_type)}>
                  {badge.requirement_type.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleViewBadge(badge)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button
                  onClick={() => handleEditBadge(badge)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  onClick={() => toggleBadgeStatus(badge.id)}
                  variant="outline"
                  size="sm"
                  className={badge.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                >
                  {badge.is_active ? <X className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                </Button>
                <Button
                  onClick={() => handleDeleteBadge(badge)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron insignias</p>
          </CardContent>
        </Card>
      )}

      {/* View Badge Modal */}
      {activeModal === 'view' && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Insignia</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                <h2 className="text-2xl font-bold">{selectedBadge.name}</h2>
                <p className="text-gray-600">{selectedBadge.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rareza</label>
                  <Badge className={getRarityBadge(selectedBadge.rarity)}>
                    {selectedBadge.rarity}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Puntos de Recompensa</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{selectedBadge.reward_points}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Requisito</label>
                  <Badge className={getTypeBadge(selectedBadge.requirement_type)}>
                    {selectedBadge.requirement_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor Requerido</label>
                  <p className="text-gray-900">{selectedBadge.requirement_value}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <Badge className={getStatusBadge(selectedBadge.is_active)}>
                  {selectedBadge.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="text-gray-900">{new Date(selectedBadge.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditBadge(selectedBadge);
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

      {/* Add/Edit Badge Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Crear Nueva Insignia' : 'Editar Insignia'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <Input
                    value={editingBadge.name || ''}
                    onChange={(e) => setEditingBadge({...editingBadge, name: e.target.value})}
                    placeholder="Nombre de la insignia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Icono</label>
                  <Input
                    value={editingBadge.icon || '🏆'}
                    onChange={(e) => setEditingBadge({...editingBadge, icon: e.target.value})}
                    placeholder="🏆"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                <textarea
                  value={editingBadge.description || ''}
                  onChange={(e) => setEditingBadge({...editingBadge, description: e.target.value})}
                  placeholder="Descripción de la insignia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Requisito</label>
                  <select
                    value={editingBadge.requirement_type || 'qr_scans'}
                    onChange={(e) => setEditingBadge({...editingBadge, requirement_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {types.filter(type => type !== 'all').map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor Requerido</label>
                  <Input
                    type="number"
                    value={editingBadge.requirement_value || 1}
                    onChange={(e) => setEditingBadge({...editingBadge, requirement_value: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rareza</label>
                  <select
                    value={editingBadge.rarity || 'common'}
                    onChange={(e) => setEditingBadge({...editingBadge, rarity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {rarities.filter(rarity => rarity !== 'all').map(rarity => (
                      <option key={rarity} value={rarity}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Puntos de Recompensa</label>
                  <Input
                    type="number"
                    value={editingBadge.reward_points || 10}
                    onChange={(e) => setEditingBadge({...editingBadge, reward_points: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingBadge.is_active ?? true}
                    onChange={(e) => setEditingBadge({...editingBadge, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Insignia activa</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveBadge} 
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
      {activeModal === 'delete' && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar la insignia "{selectedBadge.name}"? Esta acción no se puede deshacer.
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

export default Gamification;
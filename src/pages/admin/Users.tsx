import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import SelectNative from '../../components/ui/select-native';
import { useAdminUsers, AdminUser } from '../../hooks/useAdminUsers';
import { 
  User, UserPlus, Search, Plus, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Mail, Shield, Save, X, Calendar, Phone, Globe, Star
} from 'lucide-react';

const Users = () => {
  // Usar el hook de Supabase en lugar de datos mock
  const { 
    users, 
    loading, 
    error, 
    refetch, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus, 
    updateUserRole, 
    updateUserPlan 
  } = useAdminUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingUser, setEditingUser] = useState<Partial<AdminUser>>({});
  const [isLoading, setIsLoading] = useState(false);

  const roles = ['all', 'admin', 'user', 'moderator'];
  const statuses = ['all', 'active', 'inactive'];
  const planTypes = ['free', 'basic', 'premium', 'pro'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? user.is_active : !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800">Activo</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
  };

  const getPlanBadge = (planType: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      pro: 'bg-yellow-100 text-yellow-800'
    };
    return colors[planType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Funciones de acciones usando el hook de Supabase
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setActiveModal('view');
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditingUser({
      display_name: user.display_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      phone: user.phone,
      bio: user.bio,
      plan_type: user.plan_type,
      language_preference: user.language_preference,
      notifications_enabled: user.notifications_enabled
    });
    setActiveModal('edit');
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setActiveModal('delete');
  };

  const handleAddUser = () => {
    setEditingUser({
      display_name: '',
      email: '',
      role: 'user',
      is_active: true,
      phone: '',
      bio: '',
      plan_type: 'free',
      language_preference: 'es',
      notifications_enabled: true
    });
    setActiveModal('add');
  };

  const handleSaveUser = async () => {
    setIsLoading(true);
    try {
      if (activeModal === 'add') {
        const result = await createUser(editingUser);
        if (!result.success) {
          console.error('Error creating user:', result.error);
          alert('Error al crear usuario: ' + result.error);
          return;
        }
      } else if (activeModal === 'edit' && selectedUser) {
        const result = await updateUser(selectedUser.id, editingUser);
        if (!result.success) {
          console.error('Error updating user:', result.error);
          alert('Error al actualizar usuario: ' + result.error);
          return;
        }
      }
      closeAllModals();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const result = await deleteUser(selectedUser.id);
      if (!result.success) {
        console.error('Error deleting user:', result.error);
        alert('Error al eliminar usuario: ' + result.error);
        return;
      }
      closeAllModals();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    setIsLoading(true);
    try {
      const result = await toggleUserStatus(user.id);
      if (!result.success) {
        console.error('Error toggling user status:', result.error);
        alert('Error al cambiar estado: ' + result.error);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado');
    } finally {
      setIsLoading(false);
    }
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedUser(null);
    setEditingUser({});
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'usuarios-exportados.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Mostrar loading o error
  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 mb-4">Error al cargar usuarios: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h2>
          <p className="text-gray-600 dark:text-gray-400">Gestiona los usuarios del sistema desde Supabase</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleExportUsers} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administradores</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Premium</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.plan_type !== 'free').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
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
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'Todos los roles' : role}
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
                    {status === 'all' ? 'Todos los estados' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.display_name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {getInitials(user.display_name)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.display_name}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      {user.is_verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs mt-1">Verificado</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getPlanBadge(user.plan_type)}>
                        {user.plan_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isLoading}
                          className={user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {user.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {users.length === 0 
                ? 'No hay usuarios registrados en el sistema'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            <Button onClick={handleAddUser}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Usuario
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Single Modal - No Overlapping */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeAllModals}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {activeModal === 'view' ? 'Detalles del Usuario' : 
               activeModal === 'add' ? 'Nuevo Usuario' : 
               activeModal === 'edit' ? 'Editar Usuario' : 
               'Confirmar Eliminación'}
            </h2>
            
            {activeModal === 'view' && selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Nombre</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.display_name}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Email</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Teléfono</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Rol</Label>
                    <div className="mt-1">
                      <Badge className={getRoleBadge(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Plan</Label>
                    <div className="mt-1">
                      <Badge className={getPlanBadge(selectedUser.plan_type)}>
                        {selectedUser.plan_type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Estado</Label>
                    <div className="mt-1">{getStatusBadge(selectedUser.is_active)}</div>
                  </div>
                </div>
                {selectedUser.bio && (
                  <div>
                    <Label className="font-semibold">Biografía</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedUser.bio}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Fecha de Registro</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Último Acceso</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedUser.last_sign_in_at ? formatDate(selectedUser.last_sign_in_at) : 'Nunca'}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Puntos Gamificación</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.gamification_points}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Gasto Total</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${selectedUser.total_spent}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeModal === 'edit' || activeModal === 'add') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Nombre Completo</Label>
                    <Input
                      value={editingUser.display_name || ''}
                      onChange={(e) => setEditingUser({...editingUser, display_name: e.target.value})}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold">Email</Label>
                    <Input
                      type="email"
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Teléfono</Label>
                    <Input
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div>
                    <SelectNative
                      label="Rol"
                      value={editingUser.role || 'user'}
                      onChange={(value) => {
                        console.log('Role changed to:', value);
                        setEditingUser({...editingUser, role: value});
                      }}
                      options={[
                        { value: 'user', label: 'Usuario' },
                        { value: 'admin', label: 'Administrador' },
                        { value: 'moderator', label: 'Moderador' }
                      ]}
                      placeholder="Selecciona rol"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SelectNative
                      label="Plan"
                      value={editingUser.plan_type || 'free'}
                      onChange={(value) => {
                        console.log('Plan changed to:', value);
                        setEditingUser({...editingUser, plan_type: value});
                      }}
                      options={[
                        { value: 'free', label: 'Gratuito' },
                        { value: 'basic', label: 'Básico' },
                        { value: 'premium', label: 'Premium' },
                        { value: 'pro', label: 'Pro' }
                      ]}
                      placeholder="Selecciona plan"
                    />
                  </div>
                  <div>
                    <SelectNative
                      label="Idioma"
                      value={editingUser.language_preference || 'es'}
                      onChange={(value) => {
                        console.log('Language changed to:', value);
                        setEditingUser({...editingUser, language_preference: value});
                      }}
                      options={[
                        { value: 'es', label: 'Español' },
                        { value: 'en', label: 'Inglés' },
                        { value: 'fr', label: 'Francés' }
                      ]}
                      placeholder="Selecciona idioma"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Biografía</Label>
                  <Textarea
                    value={editingUser.bio || ''}
                    onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                    placeholder="Biografía del usuario"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editingUser.is_active || false}
                      onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="is_active" className="text-sm">Usuario Activo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifications_enabled"
                      checked={editingUser.notifications_enabled || false}
                      onChange={(e) => setEditingUser({...editingUser, notifications_enabled: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="notifications_enabled" className="text-sm">Notificaciones Habilitadas</Label>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'delete' && selectedUser && (
              <div className="py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  ¿Estás seguro de que deseas eliminar al usuario "{selectedUser.display_name}"? Esta acción no se puede deshacer.
                </p>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {selectedUser.avatar_url ? (
                        <img src={selectedUser.avatar_url} alt={selectedUser.display_name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {getInitials(selectedUser.display_name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedUser.display_name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Rol: {selectedUser.role} | Plan: {selectedUser.plan_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              {activeModal === 'view' ? (
                <Button variant="outline" onClick={closeAllModals}>
                  Cerrar
                </Button>
              ) : activeModal === 'delete' ? (
                <>
                  <Button variant="outline" onClick={closeAllModals}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
                    {isLoading ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={closeAllModals}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveUser} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Guardando...' : (activeModal === 'edit' ? 'Actualizar' : 'Crear')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  CreditCard, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Check, X, DollarSign, Calendar, Save, Clock, User
} from 'lucide-react';
import { useAdminPayments, AdminPayment } from '../../hooks/useAdminPayments';

const Payments = () => {
  const { 
    payments, 
    loading, 
    error, 
    createPayment, 
    updatePayment, 
    deletePayment, 
    updatePaymentStatus,
    refetch 
  } = useAdminPayments();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete'>('none');
  const [editingPayment, setEditingPayment] = useState<Partial<AdminPayment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses = ['all', 'pending', 'completed', 'failed', 'cancelled', 'refunded'];
  const methods = ['all', 'card', 'paypal', 'bank_transfer', 'crypto', 'cash'];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'card': 'bg-blue-100 text-blue-800',
      'paypal': 'bg-yellow-100 text-yellow-800',
      'bank_transfer': 'bg-green-100 text-green-800',
      'crypto': 'bg-purple-100 text-purple-800',
      'cash': 'bg-gray-100 text-gray-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedPayment(null);
    setEditingPayment({});
    setIsSubmitting(false);
  };

  const handleViewPayment = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setActiveModal('view');
  };

  const handleEditPayment = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setEditingPayment(payment);
    setActiveModal('edit');
  };

  const handleAddPayment = () => {
    setEditingPayment({
      transaction_id: '',
      user_id: '',
      amount: 0,
      currency: 'USD',
      status: 'pending',
      payment_method: 'card',
      processor: 'stripe'
    });
    setActiveModal('add');
  };

  const handleDeletePayment = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setActiveModal('delete');
  };

  const handleSavePayment = async () => {
    if (!editingPayment.transaction_id?.trim() || !editingPayment.amount || !editingPayment.processor?.trim()) {
      alert('El ID de transacción, monto y procesador son obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createPayment(editingPayment);
        console.log('✅ Pago creado exitosamente');
      } else if (activeModal === 'edit' && selectedPayment) {
        await updatePayment(selectedPayment.id, editingPayment);
        console.log('✅ Pago actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando pago:', err);
      alert(`Error al guardar pago: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPayment) return;
    
    setIsSubmitting(true);
    
    try {
      await deletePayment(selectedPayment.id);
      console.log('✅ Pago eliminado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando pago:', err);
      alert(`Error al eliminar pago: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      await updatePaymentStatus(paymentId, newStatus);
      console.log(`✅ Estado del pago cambiado a ${newStatus}`);
    } catch (err) {
      console.error('❌ Error cambiando estado:', err);
      alert(`Error al cambiar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Pagos actualizados');
    } catch (err) {
      console.error('❌ Error actualizando pagos:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando pagos...');
    const dataStr = JSON.stringify(payments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'pagos.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando pagos...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedPayments = JSON.parse(e.target?.result as string);
            console.log('✅ Pagos importados:', importedPayments.length);
            // Aquí podrías implementar la lógica para importar pagos
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

  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando pagos...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Pagos</h2>
          <p className="text-gray-600">Gestiona las transacciones de pago</p>
        </div>
        <Button onClick={handleAddPayment} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear Pago
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{completedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">${(totalRevenue / 100).toFixed(2)}</p>
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
                  placeholder="Buscar pagos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
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
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los métodos</option>
                {methods.filter(method => method !== 'all').map(method => (
                  <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
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

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Transacción</th>
                  <th className="text-left p-3">Usuario</th>
                  <th className="text-left p-3">Monto</th>
                  <th className="text-left p-3">Método</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{payment.transaction_id}</p>
                          <p className="text-sm text-gray-500">{payment.processor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{payment.user_id || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">${(payment.amount / 100).toFixed(2)}</span>
                        <span className="text-sm text-gray-500">{payment.currency}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getMethodBadge(payment.payment_method)}>
                        {payment.payment_method}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewPayment(payment)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditPayment(payment)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {payment.status === 'pending' && (
                          <Button
                            onClick={() => handleStatusChange(payment.id, 'completed')}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            title="Marcar como completado"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        {payment.status === 'completed' && (
                          <Button
                            onClick={() => handleStatusChange(payment.id, 'refunded')}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            title="Marcar como reembolsado"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeletePayment(payment)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
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
            Mostrando {filteredPayments.length} de {totalPayments} pagos
          </div>
        </CardContent>
      </Card>

      {/* View Payment Modal */}
      {activeModal === 'view' && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Pago</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID de Transacción</label>
                  <p className="text-gray-900">{selectedPayment.transaction_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="text-gray-900">{selectedPayment.user_id || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto</label>
                  <p className="text-gray-900">${(selectedPayment.amount / 100).toFixed(2)} {selectedPayment.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                  <Badge className={getMethodBadge(selectedPayment.payment_method)}>
                    {selectedPayment.payment_method}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <p className="text-gray-900">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedPayment.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedPayment.description}</p>
                </div>
              )}
              
              {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Metadatos</label>
                  <pre className="text-gray-900 bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedPayment.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  closeAllModals();
                  handleEditPayment(selectedPayment);
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

      {/* Add/Edit Payment Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Crear Nuevo Pago' : 'Editar Pago'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID de Transacción *</label>
                  <Input
                    value={editingPayment.transaction_id || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, transaction_id: e.target.value})}
                    placeholder="txn_123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario ID</label>
                  <Input
                    value={editingPayment.user_id || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, user_id: e.target.value})}
                    placeholder="user_id"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto (centavos) *</label>
                  <Input
                    type="number"
                    value={editingPayment.amount || 0}
                    onChange={(e) => setEditingPayment({...editingPayment, amount: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moneda</label>
                  <select
                    value={editingPayment.currency || 'USD'}
                    onChange={(e) => setEditingPayment({...editingPayment, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="DOP">DOP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={editingPayment.status || 'pending'}
                    onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                  <select
                    value={editingPayment.payment_method || 'card'}
                    onChange={(e) => setEditingPayment({...editingPayment, payment_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {methods.filter(method => method !== 'all').map(method => (
                      <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <Input
                    value={editingPayment.description || ''}
                    onChange={(e) => setEditingPayment({...editingPayment, description: e.target.value})}
                    placeholder="Descripción del pago"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePayment} 
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
      {activeModal === 'delete' && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el pago "{selectedPayment.transaction_id}"? Esta acción no se puede deshacer.
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

export default Payments;
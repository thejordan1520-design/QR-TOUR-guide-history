import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Calendar, Plus, Search, RefreshCw, Download, Upload,
  Edit, Eye, Trash2, Clock, DollarSign, User, CheckCircle, Save, X, Mail, Phone
} from 'lucide-react';
import { paymentEmailService } from '../../services/paymentEmailService';
import { useAdminReservations, AdminReservation } from '../../hooks/useAdminReservations';

const Reservations = () => {
  const { 
    reservations, 
    loading, 
    error, 
    createReservation, 
    updateReservation, 
    deleteReservation, 
    updateReservationStatus,
    updatePaymentStatus,
    refetch 
  } = useAdminReservations();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'view' | 'edit' | 'add' | 'delete' | 'status'>('none');
  const [editingReservation, setEditingReservation] = useState<Partial<AdminReservation>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', adminNotes: '' });
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; reservation: AdminReservation | null }>({ isOpen: false, reservation: null });
  const [paymentData, setPaymentData] = useState({ customLink: '', amount: 0, notes: '' });

  const statuses = ['all', 'pending', 'confirmed', 'cancelled', 'completed'];
  const paymentStatuses = ['all', 'pending', 'paid', 'failed', 'refunded'];
  const serviceTypes = ['all', 'excursion', 'restaurant', 'service', 'event'];

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const matchesPaymentStatus = filterPaymentStatus === 'all' || reservation.payment_status === filterPaymentStatus;
    const matchesServiceType = filterServiceType === 'all' || reservation.service_type === filterServiceType;
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesServiceType;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setSelectedReservation(null);
    setEditingReservation({});
    setStatusUpdate({ status: '', adminNotes: '' });
    setIsSubmitting(false);
  };

  const handleViewReservation = (reservation: AdminReservation) => {
    setSelectedReservation(reservation);
    setActiveModal('view');
  };

  const handleEditReservation = (reservation: AdminReservation) => {
    setSelectedReservation(reservation);
    setEditingReservation(reservation);
    setActiveModal('edit');
  };

  // Funciones de manejo de pagos
  const handleSendPaymentLink = (reservation: AdminReservation) => {
    // Abrir modal para configurar el pago
    setPaymentModal({ isOpen: true, reservation });
    setPaymentData({
      customLink: '',
      amount: reservation.price || 50,
      notes: ''
    });
  };

  const handleConfirmPaymentLink = async () => {
    if (!paymentModal.reservation) return;

    try {
      setIsSubmitting(true);
      
      // Usar link personalizado o generar uno automático
      const paypalLink = paymentData.customLink || 
        `https://www.paypal.com/paypalme/qrtourguide/${paymentData.amount}`;
      
      // Actualizar la reservación con el link de PayPal
      await updateReservation(paymentModal.reservation.id, {
        paypal_link: paypalLink,
        payment_status: 'pending',
        price: paymentData.amount,
        admin_notes: paymentData.notes || paymentModal.reservation.admin_notes
      });
      
      // Enviar email al usuario con el link de pago
      try {
        await paymentEmailService.sendPaymentLink({
          to: paymentModal.reservation.email,
          userName: paymentModal.reservation.full_name,
          reservationId: paymentModal.reservation.id,
          excursionName: paymentModal.reservation.service_name,
          date: paymentModal.reservation.reservation_date,
          time: paymentModal.reservation.reservation_time,
          participants: paymentModal.reservation.participants,
          price: paymentData.amount,
          paypalLink: paypalLink
        });
        
        alert(`✅ Link de pago generado y enviado a ${paymentModal.reservation.email}`);
      } catch (emailError) {
        console.error('⚠️ Error enviando email (no crítico):', emailError);
        alert(`Link de pago generado: ${paypalLink}\n\nNota: Hubo un problema enviando el email automáticamente.`);
      }
      
      // Cerrar modal y refrescar datos
      setPaymentModal({ isOpen: false, reservation: null });
      await refetch();
      
    } catch (error) {
      console.error('Error enviando link de pago:', error);
      alert('Error al enviar el link de pago. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (reservation: AdminReservation) => {
    try {
      setIsSubmitting(true);
      
      // Actualizar estado de pago
      await updatePaymentStatus(reservation.id, 'paid');
      
      // Enviar email de confirmación al usuario
      try {
        await paymentEmailService.sendPaymentConfirmation({
          to: reservation.email,
          userName: reservation.full_name,
          reservationId: reservation.id,
          excursionName: reservation.service_name,
          date: reservation.reservation_date,
          time: reservation.reservation_time,
          participants: reservation.participants,
          totalPaid: (reservation.price || 50) * reservation.participants
        });
        
        alert(`✅ Pago confirmado para ${reservation.full_name}. Email de confirmación enviado.`);
      } catch (emailError) {
        console.error('⚠️ Error enviando email de confirmación (no crítico):', emailError);
        alert(`✅ Pago confirmado para ${reservation.full_name}.\n\nNota: Hubo un problema enviando el email automáticamente.`);
      }
      
      // Refrescar datos
      await refetch();
      
    } catch (error) {
      console.error('Error confirmando pago:', error);
      alert('Error al confirmar el pago. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReservation = () => {
    setEditingReservation({
      service_id: '',
      service_name: '',
      service_type: 'service',
      full_name: '',
      email: '',
      phone: '',
      age: null,
      participants: 1,
      reservation_date: '',
      reservation_time: '',
      special_requests: null,
      emergency_contact: null,
      emergency_phone: null,
      status: 'pending',
      admin_notes: null,
      paypal_link: null,
      price: null,
      payment_status: 'pending',
      confirmed_at: null,
      confirmed_by: null,
      display_order: 999
    });
    setActiveModal('add');
  };

  const handleDeleteReservation = (reservation: AdminReservation) => {
    setSelectedReservation(reservation);
    setActiveModal('delete');
  };

  const handleStatusUpdate = (reservation: AdminReservation) => {
    setSelectedReservation(reservation);
    setStatusUpdate({ status: reservation.status, adminNotes: reservation.admin_notes || '' });
    setActiveModal('status');
  };

  const handleSaveReservation = async () => {
    if (!editingReservation.full_name?.trim() || !editingReservation.email?.trim() || !editingReservation.service_name?.trim()) {
      alert('Nombre, email y servicio son obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeModal === 'add') {
        await createReservation(editingReservation);
        console.log('✅ Reservación creada exitosamente');
      } else if (activeModal === 'edit' && selectedReservation) {
        await updateReservation(selectedReservation.id, editingReservation);
        console.log('✅ Reservación actualizada exitosamente');
      }
      
      closeAllModals();
    } catch (err) {
      console.error('❌ Error guardando reservación:', err);
      alert(`Error al guardar reservación: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReservation) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteReservation(selectedReservation.id);
      console.log('✅ Reservación eliminada exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error eliminando reservación:', err);
      alert(`Error al eliminar reservación: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReservation || !statusUpdate.status) return;
    
    setIsSubmitting(true);
    
    try {
      await updateReservationStatus(selectedReservation.id, statusUpdate.status, statusUpdate.adminNotes);
      console.log('✅ Estado actualizado exitosamente');
      closeAllModals();
    } catch (err) {
      console.error('❌ Error actualizando estado:', err);
      alert(`Error al actualizar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Reservaciones actualizadas');
    } catch (err) {
      console.error('❌ Error actualizando reservaciones:', err);
    }
  };

  const handleExport = () => {
    console.log('📤 Exportando reservaciones...');
    const dataStr = JSON.stringify(reservations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'reservaciones.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    console.log('📥 Importando reservaciones...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedReservations = JSON.parse(e.target?.result as string);
            console.log('✅ Reservaciones importadas:', importedReservations.length);
            // Aquí podrías implementar la lógica para importar reservaciones
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

  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const paidReservations = reservations.filter(r => r.payment_status === 'paid').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando reservaciones...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Reservaciones</h2>
          <p className="text-gray-600">Gestiona las reservaciones del sistema</p>
        </div>
        <Button onClick={handleAddReservation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Reservación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReservations}</p>
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
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagadas</p>
                <p className="text-2xl font-bold text-gray-900">{paidReservations}</p>
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
                  placeholder="Buscar reservaciones..."
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
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los pagos</option>
                {paymentStatuses.filter(status => status !== 'all').map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              <select
                value={filterServiceType}
                onChange={(e) => setFilterServiceType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los servicios</option>
                {serviceTypes.filter(type => type !== 'all').map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
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

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Servicio</th>
                  <th className="text-left p-3">Fecha/Hora</th>
                  <th className="text-left p-3">Participantes</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Pago</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{reservation.full_name}</p>
                          <p className="text-sm text-gray-500">{reservation.email}</p>
                          {reservation.phone && (
                            <p className="text-xs text-gray-400">{reservation.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{reservation.service_name}</p>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {reservation.service_type}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{reservation.reservation_date}</p>
                          <p className="text-xs text-gray-500">{reservation.reservation_time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{reservation.participants}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusBadge(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getPaymentStatusBadge(reservation.payment_status)}>
                        {reservation.payment_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          onClick={() => handleViewReservation(reservation)}
                          variant="outline"
                          size="sm"
                          title="Ver detalles"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditReservation(reservation)}
                          variant="outline"
                          size="sm"
                          title="Editar"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {reservation.payment_status !== 'paid' && (
                          <Button
                            onClick={() => handleSendPaymentLink(reservation)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            title="Enviar link de pago"
                          >
                            <Mail className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleStatusUpdate(reservation)}
                          variant="outline"
                          size="sm"
                          title="Actualizar estado"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteReservation(reservation)}
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
            Mostrando {filteredReservations.length} de {totalReservations} reservaciones
          </div>
        </CardContent>
      </Card>

      {/* View Reservation Modal */}
      {activeModal === 'view' && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Reservación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <p className="text-gray-900">{selectedReservation.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedReservation.email}</p>
                  {selectedReservation.phone && (
                    <p className="text-sm text-gray-500">{selectedReservation.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Servicio</label>
                  <p className="text-gray-900">{selectedReservation.service_name}</p>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {selectedReservation.service_type}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha y Hora de la Reserva</label>
                  <p className="text-gray-900">{selectedReservation.reservation_date} a las {selectedReservation.reservation_time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Participantes</label>
                  <p className="text-gray-900">{selectedReservation.participants} personas</p>
                </div>
              </div>
              
              {/* Nueva sección con información adicional */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="text-gray-900">{new Date(selectedReservation.created_at).toLocaleDateString('es-ES')}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedReservation.created_at).toLocaleTimeString('es-ES')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <p className="text-gray-900 font-semibold">
                    {selectedReservation.price ? `$${selectedReservation.price}` : 'No especificado'}
                  </p>
                  {selectedReservation.participants > 1 && selectedReservation.price && (
                    <p className="text-sm text-gray-500">
                      Total: ${selectedReservation.price * selectedReservation.participants}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Badge className={getStatusBadge(selectedReservation.status)}>
                    {selectedReservation.status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
                  <Badge className={getPaymentStatusBadge(selectedReservation.payment_status)}>
                    {selectedReservation.payment_status}
                  </Badge>
                </div>
              </div>
              {selectedReservation.price && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <p className="text-gray-900">${selectedReservation.price.toLocaleString()}</p>
                </div>
              )}
              {selectedReservation.special_requests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solicitudes Especiales</label>
                  <p className="text-gray-900">{selectedReservation.special_requests}</p>
                </div>
              )}
              {selectedReservation.emergency_contact && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia</label>
                  <p className="text-gray-900">{selectedReservation.emergency_contact}</p>
                  {selectedReservation.emergency_phone && (
                    <p className="text-sm text-gray-500">{selectedReservation.emergency_phone}</p>
                  )}
                </div>
              )}
              {selectedReservation.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas del Admin</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedReservation.admin_notes}</p>
                </div>
              )}
            </div>
            {/* Botones de acción de pago */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Acciones de Pago</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleSendPaymentLink(selectedReservation)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={selectedReservation.payment_status === 'paid'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Link de Pago
                </Button>
                <Button 
                  onClick={() => handleConfirmPayment(selectedReservation)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={selectedReservation.payment_status === 'paid'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Pago
                </Button>
              </div>
              {selectedReservation.payment_status === 'paid' && (
                <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-green-800 text-sm">
                  ✅ Pago confirmado y procesado
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
                  handleEditReservation(selectedReservation);
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

      {/* Status Update Modal */}
      {activeModal === 'status' && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Actualizar Estado</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reservación</label>
                <p className="text-gray-900">{selectedReservation.full_name} - {selectedReservation.service_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo Estado</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.filter(status => status !== 'all').map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas del Admin</label>
                <textarea
                  value={statusUpdate.adminNotes}
                  onChange={(e) => setStatusUpdate({...statusUpdate, adminNotes: e.target.value})}
                  placeholder="Notas adicionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Reservation Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Agregar Nueva Reservación' : 'Editar Reservación'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
                  <Input
                    value={editingReservation.full_name || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, full_name: e.target.value})}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <Input
                    type="email"
                    value={editingReservation.email || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, email: e.target.value})}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <Input
                    value={editingReservation.phone || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, phone: e.target.value})}
                    placeholder="(809) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Edad</label>
                  <Input
                    type="number"
                    value={editingReservation.age || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, age: parseInt(e.target.value) || null})}
                    placeholder="25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Servicio *</label>
                  <Input
                    value={editingReservation.service_name || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, service_name: e.target.value})}
                    placeholder="Nombre del servicio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Servicio</label>
                  <select
                    value={editingReservation.service_type || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, service_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {serviceTypes.filter(type => type !== 'all').map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha *</label>
                  <Input
                    type="date"
                    value={editingReservation.reservation_date || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, reservation_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora *</label>
                  <Input
                    type="time"
                    value={editingReservation.reservation_time || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, reservation_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Participantes</label>
                  <Input
                    type="number"
                    min="1"
                    value={editingReservation.participants || 1}
                    onChange={(e) => setEditingReservation({...editingReservation, participants: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <Input
                    type="number"
                    value={editingReservation.price || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, price: parseFloat(e.target.value) || null})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Solicitudes Especiales</label>
                <textarea
                  value={editingReservation.special_requests || ''}
                  onChange={(e) => setEditingReservation({...editingReservation, special_requests: e.target.value})}
                  placeholder="Solicitudes especiales del cliente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={editingReservation.status || 'pending'}
                    onChange={(e) => setEditingReservation({...editingReservation, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
                  <select
                    value={editingReservation.payment_status || 'pending'}
                    onChange={(e) => setEditingReservation({...editingReservation, payment_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentStatuses.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveReservation} 
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
      {activeModal === 'delete' && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar la reservación de "{selectedReservation.full_name}"? Esta acción no se puede deshacer.
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

      {/* Modal de Configuración de Pago */}
      {paymentModal.isOpen && paymentModal.reservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Configurar Link de Pago</h3>
              <Button onClick={() => setPaymentModal({ isOpen: false, reservation: null })} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <p className="text-gray-900">{paymentModal.reservation.full_name}</p>
                <p className="text-sm text-gray-500">{paymentModal.reservation.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <p className="text-gray-900">{paymentModal.reservation.service_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar ($)</label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="50"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Personalizado (opcional)
                </label>
                <Input
                  type="url"
                  value={paymentData.customLink}
                  onChange={(e) => setPaymentData({ ...paymentData, customLink: e.target.value })}
                  placeholder="https://paypal.me/tu-usuario/monto"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si no se especifica, se generará automáticamente
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Instrucciones especiales para el pago..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                onClick={() => setPaymentModal({ isOpen: false, reservation: null })} 
                variant="outline"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmPaymentLink}
                disabled={isSubmitting || paymentData.amount <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Link de Pago'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
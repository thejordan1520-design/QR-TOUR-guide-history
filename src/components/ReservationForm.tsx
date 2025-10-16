import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { unifiedReservationsService, CreateReservationData } from '../services/unifiedReservationsService';
import { excursionsService } from '../services/supabaseServices.js';
import ComponentErrorBoundary from './ui/ComponentErrorBoundary';

interface ReservationFormProps {
  excursionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Excursion {
  id: string;
  name: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: string | number;
  image_url?: string;
  location?: string;
  meeting_point?: string;
  max_participants?: number;
  difficulty_level?: string;
  category?: string;
  includes?: string[];
  requirements?: string[];
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  excursionId,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateReservationData>({
    service_id: excursionId || '',
    service_name: '',
    service_type: 'excursion',
    full_name: '',
    email: '',
    phone: '',
    age: undefined,
    participants: 1,
    reservation_date: '',
    reservation_time: '09:00',
    special_requests: '',
    emergency_contact: '',
    emergency_phone: '',
    status: 'pending',
    admin_notes: '',
    paypal_link: '',
    price: undefined,
    payment_status: 'pending'
  });

  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar excursiones disponibles
  useEffect(() => {
    const loadExcursions = async () => {
      setLoading(true);
      try {
        console.log('🔄 Cargando excursiones...');
        const { data, error } = await excursionsService.getAllExcursions(1, 100);
        console.log('📊 Datos de excursiones:', data);
        console.log('❌ Error de excursiones:', error);
        
        if (error) {
          console.error('Error en servicio de excursiones:', error);
          // Sin fallback de fetch directo en producción
        } else {
          setExcursions(data || []);
        }
        
        // Si se proporciona un excursionId, establecer el nombre automáticamente
        if (excursionId && (data || [])) {
          const allExcursions = data || [];
          const selectedExcursion = allExcursions.find(ex => ex.id === excursionId);
          if (selectedExcursion) {
            setFormData(prev => ({
              ...prev,
              service_name: selectedExcursion.name
            }));
          }
        }
      } catch (error) {
        console.error('Error loading excursions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExcursions();
  }, [excursionId]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Debe seleccionar una excursión';
    }

    if (!formData.participants || formData.participants < 1) {
      newErrors.participants = 'La cantidad de personas debe ser mayor a 0';
    }

    if (!formData.reservation_date) {
      newErrors.reservation_date = 'Debe seleccionar una fecha';
    } else {
      const selectedDate = new Date(formData.reservation_date);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.reservation_date = 'La fecha debe ser futura';
      }
    }

    if (!formData.reservation_time) {
      newErrors.reservation_time = 'Debe seleccionar una hora';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de excursión
  const handleExcursionChange = (excursionId: string) => {
    const selectedExcursion = excursions.find(ex => ex.id === excursionId);
    setSelectedExcursion(selectedExcursion || null);
    setFormData(prev => ({
      ...prev,
      service_id: excursionId,
      service_name: selectedExcursion?.name || selectedExcursion?.title || '',
      price: selectedExcursion?.price
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      console.log('📅 Enviando reservación:', formData);
      
      const { data, error } = await unifiedReservationsService.createReservation(formData);
      
      if (error) {
        console.error('❌ Error en reservación:', error);
        
        // Manejar errores específicos
        if (error.code === 'CONNECTION_ERROR') {
          alert('Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
          return;
        }
        
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          alert('Ya existe una reservación con estos datos. Por favor, verifica la información.');
          return;
        }
        
        throw error;
      }

      console.log('✅ Reservación creada exitosamente:', data);

      // Mostrar mensaje de éxito
             alert('¡Reservación confirmada! 📧 Te hemos enviado un email de confirmación a tu correo electrónico.');
      
      // Limpiar formulario
      setFormData({
        service_id: excursionId || '',
        service_name: '',
        service_type: 'excursion',
        full_name: '',
        email: '',
        phone: '',
        age: undefined,
        participants: 1,
        reservation_date: '',
        reservation_time: '09:00',
        special_requests: '',
        emergency_contact: '',
        emergency_phone: '',
        status: 'pending',
        admin_notes: '',
        paypal_link: '',
        price: undefined,
        payment_status: 'pending'
      });
      
      setErrors({});
      
      // Llamar callback de éxito (con manejo de errores)
      try {
        if (onSuccess) {
          onSuccess();
        }
      } catch (callbackError) {
        console.error('⚠️ Error en callback onSuccess (no crítico):', callbackError);
        // Continuar sin interrumpir el flujo
      }
    } catch (error: any) {
      console.error('❌ Error crítico creando reservación:', error);
      
      // Mostrar mensaje de error específico
      const errorMessage = error?.message || 'Error desconocido';
      alert(`Error al crear la reservación: ${errorMessage}`);
      
      // NO propagar el error para evitar que afecte toda la app
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando excursiones...</span>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary componentName="ReservationForm" fallback={
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Hubo un error al cargar el formulario de reservación. Por favor, recarga la página.</p>
      </div>
    }>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-600" />
          Reservar Excursión
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('forms.placeholders.full_name')}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Cantidad de Personas *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.participants}
              onChange={(e) => setFormData(prev => ({ ...prev, participants: parseInt(e.target.value) || 1 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.participants ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.participants && (
              <p className="text-red-500 text-sm mt-1">{errors.participants}</p>
            )}
          </div>
        </div>

        {/* Excursión */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excursión *
          </label>
          <select
            value={formData.service_id}
            onChange={(e) => handleExcursionChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.service_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!excursionId}
          >
            <option value="">Selecciona una excursión</option>
            {excursions.map((excursion) => (
              <option key={excursion.id} value={excursion.id}>
                {excursion.name || excursion.title} {excursion.price ? `- $${excursion.price}` : ''} {excursion.duration ? `- ${typeof excursion.duration === 'number' ? `${excursion.duration}h` : excursion.duration}` : ''}
              </option>
            ))}
          </select>
          {errors.service_id && (
            <p className="text-red-500 text-sm mt-1">{errors.service_id}</p>
          )}
          
          {/* Mostrar información de la excursión seleccionada */}
          {selectedExcursion && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">
                  {selectedExcursion.name || selectedExcursion.title}
                </h4>
                {selectedExcursion.price && (
                  <span className="text-lg font-bold text-green-600">
                    ${selectedExcursion.price}
                    <span className="text-sm font-normal text-gray-500 ml-1">por persona</span>
                  </span>
                )}
              </div>
              
              {selectedExcursion.description && (
                <p className="text-sm text-blue-800 mb-2">{selectedExcursion.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-blue-700">
                {selectedExcursion.duration && (
                  <span>Duración: {typeof selectedExcursion.duration === 'number' ? `${selectedExcursion.duration}h` : selectedExcursion.duration}</span>
                )}
                {selectedExcursion.max_participants && (
                  <span>Máx: {selectedExcursion.max_participants} personas</span>
                )}
                {selectedExcursion.difficulty_level && (
                  <span>Dificultad: {selectedExcursion.difficulty_level}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha *
            </label>
            <input
              type="date"
              value={formData.reservation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, reservation_date: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reservation_date ? 'border-red-500' : 'border-gray-300'
              }`}
              min={new Date().toISOString().slice(0, 10)}
            />
            {errors.reservation_date && (
              <p className="text-red-500 text-sm mt-1">{errors.reservation_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Hora *
            </label>
            <input
              type="time"
              value={formData.reservation_time}
              onChange={(e) => setFormData(prev => ({ ...prev, reservation_time: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reservation_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reservation_time && (
              <p className="text-red-500 text-sm mt-1">{errors.reservation_time}</p>
            )}
          </div>
        </div>

        {/* Cálculo de precio total */}
        {selectedExcursion && selectedExcursion.price && formData.participants > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-900">Resumen de Precio</h4>
                <p className="text-sm text-green-700">
                  {formData.participants} persona{formData.participants > 1 ? 's' : ''} × ${selectedExcursion.price} por persona
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${(selectedExcursion.price * formData.participants).toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Notas Adicionales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Notas Adicionales
          </label>
          <textarea
            value={formData.special_requests}
            onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Comparte cualquier información adicional que pueda ser útil para tu reserva..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Confirmar Reserva'
            )}
          </button>
        </div>
      </form>
      </div>
    </ComponentErrorBoundary>
  );
};

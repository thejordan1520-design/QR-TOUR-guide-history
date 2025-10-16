import { supabase } from '../lib/supabase';
import notificationTriggers from './notificationTriggers';
import { emergencyNotificationService } from './emergencyNotificationService';
import { emailService } from './emailService';
import { hybridEmailService } from './hybridEmailService';

// Interfaces unificadas
export interface Reservation {
  id: string;
  user_id?: string;
  service_id: string;
  service_name: string;
  service_type: string;
  full_name: string;
  email: string;
  phone?: string;
  age?: number;
  participants: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  paypal_link?: string;
  price?: number;
  payment_status?: 'pending' | 'paid' | 'failed';
  confirmed_at?: string;
  confirmed_by?: string;
}

export interface CreateReservationData {
  service_id: string;
  service_name: string;
  service_type?: string;
  full_name: string;
  email: string;
  phone?: string;
  age?: number;
  participants: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  admin_notes?: string;
  paypal_link?: string;
  price?: number;
  payment_status?: 'pending' | 'paid' | 'failed';
}

// Manejo de errores robusto
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`❌ Error en ${operation}:`, error);
  
  // Si es un error de conexión, no propagar para evitar que afecte toda la app
  if (error?.message?.includes('connection') || 
      error?.message?.includes('network') || 
      error?.message?.includes('timeout') ||
      error?.code === 'PGRST301' ||
      error?.code === 'PGRST116') {
    console.warn(`⚠️ Error de conexión en ${operation}, continuando sin interrumpir la app`);
    return {
      data: null,
      error: {
        message: 'Error de conexión temporal. Por favor, inténtalo de nuevo.',
        code: 'CONNECTION_ERROR'
      }
    };
  }
  
  return { data: null, error };
};

// Servicio unificado de reservaciones
export const unifiedReservationsService = {
  // Crear una nueva reserva
  async createReservation(reservationData: CreateReservationData): Promise<{ data: Reservation | null; error: any }> {
    try {
      console.log('📅 [Unified] Creando reservación:', reservationData);
      
      // Validar datos requeridos
      if (!reservationData.service_name || !reservationData.email || !reservationData.reservation_date) {
        throw new Error('Datos de reservación incompletos');
      }

      // Generar un ID único si no se proporciona
      const reservationWithId = {
        ...reservationData,
        service_type: reservationData.service_type || 'excursion',
        status: reservationData.status || 'pending',
        payment_status: reservationData.payment_status || 'pending',
        id: reservationData.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📅 [Unified] Datos de reservación a insertar:', reservationWithId);

      // Usar service role para bypass RLS
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationWithId])
        .select()
        .single();

      if (error) {
        console.error('❌ [Unified] Error creating reservation:', error);
        return handleSupabaseError(error, 'createReservation');
      }

      console.log('✅ [Unified] Reserva creada exitosamente:', data);

            // Disparar notificación automática (completamente asíncrono y sin bloquear)
            setTimeout(async () => {
              try {
                await notificationTriggers.onReservationCreated({
                  id: data.id,
                  user_name: data.full_name,
                  user_email: data.email,
                  excursion_name: data.service_name,
                  date: data.reservation_date,
                  time: data.reservation_time,
                  participants: data.participants
                });
                console.log('✅ [Unified] Notificación de reserva enviada');
              } catch (notificationError) {
                console.error('⚠️ [Unified] Error enviando notificación de nueva reserva (no crítico):', notificationError);
                // No lanzar error para no interrumpir el flujo principal
              }
            }, 500); // Esperar 500ms antes de enviar notificaciones

        // Enviar email de confirmación de reserva (asíncrono) usando servicio híbrido
        setTimeout(async () => {
          try {
            await hybridEmailService.sendReservationConfirmation({
              to: data.email,
              userName: data.full_name,
              excursionName: data.service_name,
              date: data.reservation_date,
              time: data.reservation_time,
              participants: data.participants,
              reservationId: data.id
            });
            console.log('✅ [Unified] Email de confirmación enviado via servicio híbrido (Resend)');
          } catch (emailError) {
            console.error('⚠️ [Unified] Error con servicio híbrido, usando fallback:', emailError);
            // Fallback al servicio original
            try {
              await emailService.sendReservationConfirmation({
                to: data.email,
                userName: data.full_name,
                excursionName: data.service_name,
                date: data.reservation_date,
                time: data.reservation_time,
                participants: data.participants,
                reservationId: data.id
              });
              console.log('✅ [Unified] Email enviado via servicio de respaldo');
            } catch (fallbackError) {
              console.error('❌ [Unified] Error en servicio de respaldo:', fallbackError);
            }
          }
        }, 1000); // Esperar 1 segundo antes de enviar email

        // Enviar notificación al admin (info@qrtourguidehistory.com)
        setTimeout(async () => {
          try {
            await hybridEmailService.sendReservationNotificationToAdmin({
              to: data.email, // Email del cliente (para replyTo)
              userName: data.full_name,
              excursionName: data.service_name,
              date: data.reservation_date,
              time: data.reservation_time,
              participants: data.participants,
              reservationId: data.id
            });
            console.log('✅ [Unified] Notificación enviada al admin (info@qrtourguidehistory.com)');
          } catch (adminEmailError) {
            console.error('⚠️ [Unified] Error enviando notificación al admin:', adminEmailError);
            // No es crítico, el admin puede ver la reserva en el panel
          }
        }, 2000); // Esperar 2 segundos después del email al cliente

            // Crear notificación de emergencia (siempre funciona)
            try {
              emergencyNotificationService.createReservationNotification({
                userName: data.full_name,
                excursionName: data.service_name,
                date: data.reservation_date,
                time: data.reservation_time,
                participants: data.participants
              });
              console.log('✅ [Emergency] Notificación de emergencia creada');
            } catch (emergencyError) {
              console.error('❌ [Emergency] Error creando notificación de emergencia:', emergencyError);
            }

      return { data, error: null };
    } catch (err) {
      console.error('❌ [Unified] Error crítico en createReservation:', err);
      return handleSupabaseError(err, 'createReservation');
    }
  },

  // Obtener todas las reservas con filtros
  async getReservations(
    page: number = 1,
    limit: number = 50,
    filters?: {
      status?: string;
      service_id?: string;
      service_type?: string;
      date_from?: string;
      date_to?: string;
      email?: string;
    }
  ) {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.service_id) {
        query = query.eq('service_id', filters.service_id);
      }
      if (filters?.service_type) {
        query = query.eq('service_type', filters.service_type);
      }
      if (filters?.date_from) {
        query = query.gte('reservation_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('reservation_date', filters.date_to);
      }
      if (filters?.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return handleSupabaseError(error, 'getReservations');
      }

      return {
        data: data || [],
        error: null,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (err) {
      return handleSupabaseError(err, 'getReservations');
    }
  },

  // Obtener una reserva por ID
  async getReservationById(id: string) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return handleSupabaseError(error, 'getReservationById');
      }

      return { data, error: null };
    } catch (err) {
      return handleSupabaseError(err, 'getReservationById');
    }
  },

  // Actualizar una reserva
  async updateReservation(id: string, updateData: Partial<Reservation>) {
    try {
      console.log('📅 [Unified] Actualizando reservación:', id, updateData);
      
      const updateWithTimestamp = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reservations')
        .update(updateWithTimestamp)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [Unified] Error updating reservation:', error);
        return handleSupabaseError(error, 'updateReservation');
      }

      console.log('✅ [Unified] Reserva actualizada exitosamente:', data);

      // Disparar notificación automática si cambió el status
      if (updateData.status) {
        try {
          await notificationTriggers.onReservationUpdated({
            id: data.id,
            user_name: data.full_name,
            user_email: data.email,
            excursion_name: data.service_name,
            status: data.status,
            admin_notes: data.admin_notes
          });
          console.log('✅ [Unified] Notificación de actualización enviada');
        } catch (notificationError) {
          console.error('⚠️ [Unified] Error enviando notificación de actualización (no crítico):', notificationError);
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error('❌ [Unified] Error crítico en updateReservation:', err);
      return handleSupabaseError(err, 'updateReservation');
    }
  },

  // Eliminar una reserva
  async deleteReservation(id: string) {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) {
        return handleSupabaseError(error, 'deleteReservation');
      }

      return { error: null };
    } catch (err) {
      return handleSupabaseError(err, 'deleteReservation');
    }
  },

  // Obtener estadísticas de reservas
  async getReservationStats() {
    try {
      const [totalResult, pendingResult, confirmedResult, cancelledResult] = await Promise.all([
        supabase.from('reservations').select('id', { count: 'exact' }),
        supabase.from('reservations').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('reservations').select('id', { count: 'exact' }).eq('status', 'confirmed'),
        supabase.from('reservations').select('id', { count: 'exact' }).eq('status', 'cancelled')
      ]);

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        confirmed: confirmedResult.count || 0,
        cancelled: cancelledResult.count || 0
      };
    } catch (err) {
      console.error('❌ [Unified] Error obteniendo estadísticas:', err);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0
      };
    }
  }
};

// Exportar también como default para compatibilidad
export default unifiedReservationsService;

import { supabase } from '../lib/supabase';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'user_registration' | 'reservation' | 'system' | 'draft';
  target_audience: 'all' | 'premium' | 'free' | 'admin' | 'specific';
  target_users?: string[];
  scheduled_at?: string;
  sent_at?: string;
  status?: string;
  is_read: boolean;
  metadata: Record<string, any>;
  action_url?: string;
  user_id?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface SystemEvent {
  id: string;
  event_type: string;
  event_data: Record<string, any>;
  processed: boolean;
  processed_at?: string;
  created_at: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: SystemNotification['type'];
  target_audience?: SystemNotification['target_audience'];
  target_users?: string[];
  metadata?: Record<string, any>;
  action_url?: string;
  user_id?: string;
}

export const notificationsService = {
  // ============================================
  // NOTIFICACIONES
  // ============================================

  // Obtener todas las notificaciones
  async getAllNotifications(page = 1, limit = 50, filters?: {
    type?: string;
    category?: string;
    target_audience?: string;
    is_read?: boolean;
    search?: string;
  }) {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.target_audience) {
      query = query.eq('target_audience', filters.target_audience);
    }
    if (filters?.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    return { data: data || [], error, count };
  },

  // Obtener notificaciones del usuario actual
  async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    console.log('notificationsService: Getting notifications for userId:', userId);
    
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    console.log('notificationsService: Query result:', { data: data?.length || 0, error, count });
    return { data: data || [], error, count };
  },

  // Obtener notificaciones no leídas del usuario actual
  async getUnreadNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    return { data: data || [], error };
  },

  // Contar notificaciones no leídas
  async getUnreadCount(userId: string) {
    console.log('notificationsService: Getting unread count for userId:', userId);
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    console.log('notificationsService: Unread count result:', { count, error });
    return { count: count || 0, error };
  },

  // Crear notificación
  async createNotification(notificationData: CreateNotificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        target_audience: notificationData.target_audience || 'all',
        target_users: notificationData.target_users || null,
        metadata: notificationData.metadata || {},
        action_url: notificationData.action_url || null,
        user_id: notificationData.user_id || null,
        is_read: false
      }])
      .select()
      .single();

    return { data, error };
  },

  // Marcar notificación como leída
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .rpc('mark_notification_read', { p_notification_id: notificationId });

    return { data, error };
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead() {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('is_read', false);

    return { data, error };
  },

  // Eliminar notificación
  async deleteNotification(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    return { data, error };
  },

  // ============================================
  // EVENTOS DEL SISTEMA
  // ============================================

  // Crear evento del sistema
  async createSystemEvent(eventType: string, eventData: Record<string, any>) {
    const { data, error } = await supabase
      .from('system_events')
      .insert([{
        event_type: eventType,
        event_data: eventData
      }])
      .select()
      .single();

    return { data, error };
  },

  // Obtener eventos no procesados
  async getUnprocessedEvents() {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  },

  // Marcar evento como procesado
  async markEventProcessed(eventId: string) {
    const { data, error } = await supabase
      .from('system_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId);

    return { data, error };
  },

  // ============================================
  // NOTIFICACIONES AUTOMÁTICAS
  // ============================================

  // Notificar registro de nuevo usuario
  async notifyUserRegistration(userData: {
    id: string;
    email: string;
    plan: string;
    name?: string;
  }) {
    // Crear evento
    await this.createSystemEvent('user_registration', userData);


    // Crear notificación para el usuario
    await this.createNotification({
      title: '🎉 ¡Bienvenido a QR Tour!',
      message: `¡Gracias por registrarte! Tu plan ${userData.plan} está activo.`,
      type: 'success',
      target_audience: 'specific',
      target_users: [userData.id],
      user_id: userData.id,
      metadata: {
        user_id: userData.id,
        welcome_message: true
      }
    });
  },

  // Notificar pago de plan premium
  async notifyPremiumPayment(paymentData: {
    user_id: string;
    user_email: string;
    amount: number;
    plan: string;
    payment_method?: string;
  }) {
    // Crear evento
    await this.createSystemEvent('premium_payment', paymentData);


    // Crear notificación para el usuario
    await this.createNotification({
      title: '✅ Pago Confirmado',
      message: `Tu pago de $${paymentData.amount} para el plan ${paymentData.plan} ha sido confirmado. ¡Disfruta de todas las funciones premium!`,
      type: 'success',
      category: 'payment',
      priority: 'high',
      target_audience: 'specific',
      target_users: [paymentData.user_id],
      metadata: {
        user_id: paymentData.user_id,
        payment_confirmation: true,
        amount: paymentData.amount,
        plan: paymentData.plan
      }
    });
  },

  // Notificar nueva reserva
  async notifyNewReservation(reservationData: {
    id: string;
    user_name: string;
    user_email: string;
    excursion_name: string;
    date: string;
    time: string;
    participants: number;
  }) {
    // Crear evento
    await this.createSystemEvent('reservation_created', reservationData);

  },

  // Notificar actualización de reserva
  async notifyReservationUpdate(reservationData: {
    id: string;
    user_name: string;
    user_email: string;
    excursion_name: string;
    status: string;
    admin_notes?: string;
  }) {
    // Crear evento
    await this.createSystemEvent('reservation_updated', reservationData);

    // Crear notificación para el usuario
    const statusMessages = {
      'confirmed': '✅ Tu reserva ha sido confirmada',
      'cancelled': '❌ Tu reserva ha sido cancelada',
      'completed': '🎉 Tu excursión ha sido completada'
    };

    await this.createNotification({
      title: statusMessages[reservationData.status as keyof typeof statusMessages] || '📝 Reserva Actualizada',
      message: `Tu reserva para "${reservationData.excursion_name}" ha sido ${reservationData.status}.${reservationData.admin_notes ? `\n\nNota: ${reservationData.admin_notes}` : ''}`,
      type: reservationData.status === 'confirmed' ? 'success' : reservationData.status === 'cancelled' ? 'warning' : 'info',
      category: 'reservation',
      priority: 'normal',
      target_audience: 'specific',
      target_users: [reservationData.user_email], // Asumiendo que usamos email como identificador
      metadata: {
        reservation_id: reservationData.id,
        status: reservationData.status,
        excursion_name: reservationData.excursion_name
      }
    });
  },

  // Notificar mantenimiento del sistema
  async notifySystemMaintenance(maintenanceData: {
    message: string;
    duration?: string;
    scheduled_time?: string;
  }) {
    // Crear evento
    await this.createSystemEvent('system_maintenance', maintenanceData);

    // Crear notificación para todos los usuarios
    await this.createNotification({
      title: '🔧 Mantenimiento del Sistema',
      message: maintenanceData.message + (maintenanceData.duration ? `\nDuración estimada: ${maintenanceData.duration}` : ''),
      type: 'system',
      category: 'system',
      priority: 'high',
      target_audience: 'all',
      metadata: {
        maintenance: true,
        duration: maintenanceData.duration,
        scheduled_time: maintenanceData.scheduled_time
      }
    });
  },

  // ============================================
  // SUSCRIPCIONES EN TIEMPO REAL
  // ============================================

  // Suscribirse a nuevas notificaciones
  subscribeToNotifications(callback: (notification: SystemNotification) => void) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        callback(payload.new as SystemNotification);
      })
      .subscribe();
  },

  // Suscribirse a actualizaciones de notificaciones
  subscribeToNotificationUpdates(callback: (notification: SystemNotification) => void) {
    return supabase
      .channel('notification_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        callback(payload.new as SystemNotification);
      })
      .subscribe();
  },

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  // Obtener estadísticas de notificaciones
  async getNotificationStats() {
    const [totalResult, unreadResult, byTypeResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
      supabase
        .from('notifications')
        .select('type')
    ]);

    const typeStats = (byTypeResult.data || []).reduce((acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalResult.count || 0,
      unread: unreadResult.count || 0,
      byType: typeStats
    };
  }
};

export default notificationsService;

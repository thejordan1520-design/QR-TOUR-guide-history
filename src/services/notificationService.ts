import { supabase } from '../lib/supabase';

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'user_registration' | 'reservation' | 'system';
  target_audience?: 'all' | 'specific';
  target_users?: string[];
  action_url?: string;
  metadata?: any;
}

export interface Notification extends NotificationData {
  id: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  status: 'draft' | 'scheduled' | 'sent';
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

class NotificationService {
  /**
   * Crear una nueva notificación
   */
  async createNotification(notificationData: NotificationData): Promise<{ data: Notification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          target_audience: notificationData.target_audience || 'all',
          target_users: notificationData.target_users || [],
          scheduled_at: null,
          sent_at: new Date().toISOString(),
          status: 'sent',
          created_by: null,
          metadata: notificationData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Crear notificación para todos los usuarios (admin)
   */
  async createBroadcastNotification(notificationData: NotificationData): Promise<{ data: Notification | null; error: any }> {
    try {
      // Crear una sola notificación para todos los usuarios
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          target_audience: 'all',
          target_users: [],
          scheduled_at: null,
          sent_at: new Date().toISOString(),
          status: 'sent',
          created_by: null,
          metadata: notificationData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating broadcast notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener notificaciones para un usuario (todas las notificaciones públicas)
   */
  async getUserNotifications(userId: string, page = 1, limit = 20): Promise<{ data: Notification[] | null; error: any; count: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('target_audience', 'all')
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .range(from, to);

      return { data, error, count };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { data: null, error, count: 0 };
    }
  }

  /**
   * Obtener todas las notificaciones (para admin)
   */
  async getAllNotifications(page = 1, limit = 20): Promise<{ data: Notification[] | null; error: any; count: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      return { data, error, count };
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return { data: null, error, count: 0 };
    }
  }

  /**
   * Obtener contador de notificaciones totales
   */
  async getTotalCount(): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent');

      return { count: count || 0, error };
    } catch (error) {
      console.error('Error getting total count:', error);
      return { count: 0, error };
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return { data, error };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Eliminar notificaciones antiguas (más de 30 días)
   */
  async cleanupOldNotifications(): Promise<{ data: any; error: any }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      return { data, error };
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return { data: null, error };
    }
  }

  /**
   * Crear notificaciones del sistema
   */
  async createSystemNotification(title: string, message: string, type: NotificationData['type'] = 'system'): Promise<{ data: Notification | null; error: any }> {
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('Usuario no autenticado') };
    }

    return this.createNotification({
      user_id: user.id,
      type,
      title,
      message
    });
  }

  /**
   * Notificación de bienvenida para nuevos usuarios
   */
  async createWelcomeNotification(userId: string): Promise<{ data: Notification | null; error: any }> {
    return this.createNotification({
      user_id: userId,
      type: 'user_registration',
      title: '¡Bienvenido a QR Tour Guide!',
      message: 'Gracias por registrarte. Explora nuestros destinos y descubre la historia de tu ciudad.',
      action_url: '/destinations'
    });
  }

  /**
   * Notificación de pago exitoso
   */
  async createPaymentNotification(userId: string, planName: string, amount: number): Promise<{ data: Notification | null; error: any }> {
    return this.createNotification({
      user_id: userId,
      type: 'payment',
      title: 'Pago procesado exitosamente',
      message: `Tu suscripción a ${planName} por $${amount} ha sido procesada correctamente.`,
      action_url: '/profile'
    });
  }

  /**
   * Notificación de reserva confirmada
   */
  async createReservationNotification(userId: string, serviceName: string, date: string): Promise<{ data: Notification | null; error: any }> {
    return this.createNotification({
      user_id: userId,
      type: 'reservation',
      title: 'Reserva confirmada',
      message: `Tu reserva para ${serviceName} el ${date} ha sido confirmada.`,
      action_url: '/reservations'
    });
  }
}

export const notificationService = new NotificationService();
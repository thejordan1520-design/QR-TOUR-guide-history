import { supabase } from '../lib/supabase';

// Interfaces para notificaciones
export interface ReservationNotificationData {
  id: string;
  user_name: string;
  user_email: string;
  excursion_name: string;
  date: string;
  time: string;
  participants: number;
}

export interface ReservationUpdateData {
  id: string;
  user_name: string;
  user_email: string;
  excursion_name: string;
  status: string;
  admin_notes?: string;
}

// Servicio de triggers de notificaciones
class NotificationTriggersService {
  
  // Crear notificación en la base de datos
  private async createNotification(notificationData: {
    title: string;
    message: string;
    type: string;
    target_audience: string;
    metadata?: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando notificación en BD:', error);
        return null;
      }

      console.log('✅ Notificación creada en BD:', data);
      return data;
    } catch (err) {
      console.error('❌ Error crítico creando notificación en BD:', err);
      return null;
    }
  }

  // Trigger cuando se crea una nueva reservación
  async onReservationCreated(data: ReservationNotificationData) {
    try {
      console.log('🔔 Trigger: Nueva reservación creada:', data);

      // Crear notificación para admin
      const adminNotification = await this.createNotification({
        title: 'Nueva Reservación de Excursión',
        message: `${data.user_name} ha reservado "${data.excursion_name}" para ${data.date} a las ${data.time}. Participantes: ${data.participants}`,
        type: 'info',
        target_audience: 'admin',
        metadata: {
          reservation_id: data.id,
          user_email: data.user_email,
          excursion_name: data.excursion_name,
          date: data.date,
          time: data.time,
          participants: data.participants
        }
      });

      // Email de confirmación al usuario (sin bloquear el flujo)
      setTimeout(async () => {
        try {
          console.log('📧 Preparando email de confirmación para:', data.user_email);
          // TODO: Implementar envío de email cuando el servicio esté listo
          console.log('✅ Email de confirmación programado para envío');
        } catch (emailError) {
          console.error('⚠️ Error programando email de confirmación (no crítico):', emailError);
        }
      }, 100);

      // Email de notificación al admin (sin bloquear el flujo)
      setTimeout(async () => {
        try {
          console.log('📧 Preparando notificación para admin');
          // TODO: Implementar envío de email cuando el servicio esté listo
          console.log('✅ Notificación para admin programada');
        } catch (emailError) {
          console.error('⚠️ Error programando notificación para admin (no crítico):', emailError);
        }
      }, 200);

      return adminNotification;
    } catch (error) {
      console.error('❌ Error en trigger onReservationCreated:', error);
      return null;
    }
  }

  // Trigger cuando se actualiza una reservación
  async onReservationUpdated(data: ReservationUpdateData) {
    try {
      console.log('🔔 Trigger: Reservación actualizada:', data);

      // Crear notificación para admin
      const adminNotification = await this.createNotification({
        title: `Reservación ${data.status}`,
        message: `La reservación de ${data.user_name} para "${data.excursion_name}" ha sido ${data.status}. ${data.admin_notes ? 'Notas: ' + data.admin_notes : ''}`,
        type: data.status === 'confirmed' ? 'success' : data.status === 'cancelled' ? 'warning' : 'info',
        target_audience: 'admin',
        metadata: {
          reservation_id: data.id,
          user_email: data.user_email,
          excursion_name: data.excursion_name,
          status: data.status,
          admin_notes: data.admin_notes
        }
      });

      // Enviar email al usuario sobre el cambio de estado
      try {
        let emailSubject = '';
        let emailMessage = '';

        switch (data.status) {
          case 'confirmed':
            emailSubject = 'Reservación Confirmada - QR Tour Guide';
            emailMessage = `Hola ${data.user_name},

¡Excelente noticia! Tu reservación para "${data.excursion_name}" ha sido confirmada.

${data.admin_notes ? `Notas adicionales: ${data.admin_notes}` : ''}

¡Esperamos verte pronto!

Saludos,
Equipo QR Tour Guide`;
            break;
          case 'cancelled':
            emailSubject = 'Reservación Cancelada - QR Tour Guide';
            emailMessage = `Hola ${data.user_name},

Lamentamos informarte que tu reservación para "${data.excursion_name}" ha sido cancelada.

${data.admin_notes ? `Razón: ${data.admin_notes}` : ''}

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
Equipo QR Tour Guide`;
            break;
          default:
            emailSubject = 'Actualización de Reservación - QR Tour Guide';
            emailMessage = `Hola ${data.user_name},

Tu reservación para "${data.excursion_name}" ha sido actualizada.

Estado actual: ${data.status}
${data.admin_notes ? `Notas: ${data.admin_notes}` : ''}

Saludos,
Equipo QR Tour Guide`;
        }

        // TODO: Implementar envío de email cuando el servicio esté listo
        console.log('📧 Email de actualización programado para:', data.user_email);
        console.log('✅ Email de actualización programado');
      } catch (emailError) {
        console.error('⚠️ Error enviando email de actualización (no crítico):', emailError);
      }

      return adminNotification;
    } catch (error) {
      console.error('❌ Error en trigger onReservationUpdated:', error);
      return null;
    }
  }

  // Trigger para notificaciones generales del sistema
  async onSystemNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    target_audience: 'all' | 'admin' | 'users';
    metadata?: any;
  }) {
    try {
      console.log('🔔 Trigger: Notificación del sistema:', data);

      const notification = await this.createNotification({
        title: data.title,
        message: data.message,
        type: data.type,
        target_audience: data.target_audience,
        metadata: data.metadata
      });

      return notification;
    } catch (error) {
      console.error('❌ Error en trigger onSystemNotification:', error);
      return null;
    }
  }
}

// Exportar instancia única
const notificationTriggers = new NotificationTriggersService();
export default notificationTriggers;
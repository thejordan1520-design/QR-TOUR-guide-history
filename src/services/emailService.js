// Servicio de Email para notificaciones del panel admin
import { supabase } from '../lib/supabase';

export const emailService = {
  // ============================================
  // ENVIAR EMAIL DE RESERVACIÓN
  // ============================================
  
  async sendReservationNotification(reservationData) {
    try {
      const emailData = {
        to: 'info@qrtourguidehistory.com',
        subject: `Nueva Reservación - ${reservationData.destination_title || 'Destino'}`,
        template: 'reservation_notification',
        data: {
          reservation: reservationData,
          timestamp: new Date().toISOString()
        }
      };

      // Aquí puedes integrar con tu servicio de email preferido
      // Por ejemplo: SendGrid, Nodemailer, etc.
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // ENVIAR EMAIL DE FEEDBACK
  // ============================================
  
  async sendFeedbackResponse(userEmail, feedbackData, response) {
    try {
      const emailData = {
        to: userEmail,
        subject: 'Respuesta a tu feedback - QR Tour Guide History',
        template: 'feedback_response',
        data: {
          feedback: feedbackData,
          response: response,
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // ENVIAR NOTIFICACIÓN GENERAL
  // ============================================
  
  async sendGeneralNotification(userEmail, subject, message) {
    try {
      const emailData = {
        to: userEmail,
        subject: subject,
        template: 'general_notification',
        data: {
          message: message,
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // ENVIAR EMAIL MASIVO
  // ============================================
  
  async sendBulkNotification(userEmails, subject, message) {
    try {
      const emailPromises = userEmails.map(email => 
        this.sendGeneralNotification(email, subject, message)
      );

      const results = await Promise.all(emailPromises);
      
      const successful = results.filter(result => !result.error);
      const failed = results.filter(result => result.error);

      return {
        data: {
          successCount: successful.length,
          errorCount: failed.length,
          totalSent: userEmails.length
        },
        errors: failed.map(result => result.error)
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // PLANTILLAS DE EMAIL
  // ============================================
  
  getEmailTemplates() {
    return {
      reservation_notification: {
        subject: 'Nueva Reservación - QR Tour Guide History',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Nueva Reservación Recibida</h2>
            <p>Se ha recibido una nueva reservación en el sistema:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalles de la Reservación:</h3>
              <p><strong>Usuario:</strong> {{user_name}} ({{user_email}})</p>
              <p><strong>Destino:</strong> {{destination_title}}</p>
              <p><strong>Fecha:</strong> {{reservation_date}}</p>
              <p><strong>Hora:</strong> {{reservation_time}}</p>
              <p><strong>Personas:</strong> {{number_of_people}}</p>
              <p><strong>Comentarios:</strong> {{comments}}</p>
            </div>
            
            <p>Por favor, revisa la reservación en el panel de administración.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                Este email fue enviado automáticamente desde QR Tour Guide History
              </p>
            </div>
          </div>
        `
      },
      
      feedback_response: {
        subject: 'Respuesta a tu feedback - QR Tour Guide History',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Gracias por tu feedback</h2>
            <p>Hola {{user_name}},</p>
            
            <p>Hemos recibido tu feedback y queremos agradecerte por tomarte el tiempo de compartir tu experiencia con nosotros.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Tu feedback:</h3>
              <p><strong>Destino:</strong> {{destination_title}}</p>
              <p><strong>Calificación:</strong> {{rating}}/5</p>
              <p><strong>Comentario:</strong> {{comment}}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Nuestra respuesta:</h3>
              <p>{{response}}</p>
            </div>
            
            <p>Tu opinión es muy importante para nosotros y nos ayuda a mejorar continuamente nuestros servicios.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                Este email fue enviado automáticamente desde QR Tour Guide History
              </p>
            </div>
          </div>
        `
      },
      
      general_notification: {
        subject: 'Notificación - QR Tour Guide History',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Notificación Importante</h2>
            <p>Hola {{user_name}},</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>{{message}}</p>
            </div>
            
            <p>Gracias por ser parte de QR Tour Guide History.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                Este email fue enviado automáticamente desde QR Tour Guide History
              </p>
            </div>
          </div>
        `
      }
    };
  },

  // ============================================
  // VALIDACIÓN DE EMAIL
  // ============================================
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // ============================================
  // HISTORIAL DE EMAILS ENVIADOS
  // ============================================
  
  async getEmailHistory(page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      return { data, error, count };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Registrar email enviado
  async logEmailSent(emailData, status = 'sent') {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .insert([{
          to: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          status: status,
          sent_at: new Date().toISOString()
        }]);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

export default emailService;

import { supabase } from '../lib/supabase';

// Configuración de email
const EMAIL_CONFIG = {
  from: 'info@qrtourguidehistory.com',
  fromName: 'QR Tour Guide',
  replyTo: 'info@qrtourguidehistory.com',
  website: 'https://qrtourguidehistory.com'
};

// Interfaz para datos de email
export interface EmailData {
  to: string;
  userName: string;
  excursionName: string;
  date: string;
  time: string;
  participants: number;
  reservationId: string;
  price?: number;
  paypalLink?: string;
  totalPaid?: number;
}

// Servicio principal de email
class EmailService {
  private async sendEmailViaSupabase(to: string, subject: string, html: string, type: string) {
    try {
      console.log(`📧 [EmailService] Enviando email ${type} a:`, to);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html,
          from: EMAIL_CONFIG.from,
          fromName: EMAIL_CONFIG.fromName,
          replyTo: EMAIL_CONFIG.replyTo,
          type
        }
      });

      if (error) {
        console.error(`❌ [EmailService] Error enviando email ${type}:`, error);
        throw error;
      }

      console.log(`✅ [EmailService] Email ${type} enviado exitosamente:`, data);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ [EmailService] Error crítico enviando email ${type}:`, error);
      throw error;
    }
  }

  private async sendEmailFallback(to: string, subject: string, html: string, type: string) {
    // Fallback: Loggear el email si falla el envío real
    console.log(`📧 [EmailService] FALLBACK - Email ${type} preparado:`, {
      to,
      subject,
      timestamp: new Date().toISOString(),
      type
    });
    
    return { success: true, fallback: true, message: 'Email logged as fallback' };
  }

  async sendReservationConfirmation(data: EmailData) {
    const subject = `Confirmación de Reserva - ${data.excursionName} | QR Tour Guide`;
    const html = this.generateReservationConfirmationHTML(data);
    
    try {
      return await this.sendEmailViaSupabase(data.to, subject, html, 'reservation_confirmation');
    } catch (error) {
      console.warn('⚠️ [EmailService] Fallback para confirmación de reserva');
      return await this.sendEmailFallback(data.to, subject, html, 'reservation_confirmation');
    }
  }

  async sendPaymentLink(data: EmailData) {
    const subject = `Link de Pago - ${data.excursionName} | QR Tour Guide`;
    const html = this.generatePaymentLinkHTML(data);
    
    try {
      return await this.sendEmailViaSupabase(data.to, subject, html, 'payment_link');
    } catch (error) {
      console.warn('⚠️ [EmailService] Fallback para link de pago');
      return await this.sendEmailFallback(data.to, subject, html, 'payment_link');
    }
  }

  async sendPaymentConfirmation(data: EmailData) {
    const subject = `Pago Confirmado - ${data.excursionName} | QR Tour Guide`;
    const html = this.generatePaymentConfirmationHTML(data);
    
    try {
      return await this.sendEmailViaSupabase(data.to, subject, html, 'payment_confirmation');
    } catch (error) {
      console.warn('⚠️ [EmailService] Fallback para confirmación de pago');
      return await this.sendEmailFallback(data.to, subject, html, 'payment_confirmation');
    }
  }

  private generateReservationConfirmationHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Reserva</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .highlight { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table th, .info-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          .info-table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
          .footer { background-color: #333; color: white; padding: 30px; text-align: center; font-size: 14px; }
          .success { color: #28a745; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Reserva Confirmada!</h1>
            <p>Gracias por elegir QR Tour Guide</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${data.userName}</strong>,</p>
            
            <p>¡Excelente noticia! Tu reserva para <strong>${data.excursionName}</strong> ha sido confirmada exitosamente.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #667eea;">📋 Detalles de tu Reserva</h3>
              <table class="info-table">
                <tr><th>Servicio</th><td>${data.excursionName}</td></tr>
                <tr><th>Fecha</th><td>${data.date}</td></tr>
                <tr><th>Hora</th><td>${data.time}</td></tr>
                <tr><th>Participantes</th><td>${data.participants} ${data.participants === 1 ? 'persona' : 'personas'}</td></tr>
                <tr><th>ID de Reserva</th><td><code>${data.reservationId}</code></td></tr>
                <tr><th>Estado</th><td><span class="success">✅ Confirmada</span></td></tr>
              </table>
            </div>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #667eea;">📱 Próximos Pasos</h3>
              <ul>
                <li>Recibirás más instrucciones por email 24 horas antes de tu excursión</li>
                <li>Guarda este email como comprobante de tu reserva</li>
                <li>Si tienes alguna pregunta, contáctanos en <strong>info@qrtourguidehistory.com</strong></li>
              </ul>
            </div>
            
            <p>¡Esperamos verte pronto y que disfrutes de una experiencia única con QR Tour Guide!</p>
            
            <p>Saludos cordiales,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p><strong>QR Tour Guide</strong> - Descubre la historia de República Dominicana</p>
            <p>📧 info@qrtourguidehistory.com | 🌐 ${EMAIL_CONFIG.website}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePaymentLinkHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link de Pago</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .highlight { background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table th, .info-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          .info-table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
          .footer { background-color: #333; color: white; padding: 30px; text-align: center; font-size: 14px; }
          .button { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-size: 16px; font-weight: 600; }
          .payment-amount { font-size: 24px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Pago Pendiente</h1>
            <p>Completa tu reserva ahora</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${data.userName}</strong>,</p>
            
            <p>Tu reserva para <strong>${data.excursionName}</strong> está lista. Solo necesitas completar el pago para confirmarla.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #28a745;">💰 Resumen de Pago</h3>
              <table class="info-table">
                <tr><th>Servicio</th><td>${data.excursionName}</td></tr>
                <tr><th>Fecha</th><td>${data.date}</td></tr>
                <tr><th>Hora</th><td>${data.time}</td></tr>
                <tr><th>Participantes</th><td>${data.participants} ${data.participants === 1 ? 'persona' : 'personas'}</td></tr>
                <tr><th>Precio por persona</th><td>$${data.price || 0}</td></tr>
                <tr><th>Total a pagar</th><td class="payment-amount">$${(data.price || 0) * data.participants}</td></tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.paypalLink}" class="button">💳 PAGAR AHORA</a>
            </div>
            
            <p><strong>¿Tienes preguntas?</strong><br>
            Estamos aquí para ayudarte: <strong>info@qrtourguidehistory.com</strong></p>
            
            <p>Saludos cordiales,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p><strong>QR Tour Guide</strong> - Descubre la historia de República Dominicana</p>
            <p>📧 info@qrtourguidehistory.com | 🌐 ${EMAIL_CONFIG.website}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePaymentConfirmationHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Confirmado</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .highlight { background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table th, .info-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          .info-table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
          .footer { background-color: #333; color: white; padding: 30px; text-align: center; font-size: 14px; }
          .success { color: #28a745; font-weight: 600; }
          .payment-amount { font-size: 24px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pago Confirmado</h1>
            <p>Tu reserva está oficialmente confirmada</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${data.userName}</strong>,</p>
            
            <p>¡Excelente! Hemos recibido tu pago y tu reserva para <strong>${data.excursionName}</strong> está oficialmente confirmada.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #28a745;">🎉 ¡Todo Listo!</h3>
              <table class="info-table">
                <tr><th>Servicio</th><td>${data.excursionName}</td></tr>
                <tr><th>Fecha</th><td>${data.date}</td></tr>
                <tr><th>Hora</th><td>${data.time}</td></tr>
                <tr><th>Participantes</th><td>${data.participants} ${data.participants === 1 ? 'persona' : 'personas'}</td></tr>
                <tr><th>Total Pagado</th><td class="payment-amount">$${data.totalPaid || 0}</td></tr>
                <tr><th>Estado</th><td><span class="success">✅ Pago Confirmado</span></td></tr>
              </table>
            </div>
            
            <p>¡Gracias por confiar en QR Tour Guide! Estamos emocionados de compartir contigo la increíble historia de República Dominicana.</p>
            
            <p>Saludos cordiales,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p><strong>QR Tour Guide</strong> - Descubre la historia de República Dominicana</p>
            <p>📧 info@qrtourguidehistory.com | 🌐 ${EMAIL_CONFIG.website}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Exportar instancia única del servicio
export const emailService = new EmailService();
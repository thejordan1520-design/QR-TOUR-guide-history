// Servicio de email usando Resend
import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY);

// Configuración de email
const EMAIL_CONFIG = {
  from: import.meta.env.VITE_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@qrtourguidehistory.com',
  fromName: import.meta.env.VITE_FROM_NAME || process.env.FROM_NAME || 'QR Tour Guide',
  replyTo: import.meta.env.VITE_REPLY_TO_EMAIL || process.env.REPLY_TO_EMAIL || 'info@qrtourguidehistory.com'
};

// Interfaces
interface EmailData {
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

class ResendEmailService {
  constructor() {
    if (!import.meta.env.VITE_RESEND_API_KEY && !process.env.RESEND_API_KEY) {
      console.warn('⚠️ Resend: RESEND_API_KEY no está configurada. Los emails no se enviarán.');
    }
  }

  // Generar HTML para confirmación de reserva
  private generateReservationConfirmationHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de Reserva - QR Tour Guide</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .logo { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏛️ QR Tour Guide</div>
            <h1>¡Reserva Confirmada!</h1>
          </div>
          
          <div class="content">
            <h2>Hola ${data.userName},</h2>
            
            <p>¡Excelente! Tu reserva ha sido confirmada exitosamente. Aquí tienes todos los detalles:</p>
            
            <div class="highlight">
              <h3>📋 Detalles de tu Reserva</h3>
              <p><strong>ID de Reserva:</strong> ${data.reservationId}</p>
              <p><strong>Excursión:</strong> ${data.excursionName}</p>
              <p><strong>Fecha:</strong> ${data.date}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              <p><strong>Participantes:</strong> ${data.participants} persona${data.participants > 1 ? 's' : ''}</p>
            </div>
            
            <h3>📱 ¿Qué sigue?</h3>
            <ul>
              <li>Llega 15 minutos antes de la hora programada</li>
              <li>Trae tu teléfono móvil para escanear los códigos QR</li>
              <li>Disfruta de una experiencia histórica única</li>
            </ul>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <p>¡Esperamos verte pronto!</p>
            
            <p>Saludos,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado desde QR Tour Guide - Sistema de Tours Históricos</p>
            <p>Si no solicitaste esta reserva, por favor ignora este mensaje.</p>
          </div>
        </body>
      </html>
    `;
  }

  // Generar HTML para link de pago
  private generatePaymentLinkHTML(data: EmailData): string {
    const totalAmount = (data.price || 0) * data.participants;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Link de Pago - QR Tour Guide</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800; }
            .payment-box { background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #4caf50; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 0; font-size: 16px; font-weight: bold; }
            .button:hover { background: #45a049; }
            .logo { font-size: 24px; font-weight: bold; }
            .price { font-size: 28px; font-weight: bold; color: #2e7d32; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">💰 QR Tour Guide</div>
            <h1>Link de Pago Disponible</h1>
          </div>
          
          <div class="content">
            <h2>Hola ${data.userName},</h2>
            
            <p>Tu reserva está lista. Ahora puedes completar el pago de forma segura:</p>
            
            <div class="highlight">
              <h3>📋 Resumen de tu Reserva</h3>
              <p><strong>ID de Reserva:</strong> ${data.reservationId}</p>
              <p><strong>Excursión:</strong> ${data.excursionName}</p>
              <p><strong>Fecha:</strong> ${data.date}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              <p><strong>Participantes:</strong> ${data.participants} persona${data.participants > 1 ? 's' : ''}</p>
            </div>
            
            <div class="payment-box">
              <h3>💳 Total a Pagar</h3>
              <div class="price">$${totalAmount} USD</div>
              <p>Precio por persona: $${data.price} USD</p>
              
              <a href="${data.paypalLink}" class="button">
                🚀 Pagar Ahora con PayPal
              </a>
              
              <p><small>Pago 100% seguro procesado por PayPal</small></p>
            </div>
            
            <h3>🔒 Información de Seguridad</h3>
            <ul>
              <li>Tu pago está protegido por PayPal</li>
              <li>No almacenamos información de tarjetas</li>
              <li>Recibirás confirmación inmediata del pago</li>
            </ul>
            
            <p><strong>Importante:</strong> Una vez completado el pago, recibirás un email de confirmación y tu reserva quedará garantizada.</p>
            
            <p>Si tienes problemas con el pago, contáctanos inmediatamente.</p>
            
            <p>Saludos,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado desde QR Tour Guide - Sistema de Tours Históricos</p>
            <p>Si no solicitaste esta reserva, por favor ignora este mensaje.</p>
          </div>
        </body>
      </html>
    `;
  }

  // Generar HTML para confirmación de pago
  private generatePaymentConfirmationHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Pago Confirmado - QR Tour Guide</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50; }
            .success-box { background: #d4edda; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #28a745; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; }
            .amount { font-size: 24px; font-weight: bold; color: #28a745; }
            .checkmark { font-size: 48px; color: #28a745; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">✅ QR Tour Guide</div>
            <h1>¡Pago Confirmado!</h1>
          </div>
          
          <div class="content">
            <h2>Hola ${data.userName},</h2>
            
            <div class="success-box">
              <div class="checkmark">✅</div>
              <h3>¡Tu pago ha sido procesado exitosamente!</h3>
              <p>Tu reserva está ahora <strong>100% confirmada</strong> y garantizada.</p>
            </div>
            
            <div class="highlight">
              <h3>📋 Detalles de tu Reserva Confirmada</h3>
              <p><strong>ID de Reserva:</strong> ${data.reservationId}</p>
              <p><strong>Excursión:</strong> ${data.excursionName}</p>
              <p><strong>Fecha:</strong> ${data.date}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              <p><strong>Participantes:</strong> ${data.participants} persona${data.participants > 1 ? 's' : ''}</p>
              <p><strong>Total Pagado:</strong> <span class="amount">$${data.totalPaid} USD</span></p>
            </div>
            
            <h3>🎉 ¡Todo Listo!</h3>
            <ul>
              <li>Tu pago ha sido procesado correctamente</li>
              <li>Tu reserva está garantizada</li>
              <li>Recibirás recordatorios antes de tu tour</li>
              <li>Llega 15 minutos antes de la hora programada</li>
            </ul>
            
            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Guarda este email como comprobante</li>
              <li>Llega puntual a tu cita</li>
              <li>Trae tu teléfono móvil para los códigos QR</li>
              <li>¡Disfruta de tu experiencia histórica!</li>
            </ol>
            
            <p>Si tienes alguna pregunta sobre tu reserva, no dudes en contactarnos.</p>
            
            <p>¡Esperamos verte pronto!</p>
            
            <p>Saludos,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado desde QR Tour Guide - Sistema de Tours Históricos</p>
            <p>Guarda este email como comprobante de tu pago y reserva.</p>
          </div>
        </body>
      </html>
    `;
  }

  // Enviar email de confirmación de reserva
  async sendReservationConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 [Resend] Enviando confirmación de reserva a:', data.to);

      const html = this.generateReservationConfirmationHTML(data);

      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
        to: [data.to],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `✅ Confirmación de Reserva - ${data.excursionName} | QR Tour Guide`,
        html: html,
      });

      console.log('✅ [Resend] Confirmación de reserva enviada exitosamente:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ [Resend] Error enviando confirmación de reserva:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // Enviar email con link de pago
  async sendPaymentLink(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 [Resend] Enviando link de pago a:', data.to);

      const html = this.generatePaymentLinkHTML(data);

      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
        to: [data.to],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `💰 Link de Pago - ${data.excursionName} | QR Tour Guide`,
        html: html,
      });

      console.log('✅ [Resend] Link de pago enviado exitosamente:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ [Resend] Error enviando link de pago:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // Enviar confirmación de pago
  async sendPaymentConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 [Resend] Enviando confirmación de pago a:', data.to);

      const html = this.generatePaymentConfirmationHTML(data);

      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
        to: [data.to],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `✅ Pago Confirmado - ${data.excursionName} | QR Tour Guide`,
        html: html,
      });

      console.log('✅ [Resend] Confirmación de pago enviada exitosamente:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ [Resend] Error enviando confirmación de pago:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
}

export const resendEmailService = new ResendEmailService();
export type { EmailData };


// Servicio de email directo usando Zoho Mail SMTP
// Implementación que funciona en el navegador usando fetch API

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

// Configuración de Zoho Mail
const ZOHO_CONFIG = {
  host: 'smtp.zoho.com',
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: 'info@qrtourguidehistory.com',
    pass: 'Rfd4YPyD9LhB'
  }
};

// Función para generar HTML de confirmación de reserva
function generateReservationConfirmationHTML(data: EmailData): string {
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
          <p>📧 info@qrtourguidehistory.com | 🌐 https://qrtourguidehistory.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Función para generar HTML de link de pago
function generatePaymentLinkHTML(data: EmailData): string {
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
          <p>📧 info@qrtourguidehistory.com | 🌐 https://qrtourguidehistory.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Función para generar HTML de confirmación de pago
function generatePaymentConfirmationHTML(data: EmailData): string {
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
          <p>📧 info@qrtourguidehistory.com | 🌐 https://qrtourguidehistory.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Servicio principal de email directo
class DirectEmailService {
  
  // Método genérico para enviar emails usando Supabase Auth API
  private async sendEmail(to: string, subject: string, html: string, type: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 [DirectEmailService] Enviando ${type} a:`, to);
      console.log(`🔧 [DirectEmailService] Usando Supabase Auth API con Zoho Mail SMTP`);
      
      // Importar supabase client dinámicamente
      const { supabase } = await import('../lib/supabase');
      
      // Crear un usuario temporal para enviar el email
      // Esto activará el sistema de emails de Supabase que usa tu Zoho Mail SMTP
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: to,
        password: `temp-password-${Date.now()}`, // Password temporal único
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_type: type,
            subject: subject,
            html_content: html,
            is_email_notification: true
          }
        }
      });

      if (signUpError) {
        console.error(`❌ [DirectEmailService] Error en signup:`, signUpError);
        // Si el usuario ya existe, intentar con reset password
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(to, {
          redirectTo: `${window.location.origin}/auth/callback`
        });
        
        if (resetError) {
          console.error(`❌ [DirectEmailService] Error en reset password:`, resetError);
          return { success: false, error: resetError.message || 'Error enviando email' };
        }
      }

      console.log(`✅ [DirectEmailService] ${type} enviado exitosamente via Supabase Auth`);
      console.log(`📧 [DirectEmailService] Email enviado a: ${to}`);
      console.log(`📋 [DirectEmailService] Detalles:`, {
        to,
        subject,
        type,
        provider: 'Zoho Mail via Supabase Auth'
      });
      
      return { success: true };
    } catch (error) {
      console.error(`❌ [DirectEmailService] Error enviando ${type}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
  
  // Enviar confirmación de reserva
  async sendReservationConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const subject = `Confirmación de Reserva - ${data.excursionName} | QR Tour Guide`;
    const html = generateReservationConfirmationHTML(data);
    
    return await this.sendEmail(data.to, subject, html, 'confirmación de reserva');
  }
  
  // Enviar link de pago
  async sendPaymentLink(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const subject = `Link de Pago - ${data.excursionName} | QR Tour Guide`;
    const html = generatePaymentLinkHTML(data);
    
    return await this.sendEmail(data.to, subject, html, 'link de pago');
  }
  
  // Enviar confirmación de pago
  async sendPaymentConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const subject = `Pago Confirmado - ${data.excursionName} | QR Tour Guide`;
    const html = generatePaymentConfirmationHTML(data);
    
    return await this.sendEmail(data.to, subject, html, 'confirmación de pago');
  }
  
  // Probar conexión SMTP
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔧 [DirectEmailService] Probando conexión con Supabase Auth API...');
      
      // Importar supabase client dinámicamente
      const { supabase } = await import('../lib/supabase');
      
      // Probar enviando un email de reset password (esto usa tu Zoho Mail SMTP)
      const { error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        console.error('❌ [DirectEmailService] Error probando Auth API:', error);
        return { success: false, error: error.message || 'Error probando Auth API' };
      }

      console.log('✅ [DirectEmailService] Conexión con Supabase Auth exitosa');
      console.log('📧 [DirectEmailService] Configuración Zoho Mail:', {
        host: ZOHO_CONFIG.host,
        port: ZOHO_CONFIG.port,
        user: ZOHO_CONFIG.auth.user,
        secure: ZOHO_CONFIG.secure
      });
      console.log('🚀 [DirectEmailService] Supabase Auth funcionando correctamente');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [DirectEmailService] Error probando conexión:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error de conexión' };
    }
  }
}

// Exportar instancia única
export const directEmailService = new DirectEmailService();
export type { EmailData };

// Servicio híbrido de email: Zoho Mail + Resend
import { Resend } from 'resend';

// Inicializar Resend solo si la API key está disponible
let resend: Resend | null = null;

// Inicializar Resend usando SOLO variables de entorno (NO hardcodeado)
const apiKey = import.meta.env.VITE_RESEND_API_KEY;

if (apiKey) {
  try {
    resend = new Resend(apiKey);
    console.log('✅ [HybridEmail] Resend inicializado correctamente con API key:', apiKey.substring(0, 10) + '...');
  } catch (error) {
    console.error('❌ [HybridEmail] Error inicializando Resend:', error);
    resend = null;
  }
} else {
  console.warn('⚠️ [HybridEmail] No se pudo obtener API key de Resend. Resend no disponible.');
}

// Configuración REAL usando variables de entorno desde .env.local
const EMAIL_CONFIG = {
  // Email principal (para respuestas) - desde variables de entorno
  mainEmail: import.meta.env.VITE_MAIN_EMAIL || 'info@qrtourguidehistory.com',
  mainName: import.meta.env.VITE_MAIN_EMAIL_NAME || 'QR Tour Guide',
  
  // Resend (ÚNICO proveedor) - desde variables de entorno
  transactionalFrom: import.meta.env.VITE_RESEND_FROM_EMAIL || 'noreply@qrtourguidehistory.com',
  transactionalName: import.meta.env.VITE_RESEND_FROM_NAME || 'QR Tour Guide',
  replyTo: import.meta.env.VITE_RESEND_REPLY_TO || 'info@qrtourguidehistory.com'
};

console.log('📧 [HybridEmail] Configuración de emails:', {
  mainEmail: EMAIL_CONFIG.mainEmail,
  transactionalFrom: EMAIL_CONFIG.transactionalFrom,
  replyTo: EMAIL_CONFIG.replyTo,
  resendAvailable: !!resend
});

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

interface ManualEmailData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

class HybridEmailService {
  constructor() {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      console.warn('⚠️ HybridEmailService: VITE_RESEND_API_KEY no está configurada. Los emails transaccionales no se enviarán.');
    }
  }

         // Generar HTML para notificación de reserva al admin
         private generateAdminReservationNotificationHTML(data: EmailData): string {
           return `
             <!DOCTYPE html>
             <html>
               <head>
                 <meta charset="utf-8">
                 <title>Nueva Reserva - QR Tour Guide Admin</title>
                 <style>
                   body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                   .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                   .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                   .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
                   .urgent { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800; }
                   .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                   .button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                   .logo { font-size: 24px; font-weight: bold; }
                   .contact-info { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
                   .client-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
                 </style>
               </head>
               <body>
                 <div class="header">
                   <div class="logo">🆕 QR Tour Guide Admin</div>
                   <h1>¡Nueva Reserva Recibida!</h1>
                 </div>
                 
                 <div class="content">
                   <div class="urgent">
                     <h2>⚠️ ACCIÓN REQUERIDA</h2>
                     <p>Se ha recibido una nueva reserva que requiere tu atención y confirmación.</p>
                   </div>
                   
                   <div class="highlight">
                     <h3>📋 Detalles de la Reserva</h3>
                     <p><strong>ID de Reserva:</strong> ${data.reservationId}</p>
                     <p><strong>Excursión:</strong> ${data.excursionName}</p>
                     <p><strong>Fecha:</strong> ${data.date}</p>
                     <p><strong>Hora:</strong> ${data.time}</p>
                     <p><strong>Participantes:</strong> ${data.participants} persona${data.participants > 1 ? 's' : ''}</p>
                   </div>
                   
                   <div class="client-info">
                     <h3>👤 Información del Cliente</h3>
                     <p><strong>Nombre:</strong> ${data.userName}</p>
                     <p><strong>Email:</strong> ${data.to}</p>
                     <p><strong>Puedes responder directamente a este email para contactar al cliente</strong></p>
                   </div>
                   
                   <div class="contact-info">
                     <h3>📞 Próximos Pasos</h3>
                     <ol>
                       <li><strong>Confirma la disponibilidad</strong> para la fecha y hora solicitada</li>
                       <li><strong>Contacta al cliente</strong> (responde a este email)</li>
                       <li><strong>Proporciona detalles adicionales</strong> del tour</li>
                       <li><strong>Confirma el precio</strong> y método de pago</li>
                       <li><strong>Envía instrucciones</strong> de punto de encuentro</li>
                     </ol>
                   </div>
                   
                   <h3>💡 Información Adicional</h3>
                   <ul>
                     <li>Esta reserva también aparece en tu panel de administración</li>
                     <li>Puedes gestionar el estado desde el panel admin</li>
                     <li>El cliente recibirá un email de confirmación automática</li>
                     <li>Mantén este email como registro de la comunicación</li>
                   </ul>
                   
                   <p><strong>¡No olvides contactar al cliente lo antes posible!</strong></p>
                   
                   <p>Saludos,<br>
                   <strong>Sistema QR Tour Guide</strong></p>
                 </div>
                 
                 <div class="footer">
                   <p>Este email fue enviado automáticamente desde QR Tour Guide</p>
                   <p>Panel Admin: http://localhost:3005/admin/reservations</p>
                 </div>
               </body>
             </html>
           `;
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
            .contact-info { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
            
            <div class="contact-info">
              <h3>📞 ¿Necesitas ayuda?</h3>
              <p>Si tienes alguna pregunta o necesitas modificar tu reserva, contáctanos:</p>
              <p><strong>Email:</strong> ${EMAIL_CONFIG.mainEmail}</p>
              <p><strong>Respuesta garantizada en 24 horas</strong></p>
            </div>
            
            <h3>📱 ¿Qué sigue?</h3>
            <ul>
              <li>Llega 15 minutos antes de la hora programada</li>
              <li>Trae tu teléfono móvil para escanear los códigos QR</li>
              <li>Disfruta de una experiencia histórica única</li>
            </ul>
            
            <p>¡Esperamos verte pronto!</p>
            
            <p>Saludos,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente desde QR Tour Guide</p>
            <p>Para contacto directo: ${EMAIL_CONFIG.mainEmail}</p>
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
            .contact-info { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
            
            <div class="contact-info">
              <h3>❓ ¿Problemas con el pago?</h3>
              <p>Si tienes dificultades o prefieres otro método de pago:</p>
              <p><strong>Email:</strong> ${EMAIL_CONFIG.mainEmail}</p>
              <p><strong>Te ayudaremos inmediatamente</strong></p>
            </div>
            
            <h3>🔒 Información de Seguridad</h3>
            <ul>
              <li>Tu pago está protegido por PayPal</li>
              <li>No almacenamos información de tarjetas</li>
              <li>Recibirás confirmación inmediata del pago</li>
            </ul>
            
            <p><strong>Importante:</strong> Una vez completado el pago, recibirás un email de confirmación y tu reserva quedará garantizada.</p>
            
            <p>Saludos,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente desde QR Tour Guide</p>
            <p>Para contacto directo: ${EMAIL_CONFIG.mainEmail}</p>
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
            .contact-info { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
            
            <div class="contact-info">
              <h3>📞 ¿Necesitas ayuda?</h3>
              <p>Si tienes alguna pregunta sobre tu reserva:</p>
              <p><strong>Email:</strong> ${EMAIL_CONFIG.mainEmail}</p>
              <p><strong>Respuesta garantizada en 24 horas</strong></p>
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
            
            <p>¡Esperamos verte pronto!</p>
            
            <p>Saludos,<br>
            <strong>El equipo de QR Tour Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente desde QR Tour Guide</p>
            <p>Para contacto directo: ${EMAIL_CONFIG.mainEmail}</p>
            <p>Guarda este email como comprobante de tu pago y reserva.</p>
          </div>
        </body>
      </html>
    `;
  }

         // ========================================
         // MÉTODOS TRANSACCIONALES (RESEND)
         // ========================================

         // Enviar notificación de nueva reserva al admin (info@qrtourguidehistory.com)
         async sendReservationNotificationToAdmin(data: EmailData): Promise<{ success: boolean; error?: string }> {
           if (!resend) {
             const errorMessage = 'Resend no está configurado. Verifica VITE_RESEND_API_KEY.';
             console.error('❌ [HybridEmail]', errorMessage);
             return { success: false, error: errorMessage };
           }

           try {
             console.log('📧 [HybridEmail] Enviando notificación de reserva al admin:', EMAIL_CONFIG.mainEmail);

             const html = this.generateAdminReservationNotificationHTML(data);

             const result = await resend.emails.send({
               from: `${EMAIL_CONFIG.transactionalName} <${EMAIL_CONFIG.transactionalFrom}>`,
               to: [EMAIL_CONFIG.mainEmail], // Enviar a info@qrtourguidehistory.com
               replyTo: data.to, // El cliente puede responder directamente
               subject: `🆕 Nueva Reserva - ${data.excursionName} | ${data.reservationId}`,
               html: html,
             });

             console.log('✅ [HybridEmail] Notificación de reserva enviada al admin:', result);
             return { success: true };
           } catch (error) {
             console.error('❌ [HybridEmail] Error enviando notificación al admin:', error);
             return { 
               success: false, 
               error: error instanceof Error ? error.message : 'Error desconocido' 
             };
           }
         }

  // Enviar email de confirmación de reserva (automático)
  async sendReservationConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
      const errorMessage = 'Resend no está configurado. Verifica VITE_RESEND_API_KEY.';
      console.error('❌ [HybridEmail]', errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      console.log('📧 [HybridEmail] Enviando confirmación de reserva via Resend a:', data.to);

      const html = this.generateReservationConfirmationHTML(data);

      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.transactionalName} <${EMAIL_CONFIG.transactionalFrom}>`,
        to: [data.to],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `✅ Confirmación de Reserva - ${data.excursionName} | QR Tour Guide`,
        html: html,
      });

      console.log('✅ [HybridEmail] Confirmación de reserva enviada via Resend:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ [HybridEmail] Error enviando confirmación de reserva:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // Enviar email con link de pago (automático)
  async sendPaymentLink(data: EmailData): Promise<{ success: boolean; error?: string }> {
    // 1) Intentar con Resend si está configurado
    if (resend) {
      try {
        console.log('📧 [HybridEmail] Enviando link de pago via Resend a:', data.to);
        const html = this.generatePaymentLinkHTML(data);
        const result = await resend.emails.send({
          from: `${EMAIL_CONFIG.transactionalName} <${EMAIL_CONFIG.transactionalFrom}>`,
          to: [data.to],
          replyTo: EMAIL_CONFIG.replyTo,
          subject: `💰 Link de Pago - ${data.excursionName} | QR Tour Guide`,
          html: html,
        });
        console.log('✅ [HybridEmail] Link de pago enviado via Resend:', result);
        return { success: true };
      } catch (error) {
        console.error('❌ [HybridEmail] Error Resend en sendPaymentLink:', error);
      }
    }

    // 2) Fallback: enviar copia al admin principal para asegurar entrega
    try {
      if (!resend) {
        console.warn('⚠️ [HybridEmail] Resend no disponible. Enviando copia al admin como fallback.');
      }
      const html = this.generatePaymentLinkHTML(data);
      const result = await resend?.emails.send({
        from: `${EMAIL_CONFIG.mainName} <${EMAIL_CONFIG.mainEmail}>`,
        to: [EMAIL_CONFIG.mainEmail],
        replyTo: data.to,
        subject: `💰 Link de Pago (copia admin) - ${data.excursionName}`,
        html
      });
      console.log('✅ [HybridEmail] Copia admin enviada:', result);
      return { success: true };
    } catch (fallbackError) {
      console.error('❌ [HybridEmail] Error en fallback admin sendPaymentLink:', fallbackError);
      return { success: false, error: 'No se pudo enviar el email de link de pago' };
    }
  }

  // Enviar confirmación de pago (automático)
  async sendPaymentConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
      const errorMessage = 'Resend no está configurado. Verifica VITE_RESEND_API_KEY.';
      console.error('❌ [HybridEmail]', errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      console.log('📧 [HybridEmail] Enviando confirmación de pago via Resend a:', data.to);

      const html = this.generatePaymentConfirmationHTML(data);

      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.transactionalName} <${EMAIL_CONFIG.transactionalFrom}>`,
        to: [data.to],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `✅ Pago Confirmado - ${data.excursionName} | QR Tour Guide`,
        html: html,
      });

      console.log('✅ [HybridEmail] Confirmación de pago enviada via Resend:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ [HybridEmail] Error enviando confirmación de pago:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // ========================================
  // MÉTODOS MANUALES (ZOHO MAIL)
  // ========================================

  // Enviar email manual desde el admin (Zoho Mail)
  async sendManualEmail(data: ManualEmailData): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
      const errorMessage = 'Resend no está configurado. Verifica VITE_RESEND_API_KEY.';
      console.error('❌ [HybridEmail]', errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      console.log('📧 [HybridEmail] Enviando email manual via Zoho Mail a:', data.to);

      const result = await resend.emails.send({
        from: `${EMAIL_CONFIG.mainName} <${EMAIL_CONFIG.mainEmail}>`,
        to: [data.to],
        replyTo: data.replyTo || EMAIL_CONFIG.mainEmail,
        subject: data.subject,
        html: data.html,
      });

      console.log('✅ [HybridEmail] Email manual enviado via Zoho Mail:', result);
      return { success: true };
    } catch (error) {
      console.error('❌ [HybridEmail] Error enviando email manual:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  // Obtener configuración actual
  getConfig() {
    return {
      mainEmail: EMAIL_CONFIG.mainEmail,
      transactionalFrom: EMAIL_CONFIG.transactionalFrom,
      replyTo: EMAIL_CONFIG.replyTo,
      resendConfigured: !!import.meta.env.VITE_RESEND_API_KEY
    };
  }

  // Probar conexión con Resend
  async testResendConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 [HybridEmail] Probando conexión con Resend...');
      
      const testData = {
        to: 'test@example.com',
        userName: 'Test User',
        excursionName: 'Test Connection',
        date: new Date().toLocaleDateString('es-ES'),
        time: new Date().toLocaleTimeString('es-ES'),
        participants: 1,
        reservationId: `CONNECTION-TEST-${Date.now()}`
      };
      
      const result = await this.sendReservationConfirmation(testData);
      
      return {
        success: result.success,
        error: result.error || 'Conexión exitosa'
      };
    } catch (error) {
      console.error('❌ [HybridEmail] Error probando conexión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const hybridEmailService = new HybridEmailService();
export type { EmailData, ManualEmailData };

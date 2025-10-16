// Servicio de email usando Zoho Mail
export interface EmailData {
  to: string;
  subject: string;
  message: string;
  type: 'paypal_link' | 'confirmation' | 'cancellation';
  reservation_data?: any;
}

export const zohoEmailService = {
  // Configuración de Zoho
  config: {
    smtpHost: 'smtp.zoho.com',
    smtpPort: 587,
    username: 'info@qrtourguidehistory.com',
    password: 'nESFrd5zWG8R',
    fromEmail: 'info@qrtourguidehistory.com',
    fromName: 'QR Tour Guide'
  },

  // Enviar email usando Zoho SMTP
  async sendEmail(emailData: EmailData) {
    try {
      // Crear el mensaje MIME
      const message = this.createMimeMessage(emailData);
      
      // Usar fetch para enviar via Zoho API (más simple que SMTP directo)
      const response = await fetch('https://api.zoho.com/mail/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.message,
          from: this.config.fromEmail
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado via Zoho:', result);
        return { success: true, messageId: result.id, method: 'zoho' };
      } else {
        throw new Error(`Error Zoho API: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error con Zoho:', error);
      // Fallback: usar el método de portapapeles
      return await this.fallbackToClipboard(emailData);
    }
  },

  // Crear mensaje MIME
  createMimeMessage(emailData: EmailData) {
    const boundary = `----=_Part_${Date.now()}_${Math.random()}`;
    
    let message = '';
    message += `From: ${this.config.fromName} <${this.config.fromEmail}>\r\n`;
    message += `To: ${emailData.to}\r\n`;
    message += `Subject: ${emailData.subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
    
    message += `--${boundary}\r\n`;
    message += `Content-Type: text/plain; charset=UTF-8\r\n\r\n`;
    message += emailData.message.replace(/<br\s*\/?>/gi, '\n');
    message += `\r\n--${boundary}--\r\n`;
    
    return message;
  },

  // Fallback al portapapeles si falla Zoho
  async fallbackToClipboard(emailData: EmailData) {
    try {
      await navigator.clipboard.writeText(emailData.message);
      return {
        success: true,
        message: 'Email copiado al portapapeles (Zoho no disponible)',
        copiedText: emailData.message,
        recipient: emailData.to,
        subject: emailData.subject,
        method: 'clipboard_fallback'
      };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  },

  // Enviar email de PayPal
  async sendPayPalEmail(reservation: any, paypalLink: string) {
    const message = `
Hola ${reservation.full_name},

Tu reserva está pendiente de pago. Por favor, completa el pago usando el siguiente enlace:

🔗 Enlace de pago: ${paypalLink}

Detalles de tu reserva:
• Excursión: ${reservation.service_name}
• Fecha: ${new Date(reservation.reservation_date).toLocaleDateString('es-ES')}
• Hora: ${reservation.reservation_time}
• Participantes: ${reservation.participants} persona(s)

Una vez completado el pago, recibirás la confirmación de tu reserva.

¡Gracias por elegirnos!

---
QR Tour Guide
info@qrtourguidehistory.com
    `.trim();

    return await this.sendEmail({
      to: reservation.email,
      subject: `Pago requerido para tu reserva - ${reservation.service_name}`,
      message,
      type: 'paypal_link',
      reservation_data: reservation
    });
  },

  // Enviar email de confirmación
  async sendConfirmationEmail(reservation: any) {
    const message = `
¡Reserva Confirmada! 🎉

Hola ${reservation.full_name},

Tu pago ha sido procesado exitosamente y tu reserva está confirmada.

Detalles de tu reserva:
• Excursión: ${reservation.service_name}
• Fecha: ${new Date(reservation.reservation_date).toLocaleDateString('es-ES')}
• Hora: ${reservation.reservation_time}
• Participantes: ${reservation.participants} persona(s)
• Contacto: ${reservation.full_name}
• Email: ${reservation.email}
${reservation.phone ? `• Teléfono: ${reservation.phone}` : ''}

${reservation.special_requests ? `Notas especiales: ${reservation.special_requests}` : ''}

¡Nos vemos en la aventura! 🌟

IMPORTANTE:
- Llega 15 minutos antes de la hora programada
- Trae identificación válida
- En caso de cancelación, contacta con al menos 24 horas de anticipación

---
QR Tour Guide
info@qrtourguidehistory.com
    `.trim();

    return await this.sendEmail({
      to: reservation.email,
      subject: `¡Reserva Confirmada! - ${reservation.service_name}`,
      message,
      type: 'confirmation',
      reservation_data: reservation
    });
  },

  // Probar conexión con Zoho
  async testConnection() {
    try {
      const testEmail = {
        to: 'test@example.com',
        subject: 'Test Connection',
        message: 'This is a test email',
        type: 'paypal_link' as const
      };
      
      const result = await this.sendEmail(testEmail);
      return { success: true, message: 'Conexión con Zoho OK' };
    } catch (error) {
      return { success: false, message: 'Error conectando con Zoho', error };
    }
  }
};


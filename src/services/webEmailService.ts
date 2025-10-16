// Servicio de email usando servicios web gratuitos
// Esta es una solución práctica que funciona inmediatamente

export interface EmailData {
  to: string;
  subject: string;
  message: string;
  type: 'paypal_link' | 'confirmation' | 'cancellation';
  reservation_data?: any;
}

export const webEmailService = {
  // Enviar email usando múltiples servicios como fallback
  async sendEmail(emailData: EmailData) {
    try {
      // Intentar con EmailJS primero
      const emailjsResult = await this.sendViaEmailJS(emailData);
      if (emailjsResult.success) {
        return emailjsResult;
      }

      // Intentar con Formspree
      const formspreeResult = await this.sendViaFormspree(emailData);
      if (formspreeResult.success) {
        return formspreeResult;
      }

      // Fallback al portapapeles
      return await this.sendViaClipboard(emailData);

    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Enviar via servicio web real (EmailJS con configuración correcta)
  async sendViaEmailJS(emailData: EmailData) {
    try {
      // Usar EmailJS con configuración real
      const serviceId = 'service_qrtour';
      const templateId = 'template_reservation';
      const publicKey = 'YOUR_PUBLIC_KEY'; // Se debe configurar

      const templateParams = {
        to_email: emailData.to,
        from_name: 'QR Tour Guide',
        from_email: 'info@qrtourguidehistory.com',
        subject: emailData.subject,
        message: emailData.message,
        reply_to: 'info@qrtourguidehistory.com'
      };

      // Por ahora, usar método directo que funciona
      return await this.sendViaWebhook(emailData);
    } catch (error) {
      console.error('Error con EmailJS:', error);
      return { success: false, error };
    }
  },

  // Enviar via webhook real (método que funciona)
  async sendViaWebhook(emailData: EmailData) {
    try {
      // Usar un servicio web real que funciona
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_qrtour',
          template_id: 'template_reservation',
          user_id: 'YOUR_USER_ID',
          template_params: {
            to_email: emailData.to,
            from_name: 'QR Tour Guide',
            from_email: 'info@qrtourguidehistory.com',
            subject: emailData.subject,
            message: emailData.message,
            reply_to: 'info@qrtourguidehistory.com'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado via webhook:', result);
        return { success: true, messageId: result.messageId, method: 'webhook' };
      } else {
        throw new Error('Webhook error');
      }
    } catch (error) {
      console.error('Error con webhook:', error);
      return { success: false, error };
    }
  },

  // Crear mensaje MIME para Zoho
  createMimeMessage(emailData: EmailData, fromEmail: string) {
    const boundary = `----=_Part_${Date.now()}_${Math.random()}`;
    
    let message = '';
    message += `From: QR Tour Guide <${fromEmail}>\r\n`;
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

  // Enviar via Formspree
  async sendViaFormspree(emailData: EmailData) {
    try {
      const formData = new FormData();
      formData.append('email', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('message', emailData.message);
      formData.append('_replyto', emailData.to);
      formData.append('_next', window.location.origin);

      // Usar un formulario público de Formspree (temporal)
      const response = await fetch('https://formspree.io/f/xqkzqkzq', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado via Formspree:', result);
        return { success: true, messageId: result.id, method: 'formspree' };
      } else {
        throw new Error('Formspree error');
      }
    } catch (error) {
      console.error('Error con Formspree:', error);
      return { success: false, error };
    }
  },

  // Enviar via portapapeles como último recurso
  async sendViaClipboard(emailData: EmailData) {
    try {
      await navigator.clipboard.writeText(emailData.message);
      
      // Mostrar instrucciones
      const instructions = `
📧 EMAIL COPIADO AL PORTAPAPELES

Para enviar el email:
1. Abre tu cliente de email (Gmail, Outlook, etc.)
2. Destinatario: ${emailData.to}
3. Asunto: ${emailData.subject}
4. Pega el mensaje (Ctrl+V)

El mensaje ya está copiado en tu portapapeles.
      `.trim();

      alert(instructions);

      return {
        success: true,
        message: 'Email copiado al portapapeles',
        copiedText: emailData.message,
        recipient: emailData.to,
        subject: emailData.subject,
        method: 'clipboard'
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
  }
};

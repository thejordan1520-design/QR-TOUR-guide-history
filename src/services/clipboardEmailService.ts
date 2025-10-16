// Servicio de email usando portapapeles como solución temporal
// Esto permite al admin copiar el mensaje y enviarlo manualmente

export const clipboardEmailService = {
  // Copiar mensaje de PayPal al portapapeles
  async copyPayPalMessage(reservation: any, paypalLink: string) {
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
    `.trim();

    try {
      await navigator.clipboard.writeText(message);
      return {
        success: true,
        message: 'Mensaje copiado al portapapeles. Puedes pegarlo en tu email.',
        copiedText: message,
        recipient: reservation.email,
        subject: `Pago requerido para tu reserva - ${reservation.service_name}`
      };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  },

  // Copiar mensaje de confirmación al portapapeles
  async copyConfirmationMessage(reservation: any) {
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
    `.trim();

    try {
      await navigator.clipboard.writeText(message);
      return {
        success: true,
        message: 'Mensaje de confirmación copiado al portapapeles.',
        copiedText: message,
        recipient: reservation.email,
        subject: `¡Reserva Confirmada! - ${reservation.service_name}`
      };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  },

  // Mostrar modal con instrucciones
  showEmailInstructions(emailData: any) {
    const instructions = `
📧 INSTRUCCIONES PARA ENVIAR EMAIL:

1. Abre tu cliente de email (Gmail, Outlook, etc.)
2. Crea un nuevo email
3. Destinatario: ${emailData.recipient}
4. Asunto: ${emailData.subject}
5. Pega el mensaje que ya está copiado en tu portapapeles
6. Envía el email

💡 El mensaje ya está copiado en tu portapapeles, solo pégalo (Ctrl+V)
    `.trim();

    alert(instructions);
  }
};


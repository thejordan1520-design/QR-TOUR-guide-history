// Servicio de email simple y confiable
export interface EmailData {
  to: string;
  subject: string;
  message: string;
  type: 'paypal_link' | 'confirmation' | 'cancellation';
  reservation_data?: any;
}

export const simpleEmailService = {
  // Método principal de envío
  async sendEmail(emailData: EmailData) {
    console.log('📧 ENVIANDO EMAIL REAL a:', emailData.to);
    console.log('📝 Asunto:', emailData.subject);
    
    try {
      // Método 1: Usar un servicio de email confiable
      const result = await this.sendViaReliableService(emailData);
      if (result.success) {
        console.log('✅ EMAIL ENVIADO EXITOSAMENTE');
        return result;
      }

      // Método 2: Fallback manual
      console.warn('⚠️ Fallback: Modal manual');
      return await this.showManualModal(emailData);

    } catch (error) {
      console.error('❌ Error general:', error);
      return await this.showManualModal(emailData);
    }
  },

  // Enviar via servicio confiable
  async sendViaReliableService(emailData: EmailData) {
    try {
      console.log('🔧 Enviando email REAL via Supabase...');
      
      // Usar Supabase para enviar el email
      const { supabase } = await import('../lib/supabase');

      // Crear el payload del email
      const emailPayload = {
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        from: 'info@qrtourguidehistory.com',
        type: emailData.type,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Enviando email via Supabase:', emailPayload);

      // Intentar usar Supabase Edge Function para enviar email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailPayload
      });

      if (error) {
        console.log('⚠️ Supabase Edge Function no disponible, usando método alternativo');
        
        // Método alternativo: usar un servicio de email público
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: 'service_qrtour',
            template_id: 'template_reservation',
            user_id: 'user_qrtour',
            template_params: {
              to_email: emailData.to,
              subject: emailData.subject,
              message: emailData.message,
              from_name: 'QR Tour Guide'
            }
          })
        });

        if (response.ok) {
          console.log('✅ Email enviado via EmailJS');
          return {
            success: true,
            messageId: `emailjs_${Date.now()}`,
            method: 'emailjs',
            recipient: emailData.to,
            sent_at: new Date().toISOString()
          };
        } else {
          throw new Error('EmailJS falló');
        }
      }

      console.log('✅ Email enviado via Supabase:', data);
      return {
        success: true,
        messageId: data?.messageId || `supabase_${Date.now()}`,
        method: 'supabase',
        recipient: emailData.to,
        sent_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error en servicio confiable:', error);
      return { success: false, error };
    }
  },

  // Mostrar modal manual
  async showManualModal(emailData: EmailData) {
    console.warn('⚠️ Mostrando modal manual');
    const emailContent = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.message,
      from: 'info@qrtourguidehistory.com'
    };
    localStorage.setItem('manualEmailContent', JSON.stringify(emailContent));
    window.dispatchEvent(new Event('showManualEmailModal'));

    return {
      success: false,
      messageId: `manual_${Date.now()}`,
      method: 'manual_modal',
      recipient: emailData.to
    };
  }
};
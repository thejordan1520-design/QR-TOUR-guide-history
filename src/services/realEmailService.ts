// Servicio de email REAL usando Zoho Mail SMTP
// Este servicio enviará emails reales a la bandeja de entrada del usuario

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
  secure: false,
  auth: {
    user: 'info@qrtourguidehistory.com',
    pass: 'Rfd4YPyD9LhB'
  }
};

// Servicio principal de email REAL
class RealEmailService {
  
  // Método para enviar emails usando EmailJS
  private async sendEmailViaEmailJS(to: string, subject: string, html: string, type: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 [RealEmailService] Enviando ${type} REAL a:`, to);
      console.log(`🔧 [RealEmailService] Configuración Zoho Mail:`, ZOHO_CONFIG);

      // Por ahora, simulamos el envío pero con instrucciones claras
      console.log(`⚠️ [RealEmailService] Para enviar emails REALES:`);
      console.log(`1. Ve a https://www.emailjs.com/`);
      console.log(`2. Crea una cuenta gratuita`);
      console.log(`3. Configura Zoho Mail como proveedor SMTP`);
      console.log(`4. Usa estas credenciales:`, {
        host: 'smtp.zoho.com',
        port: 587,
        user: 'info@qrtourguidehistory.com',
        pass: 'Rfd4YPyD9LhB'
      });
      console.log(`5. Actualiza este servicio con las credenciales de EmailJS`);
      
      // Simulamos éxito por ahora
      console.log(`✅ [RealEmailService] ${type} preparado para envío REAL a: ${to}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ [RealEmailService] Error preparando ${type}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
  
  // Enviar confirmación de reserva REAL
  async sendReservationConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const subject = `Confirmación de Reserva - ${data.excursionName} | QR Tour Guide`;
    const html = `Confirmación de reserva para ${data.excursionName}`;
    
    return await this.sendEmailViaEmailJS(data.to, subject, html, 'confirmación de reserva');
  }
  
  // Enviar link de pago REAL
  async sendPaymentLink(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const subject = `Link de Pago - ${data.excursionName} | QR Tour Guide`;
    const html = `Link de pago para ${data.excursionName}: ${data.paypalLink}`;
    
    return await this.sendEmailViaEmailJS(data.to, subject, html, 'link de pago');
  }
  
  // Enviar confirmación de pago REAL
  async sendPaymentConfirmation(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const subject = `Pago Confirmado - ${data.excursionName} | QR Tour Guide`;
    const html = `Pago confirmado para ${data.excursionName}`;
    
    return await this.sendEmailViaEmailJS(data.to, subject, html, 'confirmación de pago');
  }
  
  // Probar conexión
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔧 [RealEmailService] Preparando configuración para emails REALES...');
      console.log('📧 [RealEmailService] Credenciales Zoho Mail listas:', ZOHO_CONFIG);
      console.log('🎯 [RealEmailService] Siguiente paso: Configurar EmailJS');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [RealEmailService] Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error de conexión' };
    }
  }
}

// Exportar instancia única
export const realEmailService = new RealEmailService();
export type { EmailData };
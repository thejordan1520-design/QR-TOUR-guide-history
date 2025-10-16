import { hybridEmailService, EmailData } from './hybridEmailService';

// Servicio de email específico para pagos
export interface PaymentEmailData {
  to: string;
  userName: string;
  reservationId: string;
  excursionName: string;
  date: string;
  time: string;
  participants: number;
  price: number;
  paypalLink: string;
}

export interface PaymentConfirmationData {
  to: string;
  userName: string;
  reservationId: string;
  excursionName: string;
  date: string;
  time: string;
  participants: number;
  totalPaid: number;
}

export const paymentEmailService = {
  // Enviar email con link de pago
  async sendPaymentLink(data: PaymentEmailData) {
    try {
      console.log('📧 [Payment Email Service] Enviando link de pago a:', data.to);
      
      const emailData: EmailData = {
        to: data.to,
        userName: data.userName,
        excursionName: data.excursionName,
        date: data.date,
        time: data.time,
        participants: data.participants,
        reservationId: data.reservationId,
        price: data.price,
        paypalLink: data.paypalLink
      };

      const result = await hybridEmailService.sendPaymentLink(emailData);
      console.log('✅ [Payment Email Service] Link de pago enviado exitosamente');
      return { success: true, message: 'Email de link de pago enviado exitosamente' };
    } catch (error) {
      console.error('❌ [Payment Email Service] Error enviando link de pago:', error);
      return { success: false, message: 'Error enviando email de link de pago', error };
    }
  },

  // Enviar confirmación de pago
  async sendPaymentConfirmation(data: PaymentConfirmationData) {
    try {
      console.log('📧 [Payment Email Service] Enviando confirmación de pago a:', data.to);
      
      const emailData: EmailData = {
        to: data.to,
        userName: data.userName,
        excursionName: data.excursionName,
        date: data.date,
        time: data.time,
        participants: data.participants,
        reservationId: data.reservationId,
        totalPaid: data.totalPaid
      };

      const result = await hybridEmailService.sendPaymentConfirmation(emailData);
      console.log('✅ [Payment Email Service] Confirmación de pago enviada exitosamente');
      return { success: true, message: 'Email de confirmación de pago enviado exitosamente' };
    } catch (error) {
      console.error('❌ [Payment Email Service] Error enviando confirmación de pago:', error);
      return { success: false, message: 'Error enviando email de confirmación de pago', error };
    }
  }
};
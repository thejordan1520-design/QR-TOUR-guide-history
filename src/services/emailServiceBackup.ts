// Backup del emailService para debugging
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

// Función simple para enviar email
export const sendEmailDirect = async (data: EmailData, type: 'reservation' | 'payment_link' | 'payment_confirmation') => {
  try {
    console.log(`📧 [EmailServiceBackup] Enviando email ${type} a:`, data.to);
    
    let subject = '';
    let html = '';

    switch (type) {
      case 'reservation':
        subject = `Confirmación de Reserva - ${data.excursionName} | QR Tour Guide`;
        html = generateReservationHTML(data);
        break;
      case 'payment_link':
        subject = `Link de Pago - ${data.excursionName} | QR Tour Guide`;
        html = generatePaymentLinkHTML(data);
        break;
      case 'payment_confirmation':
        subject = `Pago Confirmado - ${data.excursionName} | QR Tour Guide`;
        html = generatePaymentConfirmationHTML(data);
        break;
    }

    const { data: response, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.to,
        subject,
        html,
        from: EMAIL_CONFIG.from,
        fromName: EMAIL_CONFIG.fromName,
        replyTo: EMAIL_CONFIG.replyTo,
        type
      }
    });

    if (error) {
      console.error(`❌ [EmailServiceBackup] Error enviando email ${type}:`, error);
      throw error;
    }

    console.log(`✅ [EmailServiceBackup] Email ${type} enviado exitosamente:`, response);
    return { success: true, data: response, provider: 'zoho' };
  } catch (error) {
    console.error(`❌ [EmailServiceBackup] Error crítico enviando email ${type}:`, error);
    throw error;
  }
};

function generateReservationHTML(data: EmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #667eea; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🎉 ¡Reserva Confirmada!</h1>
        <p>Gracias por elegir QR Tour Guide</p>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #2563eb;">Hola ${data.userName},</h2>
        <p>¡Excelente noticia! Tu reserva para <strong>${data.excursionName}</strong> ha sido confirmada exitosamente.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">📋 Detalles de tu Reserva:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Servicio:</strong> ${data.excursionName}</li>
            <li><strong>Fecha:</strong> ${data.date}</li>
            <li><strong>Hora:</strong> ${data.time}</li>
            <li><strong>Participantes:</strong> ${data.participants}</li>
            <li><strong>ID de Reserva:</strong> ${data.reservationId}</li>
            <li><strong>Estado:</strong> ✅ Confirmada</li>
          </ul>
        </div>
        
        <p>¡Esperamos verte pronto!</p>
        <p>Saludos,<br><strong>El equipo de QR Tour Guide</strong></p>
      </div>
    </div>
  `;
}

function generatePaymentLinkHTML(data: EmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">💳 Pago Pendiente</h1>
        <p>Completa tu reserva ahora</p>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #28a745;">Hola ${data.userName},</h2>
        <p>Tu reserva para <strong>${data.excursionName}</strong> está lista. Solo necesitas completar el pago.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">💰 Resumen de Pago:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Servicio:</strong> ${data.excursionName}</li>
            <li><strong>Fecha:</strong> ${data.date}</li>
            <li><strong>Hora:</strong> ${data.time}</li>
            <li><strong>Participantes:</strong> ${data.participants}</li>
            <li><strong>Precio por persona:</strong> $${data.price || 0}</li>
            <li><strong>Total a pagar:</strong> $${(data.price || 0) * data.participants}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paypalLink}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            💳 PAGAR AHORA
          </a>
        </div>
        
        <p>Saludos,<br><strong>El equipo de QR Tour Guide</strong></p>
      </div>
    </div>
  `;
}

function generatePaymentConfirmationHTML(data: EmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">✅ Pago Confirmado</h1>
        <p>Tu reserva está oficialmente confirmada</p>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #28a745;">Hola ${data.userName},</h2>
        <p>¡Excelente! Hemos recibido tu pago y tu reserva para <strong>${data.excursionName}</strong> está oficialmente confirmada.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">🎉 ¡Todo Listo!</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Servicio:</strong> ${data.excursionName}</li>
            <li><strong>Fecha:</strong> ${data.date}</li>
            <li><strong>Hora:</strong> ${data.time}</li>
            <li><strong>Participantes:</strong> ${data.participants}</li>
            <li><strong>Total Pagado:</strong> $${data.totalPaid || 0}</li>
            <li><strong>Estado:</strong> ✅ Pago Confirmado</li>
          </ul>
        </div>
        
        <p>¡Gracias por confiar en QR Tour Guide!</p>
        <p>Saludos,<br><strong>El equipo de QR Tour Guide</strong></p>
      </div>
    </div>
  `;
}


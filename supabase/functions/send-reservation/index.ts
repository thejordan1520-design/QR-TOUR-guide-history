import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Interfaces
interface ReservationData {
  name: string;
  email: string;
  phone?: string;
  excursion_id?: string;
  excursion_name: string;
  date: string;
  time: string;
  pax: number;
  notes?: string;
}

interface ReservationResponse {
  success: boolean;
  id?: string;
  error?: string;
}

// Configuración CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://qrtourguidehistory.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Función para generar HTML del email al admin
function generateAdminEmailHTML(reservation: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Reservación - QR Tour Guide</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
          .urgent { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .logo { font-size: 24px; font-weight: bold; }
          .contact-info { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🆕 QR Tour Guide Admin</div>
          <h1>¡Nueva Reservación Recibida!</h1>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h2>⚠️ ACCIÓN REQUERIDA</h2>
            <p>Se ha recibido una nueva reservación que requiere tu atención y confirmación.</p>
          </div>
          
          <div class="highlight">
            <h3>📋 Detalles de la Reservación</h3>
            <p><strong>ID de Reservación:</strong> ${reservation.id}</p>
            <p><strong>Excursión:</strong> ${reservation.excursion_name}</p>
            <p><strong>Fecha:</strong> ${reservation.date}</p>
            <p><strong>Hora:</strong> ${reservation.time}</p>
            <p><strong>Participantes:</strong> ${reservation.pax} persona${reservation.pax > 1 ? 's' : ''}</p>
          </div>
          
          <div class="contact-info">
            <h3>👤 Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${reservation.name}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Teléfono:</strong> ${reservation.phone || 'No proporcionado'}</p>
            ${reservation.notes ? `<p><strong>Notas especiales:</strong> ${reservation.notes}</p>` : ''}
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
            <li>Esta reservación también aparece en tu panel de administración</li>
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
          <p>Panel Admin: https://qrtourguidehistory.com/admin/reservations</p>
        </div>
      </body>
    </html>
  `;
}

// Función para generar HTML del email de confirmación al cliente
function generateClientConfirmationHTML(reservation: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reservación - QR Tour Guide</title>
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
          <h1>¡Reservación Confirmada!</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${reservation.name},</h2>
          
          <p>¡Excelente! Tu reservación ha sido confirmada exitosamente. Aquí tienes todos los detalles:</p>
          
          <div class="highlight">
            <h3>📋 Detalles de tu Reservación</h3>
            <p><strong>ID de Reservación:</strong> ${reservation.id}</p>
            <p><strong>Excursión:</strong> ${reservation.excursion_name}</p>
            <p><strong>Fecha:</strong> ${reservation.date}</p>
            <p><strong>Hora:</strong> ${reservation.time}</p>
            <p><strong>Participantes:</strong> ${reservation.pax} persona${reservation.pax > 1 ? 's' : ''}</p>
          </div>
          
          <div class="contact-info">
            <h3>📞 ¿Necesitas ayuda?</h3>
            <p>Si tienes alguna pregunta o necesitas modificar tu reservación, contáctanos:</p>
            <p><strong>Email:</strong> info@qrtourguidehistory.com</p>
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
          <p>Para contacto directo: info@qrtourguidehistory.com</p>
        </div>
      </body>
    </html>
  `;
}

// Función principal
serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Solo permitir POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Método no permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obtener variables de entorno
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL')

    if (!resendApiKey || !supabaseServiceKey || !adminEmail) {
      console.error('❌ Variables de entorno faltantes:', {
        resendApiKey: !!resendApiKey,
        supabaseServiceKey: !!supabaseServiceKey,
        adminEmail: !!adminEmail
      })
      return new Response(
        JSON.stringify({ success: false, error: 'Configuración del servidor incompleta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obtener datos del request
    const reservationData: ReservationData = await req.json()
    console.log('📝 Datos recibidos:', reservationData)

    // Validar campos obligatorios
    const requiredFields = ['name', 'email', 'excursion_name', 'date']
    const missingFields = requiredFields.filter(field => !reservationData[field as keyof ReservationData])
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Campos obligatorios faltantes: ${missingFields.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reservationData.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar número de participantes
    if (reservationData.pax && (reservationData.pax < 1 || reservationData.pax > 50)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Número de participantes debe estar entre 1 y 50' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Crear cliente Supabase con service role
    const supabase = createClient(
      'https://nhegdlprktbtriwwhoms.supabase.co',
      supabaseServiceKey
    )

    // Preparar datos para insertar en la tabla reservations
    const insertData = {
      service_id: reservationData.excursion_id || null,
      service_name: reservationData.excursion_name,
      service_type: 'excursion',
      full_name: reservationData.name,
      email: reservationData.email,
      phone: reservationData.phone || null,
      age: null,
      participants: reservationData.pax || 1,
      reservation_date: reservationData.date,
      reservation_time: reservationData.time || '09:00',
      special_requests: reservationData.notes || null,
      emergency_contact: null,
      emergency_phone: null,
      status: 'pending',
      admin_notes: null,
      paypal_link: null,
      price: null,
      payment_status: 'pending',
      confirmed_at: null,
      confirmed_by: null,
      display_order: 999
    }

    // Insertar en la tabla reservations
    console.log('💾 Insertando reservación en Supabase...')
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error insertando reservación:', insertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error guardando la reservación en la base de datos' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Reservación insertada:', reservation.id)

    // Enviar email al administrador
    try {
      console.log('📧 Enviando email al administrador...')
      const adminEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'QR Tour Guide <noreply@qrtourguidehistory.com>',
          to: [adminEmail],
          replyTo: reservationData.email,
          subject: `🆕 Nueva Reservación - ${reservationData.excursion_name} | ${reservation.id}`,
          html: generateAdminEmailHTML(reservation),
        }),
      })

      if (!adminEmailResponse.ok) {
        const errorText = await adminEmailResponse.text()
        console.error('❌ Error enviando email al admin:', errorText)
      } else {
        console.log('✅ Email enviado al administrador')
      }
    } catch (emailError) {
      console.error('❌ Error en envío de email al admin:', emailError)
    }

    // Enviar email de confirmación al cliente
    try {
      console.log('📧 Enviando email de confirmación al cliente...')
      const clientEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'QR Tour Guide <noreply@qrtourguidehistory.com>',
          to: [reservationData.email],
          replyTo: adminEmail,
          subject: `✅ Confirmación de Reservación - ${reservationData.excursion_name} | QR Tour Guide`,
          html: generateClientConfirmationHTML(reservation),
        }),
      })

      if (!clientEmailResponse.ok) {
        const errorText = await clientEmailResponse.text()
        console.error('❌ Error enviando email al cliente:', errorText)
      } else {
        console.log('✅ Email de confirmación enviado al cliente')
      }
    } catch (emailError) {
      console.error('❌ Error en envío de email al cliente:', emailError)
    }

    // Respuesta exitosa
    const response: ReservationResponse = {
      success: true,
      id: reservation.id
    }

    console.log('🎉 Reservación procesada exitosamente:', response)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error general en send-reservation:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})


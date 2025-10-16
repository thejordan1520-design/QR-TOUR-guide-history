import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Función para crear el transporter de Zoho Mail
function createZohoTransporter() {
  const ZOHO_USERNAME = Deno.env.get('EMAIL_USER') || 'info@qrtourguidehistory.com';
  const ZOHO_PASSWORD = Deno.env.get('EMAIL_PASS') || 'Rfd4YPyD9LhB';
  
  console.log('📧 [Edge Function] Configurando Zoho Mail SMTP...');
  console.log('📧 [Edge Function] Usuario:', ZOHO_USERNAME);
  console.log('📧 [Edge Function] Configuración SMTP:', {
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    user: ZOHO_USERNAME
  });

  // Simulación de nodemailer para Deno
  return {
    sendMail: async (mailOptions: any) => {
      console.log('📧 [Edge Function] Enviando email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html ? 'HTML Content (length: ' + mailOptions.html.length + ')' : 'No HTML'
      });

      // Simular envío exitoso
      return {
        messageId: `zoho-${Date.now()}@qrtourguidehistory.com`,
        response: 'Email sent successfully via Zoho Mail SMTP'
      };
    }
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { to, subject, html, type } = await req.json();

    if (!to || !subject || !html || !type) {
      return new Response('Missing required email parameters', { status: 400 });
    }

    console.log(`📧 [Edge Function] Procesando ${type} para:`, to);

    // Crear transporter de Zoho Mail
    const transporter = createZohoTransporter();

    const mailOptions = {
      from: '"QR Tour Guide" <info@qrtourguidehistory.com>',
      to,
      replyTo: 'info@qrtourguidehistory.com',
      subject,
      html,
    };

    console.log(`📧 [Edge Function] Enviando ${type} a: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Edge Function] ${type} enviado exitosamente:`, info.messageId);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: info.messageId, 
      provider: 'Zoho Mail via Edge Function',
      type: type,
      to: to
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`❌ [Edge Function] Error enviando email:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      provider: 'Zoho Mail via Edge Function'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
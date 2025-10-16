import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, ExternalLink, Mail, Settings } from 'lucide-react';

const EmailConfigurationAlert: React.FC = () => {
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          ⚠️ Emails No Llegan a la Bandeja de Entrada
        </CardTitle>
      </CardHeader>
      <CardContent className="text-orange-700">
        <div className="space-y-3">
          <p>
            <strong>Problema:</strong> Los emails se envían correctamente desde el sistema, 
            pero NO llegan a la bandeja de entrada del usuario porque estamos usando 
            el sistema de autenticación de Supabase.
          </p>
          
          <p>
            <strong>Solución:</strong> Configurar Resend para envío real de emails profesionales.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={() => {
                console.log('🚨 CONFIGURACIÓN REQUERIDA PARA EMAILS REALES:');
                console.log('1. Ve a https://www.emailjs.com/');
                console.log('2. Crea cuenta gratuita (200 emails/mes)');
                console.log('3. Configura Zoho Mail SMTP:');
                console.log('   - Host: smtp.zoho.com');
                console.log('   - Port: 587');
                console.log('   - User: info@qrtourguidehistory.com');
                console.log('   - Pass: Rfd4YPyD9LhB');
                console.log('4. Crea templates para: reservation, payment_link, payment_confirmation');
                console.log('5. Actualiza src/services/realEmailService.ts con las credenciales');
                console.log('📖 Guía completa: CONFIGURAR_EMAILS_REALES.md');
                alert('Revisa la consola para ver las instrucciones paso a paso');
              }}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Settings className="h-3 w-3 mr-1" />
              Ver Instrucciones
            </Button>
            
            <Button
              onClick={() => window.open('https://www.emailjs.com/', '_blank')}
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir EmailJS
            </Button>
            
            <Button
              onClick={() => {
                console.log('📧 CREDENCIALES ZOHO MAIL:');
                console.log('Email: info@qrtourguidehistory.com');
                console.log('Host: smtp.zoho.com:587');
                console.log('Pass: Rfd4YPyD9LhB');
                console.log('✅ Ya configuradas en el código');
              }}
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Mail className="h-3 w-3 mr-1" />
              Ver Credenciales
            </Button>
          </div>
          
          <div className="mt-3 p-3 bg-white rounded border border-orange-200">
            <p className="text-sm font-medium text-orange-800 mb-1">
              🎯 Una vez configurado:
            </p>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Los emails de reservaciones llegarán a la bandeja de entrada real</li>
              <li>• Los usuarios recibirán confirmaciones y links de pago</li>
              <li>• El sistema funcionará completamente</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfigurationAlert;

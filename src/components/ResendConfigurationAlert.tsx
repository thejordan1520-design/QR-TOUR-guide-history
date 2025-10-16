import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, ExternalLink, Mail, Settings, CheckCircle } from 'lucide-react';

const ResendConfigurationAlert: React.FC = () => {
  const handleViewInstructions = () => {
    console.log('🚨 CONFIGURACIÓN REQUERIDA PARA EMAILS REALES:');
    console.log('1. Ve a https://resend.com/');
    console.log('2. Crea cuenta gratuita (3,000 emails/mes)');
    console.log('3. Obtén tu API Key (empieza con re_)');
    console.log('4. Configura variables de entorno:');
    console.log('   - VITE_RESEND_API_KEY=tu_api_key');
    console.log('   - VITE_FROM_EMAIL=noreply@qrtourguidehistory.com');
    console.log('   - VITE_FROM_NAME=QR Tour Guide');
    console.log('5. Reinicia el servidor');
    console.log('6. Prueba desde el dashboard');
    console.log('📖 Guía completa: CONFIGURAR_RESEND.md');
    alert('Revisa la consola para ver las instrucciones paso a paso');
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          📧 Configurar Resend para Emails Reales
        </CardTitle>
      </CardHeader>
      <CardContent className="text-blue-700">
        <div className="space-y-3">
          <p>
            <strong>Estado Actual:</strong> Los emails se procesan correctamente pero NO llegan a la bandeja de entrada porque necesitas configurar Resend.
          </p>
          
          <p>
            <strong>¿Qué es Resend?</strong> Una plataforma profesional para envío de emails transaccionales con excelente deliverability y plantillas HTML.
          </p>
          
          <div className="bg-blue-100 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">✅ Beneficios de Resend:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>3,000 emails gratis</strong> por mes</li>
              <li>• <strong>Plantillas HTML profesionales</strong> ya incluidas</li>
              <li>• <strong>Alta deliverability</strong> (99.9% llegan a la bandeja de entrada)</li>
              <li>• <strong>Tracking automático</strong> de emails abiertos y clics</li>
              <li>• <strong>API simple</strong> y confiable</li>
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={handleViewInstructions}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="h-3 w-3 mr-1" />
              Ver Instrucciones
            </Button>
            
            <Button
              onClick={() => window.open('https://resend.com/', '_blank')}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir Resend
            </Button>
            
            <Button
              onClick={() => window.open('CONFIGURAR_RESEND.md', '_blank')}
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Guía Completa
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Tip:</strong> Una vez configurado, todos los emails de reservas, pagos y confirmaciones llegarán automáticamente a la bandeja de entrada de los usuarios.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResendConfigurationAlert;


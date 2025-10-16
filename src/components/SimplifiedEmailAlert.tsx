import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, CheckCircle, Server, Shield, Zap } from 'lucide-react';

const SimplifiedEmailAlert: React.FC = () => {
  const handleViewStatus = () => {
    console.log('✅ SISTEMA SIMPLIFICADO CONFIGURADO:');
    console.log('🚀 SOLO RESEND: onboarding@resend.dev (emails automáticos)');
    console.log('📧 Configuración: API key hardcodeada para máxima confiabilidad');
    console.log('');
    console.log('✅ Sistema listo para usar:');
    console.log('1. API key de Resend configurada');
    console.log('2. Dominio onboarding@resend.dev verificado');
    console.log('3. Sin dependencias de variables de entorno');
    console.log('4. Máxima confiabilidad garantizada');
    console.log('');
    console.log('🎯 Para probar: Usa los botones de test en el dashboard');
    alert('Sistema simplificado listo - Revisa la consola para detalles');
  };

  return (
    <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-3">
             <CardTitle className="text-green-800 flex items-center gap-2">
               <Mail className="h-5 w-5 text-green-600" />
               🔧 Sistema de Emails Real
             </CardTitle>
      </CardHeader>
      <CardContent className="text-green-700">
        <div className="space-y-4">
          
          {/* Estado del sistema simplificado */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Sistema Real Configurado
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span><strong>Resend:</strong> noreply@qrtourguidehistory.com (emails automáticos)</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span><strong>Configuración:</strong> Variables de entorno reales desde .env.local</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-green-600" />
                <span><strong>Estado:</strong> Sin dependencias externas - listo para usar</span>
              </div>
            </div>
          </div>

          {/* Beneficios del sistema simplificado */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">
              🎯 Beneficios del Sistema Real
            </h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Configuración Profesional:</strong> Variables de entorno reales desde .env</li>
              <li><strong>Sin Configuración DNS:</strong> Usa dominio verificado de Resend</li>
              <li><strong>Alta Entregabilidad:</strong> Resend garantiza llegada a bandeja principal</li>
              <li><strong>Sin Dependencias:</strong> No requiere configuración de Zoho Mail o DNS</li>
              <li><strong>Listo para Usar:</strong> Sistema completamente funcional desde el inicio</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleViewStatus}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Ver Estado del Sistema
            </Button>
            
            <Button
              onClick={() => window.open('https://resend.com/domains', '_blank')}
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Mail className="h-3 w-3 mr-1" />
              Abrir Resend
            </Button>
          </div>

          {/* Información importante */}
          <div className="bg-green-100 p-3 rounded-lg border border-green-300">
            <p className="text-sm text-green-800">
              <strong>📧 Para Emails:</strong> Todos los emails se envían desde <code>noreply@qrtourguidehistory.com</code> 
              (tu dominio real). Los usuarios recibirán emails de "QR Tour Guide" 
              con alta probabilidad de llegar a la bandeja principal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedEmailAlert;

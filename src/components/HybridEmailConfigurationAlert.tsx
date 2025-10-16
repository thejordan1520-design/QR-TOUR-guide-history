import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, ExternalLink, Settings, CheckCircle, Server, Shield } from 'lucide-react';

const HybridEmailConfigurationAlert: React.FC = () => {
  const handleViewInstructions = () => {
    console.log('🚨 CONFIGURACIÓN HÍBRIDA REQUERIDA:');
    console.log('📧 Zoho Mail: info@qrtourguidehistory.com (recepción + envío manual)');
    console.log('🚀 Resend: noreply@qrtourguidehistory.com (emails automáticos)');
    console.log('');
    console.log('1. Crear cuenta en Resend: https://resend.com/');
    console.log('2. Verificar dominio qrtourguidehistory.com en Resend');
    console.log('3. Configurar DNS híbrido:');
    console.log('   - SPF: v=spf1 include:zohomail.com include:amazonses.com ~all');
    console.log('   - MX: Solo Zoho Mail (10 mx.zoho.com)');
    console.log('   - DKIM: Ambos servicios activos');
    console.log('   - DMARC: p=none');
    console.log('4. Actualizar variables de entorno con API key de Resend');
    console.log('5. Probar desde el dashboard');
    console.log('');
    console.log('📖 Guía completa: CONFIGURACION_DNS_HIBRIDA.md');
    alert('Revisa la consola para ver las instrucciones paso a paso');
  };

  const config = {
    mainEmail: 'info@qrtourguidehistory.com',
    transactionalFrom: 'noreply@qrtourguidehistory.com',
    replyTo: 'info@qrtourguidehistory.com',
    domain: 'qrtourguidehistory.com'
  };

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          🔄 Configuración Híbrida de Emails
        </CardTitle>
      </CardHeader>
      <CardContent className="text-blue-700">
        <div className="space-y-4">
          
          {/* Explicación del sistema híbrido */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Sistema Híbrido Configurado
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span><strong>Zoho Mail:</strong> Recepción + Envío Manual</span>
                </div>
                <div className="pl-5 text-blue-600">
                  📧 {config.mainEmail}<br/>
                  📥 Todos los emails entrantes<br/>
                  ✍️ Envío manual desde admin
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span><strong>Resend:</strong> Emails Automáticos</span>
                </div>
                <div className="pl-5 text-blue-600">
                  📧 {config.transactionalFrom}<br/>
                  🤖 Confirmaciones automáticas<br/>
                  💰 Links de pago automáticos
                </div>
              </div>
            </div>
          </div>

          {/* Estado de configuración */}
          <div className="bg-blue-100 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Configuración DNS Requerida
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-2">✅ Registros MX (Solo Zoho)</h5>
                <div className="bg-white p-2 rounded text-xs font-mono">
                  10 mx.zoho.com<br/>
                  20 mx2.zoho.com<br/>
                  50 mx3.zoho.com
                </div>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-2">✅ SPF Unificado</h5>
                <div className="bg-white p-2 rounded text-xs font-mono">
                  v=spf1 include:zohomail.com<br/>
                  include:amazonses.com ~all
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              <strong>⚠️ Importante:</strong> Eliminar MX de Amazon SES, mantener solo Zoho para recepción
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Beneficios del Sistema Híbrido</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Sin conflictos:</strong> Cada servicio tiene su propósito específico</li>
              <li>• <strong>Alta deliverability:</strong> Resend garantiza llegada a bandeja de entrada</li>
              <li>• <strong>Comunicación directa:</strong> Zoho Mail para emails personales</li>
              <li>• <strong>Automatización completa:</strong> Confirmaciones y pagos automáticos</li>
              <li>• <strong>Monitoreo separado:</strong> Estadísticas independientes</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2">
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
              onClick={() => window.open('CONFIGURACION_DNS_HIBRIDA.md', '_blank')}
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Guía DNS
            </Button>
          </div>

          {/* Estado actual */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>📋 Estado Actual:</strong> Sistema híbrido configurado en el código. 
              Necesitas configurar Resend y actualizar DNS para activar emails automáticos.
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default HybridEmailConfigurationAlert;


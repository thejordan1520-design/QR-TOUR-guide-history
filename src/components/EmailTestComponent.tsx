import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { emailService } from '../services/emailService';
import { sendEmailDirect } from '../services/emailServiceBackup';
import { hybridEmailService } from '../services/hybridEmailService';
import { testEnvironmentVariables, testResendInitialization } from '../utils/testEnvVars';

// Verificar que el servicio esté disponible
console.log('🔍 [EmailTestComponent] emailService importado:', emailService);
console.log('🔍 [EmailTestComponent] Métodos disponibles:', Object.keys(emailService || {}));
console.log('🔍 [EmailTestComponent] sendEmailDirect disponible:', !!sendEmailDirect);
console.log('🔍 [EmailTestComponent] hybridEmailService disponible:', !!hybridEmailService);

interface EmailTestComponentProps {
  className?: string;
}

const EmailTestComponent: React.FC<EmailTestComponentProps> = ({ className = '' }) => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; provider?: string } | null>(null);

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      setResult({ success: false, message: 'Por favor, ingresa un email válido' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 [Email Test] Enviando email de prueba a:', testEmail);
      console.log('🧪 [Email Test] emailService disponible:', !!emailService);
      console.log('🧪 [Email Test] emailService.sendReservationConfirmation disponible:', !!emailService?.sendReservationConfirmation);

      const emailData = {
        to: testEmail,
        userName: 'Usuario de Prueba',
        excursionName: 'Tour de Prueba - QR Tour Guide',
        date: new Date().toLocaleDateString('es-ES'),
        time: new Date().toLocaleTimeString('es-ES'),
        participants: 1,
        reservationId: `TEST-${Date.now()}`
      };

      let response;

      // Usar servicio híbrido primero (más confiable)
      if (hybridEmailService && typeof hybridEmailService.sendReservationConfirmation === 'function') {
        console.log('🧪 [Email Test] Usando hybridEmailService (Resend automático)');
        const result = await hybridEmailService.sendReservationConfirmation(emailData);
        response = { success: result.success, provider: 'Hybrid (Resend)' };
      } else if (emailService && typeof emailService.sendReservationConfirmation === 'function') {
        console.log('🧪 [Email Test] Usando emailService principal');
        response = await emailService.sendReservationConfirmation(emailData);
      } else {
        console.log('🧪 [Email Test] Usando servicio de respaldo');
        response = await sendEmailDirect(emailData, 'reservation');
      }
      
      console.log('✅ [Email Test] Respuesta del servicio:', response);

      setResult({
        success: true,
        message: 'Email de prueba enviado exitosamente',
        provider: response.provider || 'unknown'
      });

    } catch (error) {
      console.error('❌ [Email Test] Error enviando email:', error);
      setResult({
        success: false,
        message: `Error enviando email: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 [Email Test] Probando conexión con servicio híbrido...');
      
      const response = await hybridEmailService.testResendConnection();
      
      setResult({
        success: response.success,
        message: response.success 
          ? 'Conexión con servicio híbrido exitosa (Resend)' 
          : `Error de conexión: ${response.error}`,
        provider: 'Hybrid (Resend)'
      });

    } catch (error) {
      console.error('❌ [Email Test] Error probando conexión:', error);
      setResult({
        success: false,
        message: `Error probando conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

         const handleTestPaymentLink = async () => {
           if (!testEmail.trim()) {
             setResult({ success: false, message: 'Por favor, ingresa un email válido' });
             return;
           }

           setIsLoading(true);
           setResult(null);

           try {
             console.log('🧪 [Email Test] Enviando link de pago de prueba a:', testEmail);
             console.log('🧪 [Email Test] emailService.sendPaymentLink disponible:', !!emailService?.sendPaymentLink);

             const emailData = {
               to: testEmail,
               userName: 'Usuario de Prueba',
               excursionName: 'Tour de Prueba - QR Tour Guide',
               date: new Date().toLocaleDateString('es-ES'),
               time: new Date().toLocaleTimeString('es-ES'),
               participants: 2,
               reservationId: `PAYMENT-TEST-${Date.now()}`,
               price: 50,
               paypalLink: 'https://paypal.me/qrtourguide/100'
             };

             let response;

             // Usar servicio híbrido primero (más confiable)
             if (hybridEmailService && typeof hybridEmailService.sendPaymentLink === 'function') {
               console.log('🧪 [Email Test] Usando hybridEmailService para pago (Resend automático)');
               const result = await hybridEmailService.sendPaymentLink(emailData);
               response = { success: result.success, provider: 'Hybrid (Resend)' };
             } else if (emailService && typeof emailService.sendPaymentLink === 'function') {
               console.log('🧪 [Email Test] Usando emailService principal para pago');
               response = await emailService.sendPaymentLink(emailData);
             } else {
               console.log('🧪 [Email Test] Usando servicio de respaldo para pago');
               response = await sendEmailDirect(emailData, 'payment_link');
             }
             
             console.log('✅ [Email Test] Respuesta del servicio de pago:', response);

             setResult({
               success: true,
               message: 'Email de link de pago enviado exitosamente',
               provider: response.provider || 'unknown'
             });

           } catch (error) {
             console.error('❌ [Email Test] Error enviando link de pago:', error);
             setResult({
               success: false,
               message: `Error enviando link de pago: ${error instanceof Error ? error.message : 'Error desconocido'}`
             });
           } finally {
             setIsLoading(false);
           }
         };

         const handleTestAdminNotification = async () => {
           if (!testEmail.trim()) {
             setResult({ success: false, message: 'Por favor, ingresa un email válido' });
             return;
           }

           setIsLoading(true);
           setResult(null);

           try {
             console.log('🧪 [Email Test] Enviando notificación de admin de prueba...');

             const emailData = {
               to: testEmail, // Email del cliente (para replyTo)
               userName: 'Cliente de Prueba',
               excursionName: 'Tour de Prueba - QR Tour Guide',
               date: new Date().toLocaleDateString('es-ES'),
               time: new Date().toLocaleTimeString('es-ES'),
               participants: 1,
               reservationId: `ADMIN-TEST-${Date.now()}`
             };

             // Usar servicio híbrido para notificación al admin
             if (hybridEmailService && typeof hybridEmailService.sendReservationNotificationToAdmin === 'function') {
               console.log('🧪 [Email Test] Enviando notificación al admin via hybridEmailService');
               const result = await hybridEmailService.sendReservationNotificationToAdmin(emailData);
               
               if (result.success) {
                 setResult({
                   success: true,
                   message: `Notificación enviada a info@qrtourguidehistory.com exitosamente. Cliente: ${testEmail}`,
                   provider: 'Admin Notification (Resend)'
                 });
               } else {
                 setResult({
                   success: false,
                   message: `Error enviando notificación al admin: ${result.error}`
                 });
               }
             } else {
               setResult({
                 success: false,
                 message: 'Servicio de notificación al admin no disponible'
               });
             }

           } catch (error) {
             console.error('❌ [Email Test] Error enviando notificación al admin:', error);
             setResult({
               success: false,
               message: `Error enviando notificación al admin: ${error instanceof Error ? error.message : 'Error desconocido'}`
             });
           } finally {
             setIsLoading(false);
           }
         };

  const handleTestEnvironmentVars = () => {
    console.log('🧪 [Email Test] Probando variables de entorno...');
    const envTest = testEnvironmentVariables();
    
    setResult({
      success: envTest.resendConfigured,
      message: envTest.resendConfigured 
        ? 'Variables de entorno configuradas correctamente' 
        : 'Variables de entorno NO configuradas correctamente',
      provider: 'Environment Variables'
    });
  };

  const handleTestResendInit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 [Email Test] Probando inicialización de Resend...');
      const resendTest = await testResendInitialization();
      
      setResult({
        success: resendTest.success,
        message: resendTest.success 
          ? 'Resend inicializado correctamente' 
          : `Error inicializando Resend: ${resendTest.error?.message}`,
        provider: 'Resend Initialization'
      });

    } catch (error) {
      console.error('❌ [Email Test] Error probando Resend:', error);
      setResult({
        success: false,
        message: `Error probando Resend: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Prueba del Sistema de Email
        </CardTitle>
               <p className="text-sm text-gray-600">
                 🔧 **SISTEMA SIMPLIFICADO**: Configurado para usar **RESEND** con variables de entorno desde .env.local.
                 <br />
                 📧 **Email al cliente**: Confirmación automática de reserva
                 <br />
                 📬 **Email al admin**: Notificación a info@qrtourguidehistory.com para manejo personal
               </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testEmail">Email de Prueba</Label>
          <Input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="tu-email@ejemplo.com"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ingresa tu email para recibir los emails de prueba
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Probar Conexión SMTP
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleTestEnvironmentVars}
              variant="outline"
              className="flex-1"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Verificar Variables Entorno
            </Button>
            <Button
              onClick={handleTestResendInit}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              Probar Resend Init
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleTestEmail}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Probar Email de Confirmación
            </Button>
            
            <Button
              onClick={handleTestPaymentLink}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Probar Link de Pago
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestAdminNotification} 
              disabled={isLoading} 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              Probar Notificación Admin
            </Button>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{result.message}</p>
                {result.provider && (
                  <p className="text-sm mt-1">
                    Proveedor: <span className="font-mono">{result.provider}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

               <div className="text-xs text-gray-500 space-y-1">
                 <p><strong>🚀 Sistema Simplificado:</strong> RESEND configurado con variables de entorno desde .env.local.</p>
                 <p><strong>📧 Email Cliente:</strong> Confirmación automática al cliente que reserva</p>
                 <p><strong>📬 Email Admin:</strong> Notificación a info@qrtourguidehistory.com para manejo personal</p>
                 <p><strong>✅ Verifica:</strong> Los logs aparecerán en la consola del navegador.</p>
                 <p><strong>🎯 Flujo:</strong> Cliente reserva → Email cliente + Email admin → Tú manejas desde tu correo</p>
               </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestComponent;

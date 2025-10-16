import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { hybridEmailService } from '../services/hybridEmailService';

const QuickEmailTest: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      setResult({ success: false, message: 'Por favor, ingresa un email válido' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 [Quick Test] Enviando email de prueba a:', testEmail);

      const emailData = {
        to: testEmail,
        userName: 'Usuario de Prueba',
        excursionName: 'Test de Email - QR Tour Guide',
        date: new Date().toLocaleDateString('es-ES'),
        time: new Date().toLocaleTimeString('es-ES'),
        participants: 1,
        reservationId: `TEST-${Date.now()}`,
        price: 25,
        paypalLink: 'https://paypal.me/test/25'
      };

      const response = await hybridEmailService.sendPaymentLink(emailData);
      
      setResult({
        success: response.success,
        message: response.success 
          ? `✅ Email enviado exitosamente a ${testEmail}. Revisa tu bandeja principal y spam.`
          : `❌ Error: ${response.error}`
      });

    } catch (error) {
      console.error('❌ [Quick Test] Error:', error);
      setResult({
        success: false,
        message: `❌ Error enviando email: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Test Rápido de Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email de prueba:</label>
          <Input
            type="email"
            placeholder="tu-email@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <Button 
          onClick={sendTestEmail} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar Email de Prueba
            </div>
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-md flex items-start gap-2 ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              {result.success && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">📋 Instrucciones (Sistema Real):</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Revisa tu bandeja principal</li>
                    <li>Revisa la carpeta de spam/correo no deseado</li>
                    <li>Busca emails de <code>noreply@qrtourguidehistory.com</code></li>
                    <li>✅ Sistema configurado con variables de entorno reales</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickEmailTest;

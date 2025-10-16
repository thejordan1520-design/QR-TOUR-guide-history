import React, { useState } from 'react';
import { unifiedReservationsService } from '../services/unifiedReservationsService';

const ReservationTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testReservation = async () => {
    setLoading(true);
    setTestResult('Probando reservación...');
    
    try {
      const testData = {
        service_id: 'test-excursion-123',
        service_name: 'Excursión de Prueba',
        service_type: 'excursion',
        full_name: 'Usuario de Prueba',
        email: 'test@example.com',
        phone: '+1234567890',
        participants: 2,
        reservation_date: new Date().toISOString().split('T')[0],
        reservation_time: '09:00',
        special_requests: 'Esta es una reservación de prueba',
        status: 'pending' as const,
        price: 50
      };

      console.log('🧪 Probando creación de reservación:', testData);
      
      const result = await unifiedReservationsService.createReservation(testData);
      
      if (result.error) {
        setTestResult(`❌ Error: ${result.error.message || 'Error desconocido'}`);
      } else {
        setTestResult(`✅ ¡Reservación creada exitosamente! ID: ${result.data?.id}`);
      }
    } catch (error: any) {
      console.error('Error en test de reservación:', error);
      setTestResult(`❌ Error crítico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        🧪 Test de Reservaciones
      </h3>
      
      <button
        onClick={testReservation}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar Reservación'}
      </button>
      
      {testResult && (
        <div className="mt-3 p-3 bg-white rounded border">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ReservationTest;


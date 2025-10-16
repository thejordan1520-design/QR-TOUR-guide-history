import React, { useState } from 'react';
import SupabaseLoginModal from '../auth/SupabaseLoginModal';
import { supabaseAuth } from '../../services/supabaseAuth';
import { unifiedReservationsService } from '../../services/unifiedReservationsService';

const SupabaseExample: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = async (userData: any) => {
    setUser(userData);
    console.log('✅ Usuario autenticado:', userData);
    
    // Ejemplo de sincronización de reservaciones
    try {
      const result = await unifiedReservationsService.createReservation({
        service_id: 'test-excursion-123',
        service_name: 'Tour Puerto Plata',
        service_type: 'excursion',
        full_name: 'Usuario de Prueba',
        email: 'test@example.com',
        phone: '+1234567890',
        participants: 2,
        reservation_date: '2024-01-15',
        reservation_time: '09:00',
        price: 150
      });
      
      if (result.data) {
        console.log('✅ Reservación creada:', result.data);
      }
    } catch (error) {
      console.error('Error creando reservación:', error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabaseAuth.signOut();
      setUser(null);
      setReservations([]);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    setLoading(true);
    try {
      const result = await supabaseSync.getUserReservations();
      if (result.success) {
        setReservations(result.reservations || []);
      }
    } catch (error) {
      console.error('Error cargando reservaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Ejemplo de Integración Supabase</h1>
      
      {!user ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Iniciar Sesión con Supabase</h2>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Abrir Modal de Login
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">✅ Usuario Autenticado</h2>
          <div className="mb-4">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            {user.user_metadata?.full_name && (
              <p><strong>Nombre:</strong> {user.user_metadata.full_name}</p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={loadReservations}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Cargar Reservaciones'}
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {reservations.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Reservaciones del Usuario</h3>
          <div className="space-y-3">
            {reservations.map((reservation, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <p><strong>Servicio:</strong> {reservation.service_name}</p>
                <p><strong>Fecha:</strong> {reservation.reservation_date}</p>
                <p><strong>Estado:</strong> {reservation.status}</p>
                <p><strong>Precio:</strong> ${reservation.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📚 Instrucciones de Uso</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Configura las variables de entorno en <code>.env</code></li>
          <li>Configura OAuth en Supabase Dashboard</li>
          <li>Configura Google/Microsoft OAuth en sus respectivas consolas</li>
          <li>Ejecuta las políticas RLS en Supabase SQL Editor</li>
          <li>Integra el modal en tu aplicación</li>
          <li>Usa los servicios de sincronización para reservaciones</li>
        </ol>
      </div>

      <SupabaseLoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default SupabaseExample;

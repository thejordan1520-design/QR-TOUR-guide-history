import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabaseAuth } from '../../services/supabaseAuth';

const SupabaseAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 SupabaseAuthCallback - Procesando callback...');
        
        // Obtener la sesión actual después de la redirección
        const { data: { session }, error } = await supabaseAuth.getCurrentUser();
        
        if (error) {
          console.error('Error en callback:', error);
          setStatus('error');
          setMessage('Error en la autenticación. Por favor intenta de nuevo.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        if (session?.user) {
          console.log('✅ Usuario autenticado:', session.user);
          
          // Crear/actualizar perfil en Supabase
          const profileResult = await supabaseAuth.upsertProfile(session.user);
          if (profileResult.success) {
            console.log('✅ Perfil creado/actualizado:', profileResult.profile);
          }

          // Intentar vincular con usuario existente de SQLite
          await supabaseAuth.linkExistingUser(session.user.email!, session.user.id);
          
          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          
          // Redirigir a la página principal
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No se pudo obtener la información del usuario.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error en handleAuthCallback:', error);
        setStatus('error');
        setMessage('Error interno del servidor.');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando autenticación...
            </h2>
            <p className="text-gray-600">
              Estamos verificando tu cuenta. Por favor espera un momento.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Autenticación exitosa!
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error de autenticación
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SupabaseAuthCallback;

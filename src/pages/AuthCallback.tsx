import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabasePublic } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Evitar procesamiento múltiple
    if (isProcessing) return;
    
    const handleCallback = async () => {
      setIsProcessing(true);
      console.log('🔍 AuthCallback - Iniciando procesamiento...');
      console.log('🔍 URL completa:', window.location.href);

      // Verificar si hay parámetros de error en la URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('❌ Error en callback OAuth:', error, errorDescription);
        setStatus('error');
        setMessage(`Error: ${errorDescription || error}`);
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      // Procesar el código de autorización manualmente
      const code = searchParams.get('code');
      console.log('🔍 Código de autorización encontrado:', code ? 'Sí' : 'No');
      
      if (code) {
        console.log('⏳ Intercambiando código por tokens...');
        setMessage('Intercambiando código por tokens...');
        
        try {
          const { data, error } = await supabasePublic.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('❌ Error intercambiando código:', error);
            setStatus('error');
            setMessage(`Error: ${error.message}`);
            setTimeout(() => navigate('/', { replace: true }), 3000);
            return;
          }
          
          if (data.session) {
            console.log('✅ ¡Sesión creada exitosamente!', data.session.user.email);
            setStatus('success');
            setMessage('¡Autenticación exitosa! Redirigiendo...');
            
            // Verificar/crear usuario en la base de datos
            try {
              const { error: checkError } = await supabasePublic
                .from('users')
                .select('id')
                .eq('email', data.session.user.email)
                .single();
              
              if (checkError && checkError.code === 'PGRST116') {
                console.log('📝 Creando perfil de usuario...');
                await supabasePublic.from('users').insert({
                  email: data.session.user.email,
                  supabase_user_id: data.session.user.id,
                  plan_type: 'free',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            } catch (dbError) {
              console.warn('⚠️ Error con base de datos (no crítico):', dbError);
            }
            
            // Esperar un poco antes de redirigir
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('🔄 Redirigiendo al home...');
            navigate('/', { replace: true });
            return;
          }
        } catch (err) {
          console.error('❌ Error procesando código:', err);
          setStatus('error');
          setMessage('Error al procesar la autenticación.');
          setTimeout(() => navigate('/', { replace: true }), 3000);
          return;
        }
      }
      
      // Si no hay código, esperar a que Supabase procese automáticamente
      console.log('⏳ Esperando que Supabase procese la autenticación automáticamente...');
      setMessage('Completando tu autenticación...');
      
      // Dar tiempo a Supabase para procesar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let attempts = 0;
      const maxAttempts = 15; // 15 intentos = ~7.5 segundos
      
      const checkSession = async () => {
        attempts++;
        console.log(`🔄 Verificando sesión (${attempts}/${maxAttempts})...`);
        
        try {
          const { data: { session }, error: sessionError } = await supabasePublic.auth.getSession();
          
          console.log(`📊 Estado de sesión:`, { 
            hasSession: !!session,
            hasUser: !!session?.user,
            email: session?.user?.email,
            error: sessionError 
          });
          
          if (session && session.user) {
            console.log('✅ ¡Sesión autenticada!', session.user.email);
            setStatus('success');
            setMessage('¡Autenticación exitosa! Redirigiendo...');
            
            // Verificar/crear usuario en la base de datos
            try {
              const { error: checkError } = await supabasePublic
                .from('users')
                .select('id')
                .eq('email', session.user.email)
                .single();
              
              if (checkError && checkError.code === 'PGRST116') {
                console.log('📝 Creando perfil de usuario...');
                await supabasePublic.from('users').insert({
                  email: session.user.email,
                  supabase_user_id: session.user.id,
                  plan_type: 'free',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            } catch (dbError) {
              console.warn('⚠️ Error con base de datos (no crítico):', dbError);
            }
            
            // Esperar un poco más antes de redirigir para asegurar persistencia
            await new Promise(resolve => setTimeout(resolve, 800));
            
            console.log('🔄 Redirigiendo al home...');
            // Usar navigate para mantener el estado de React en lugar de recargar toda la página
            navigate('/', { replace: true });
            return;
          }
          
          // Continuar intentando
          if (attempts < maxAttempts) {
            setTimeout(checkSession, 500);
          } else {
            console.error('❌ No se encontró sesión después de varios intentos');
            setStatus('error');
            setMessage('No se pudo completar la autenticación. Redirigiendo...');
            setTimeout(() => navigate('/', { replace: true }), 3000);
          }
        } catch (err) {
          console.error('❌ Error verificando sesión:', err);
          if (attempts < maxAttempts) {
            setTimeout(checkSession, 500);
          } else {
            setStatus('error');
            setMessage('Error al procesar la autenticación.');
            setTimeout(() => navigate('/', { replace: true }), 3000);
          }
        }
      };
      
      // Iniciar verificación
      checkSession();
    };

    handleCallback();
  }, []); // Ejecutar solo una vez al montar

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-8 h-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Loader className="w-8 h-8 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-lg shadow-lg border-2 ${getStatusColor()} p-8 text-center`}>
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' && 'Procesando autenticación...'}
          {status === 'success' && '¡Autenticación exitosa!'}
          {status === 'error' && 'Error en la autenticación'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message || 'Por favor espera mientras procesamos tu autenticación...'}
        </p>
        
        {status === 'loading' && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
            <p className="text-sm text-gray-500">Esto puede tomar unos segundos...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Redirigiendo automáticamente...</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Ir al inicio ahora
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Redirigiendo automáticamente...</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Ir al inicio ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
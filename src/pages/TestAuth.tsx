import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuth: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🔍 TestAuth - Estado actual:');
    console.log('- User:', user ? user.email : 'No user');
    console.log('- Loading:', loading);
    console.log('- URL:', window.location.href);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Estado de Autenticación</h1>
        
        {user ? (
          <div>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <p className="text-lg font-semibold text-green-600">¡Autenticado!</p>
            <p className="text-gray-600 mt-2">Email: {user.email}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ir al Inicio
            </button>
          </div>
        ) : (
          <div>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <p className="text-lg font-semibold text-red-600">No Autenticado</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Ir al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuth;

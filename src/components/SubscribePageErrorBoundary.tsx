import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface SubscribePageErrorBoundaryProps {
  error?: Error;
  resetError?: () => void;
}

const SubscribePageErrorBoundary: React.FC<SubscribePageErrorBoundaryProps> = ({ 
  error, 
  resetError 
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          {/* Error Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h2>
          
          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            Ha ocurrido un error inesperado al cargar los planes de suscripción. 
            Por favor, intenta de nuevo.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Detalles del error (solo en desarrollo)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 font-mono">
                {error.message}
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-sm text-gray-500">
            <p>Si el problema persiste, contacta a soporte técnico.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribePageErrorBoundary;


// Banner que muestra el estado de salud de la conexión del admin
import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAdminHealthCheck } from '../../hooks/useAdminHealthCheck';

export const AdminHealthBanner: React.FC = () => {
  const { healthStatus, attemptRecovery, isHealthy } = useAdminHealthCheck(30000); // Check cada 30 segundos

  // No mostrar nada si todo está bien
  if (isHealthy && healthStatus.consecutiveFailures === 0) {
    return null;
  }

  // Mostrar warning si hay 1 fallo
  if (healthStatus.consecutiveFailures === 1) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
          <div className="flex-1">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Advertencia:</span> Se detectó un problema de conexión. Reintentando automáticamente...
            </p>
          </div>
          <Wifi className="h-5 w-5 text-yellow-400 animate-pulse" />
        </div>
      </div>
    );
  }

  // Mostrar error crítico si hay 2+ fallos
  if (!isHealthy || healthStatus.consecutiveFailures >= 2) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex items-center">
          <WifiOff className="h-5 w-5 text-red-400 mr-3" />
          <div className="flex-1">
            <p className="text-sm text-red-700">
              <span className="font-medium">Error de conexión:</span> No se puede conectar con Supabase. {healthStatus.error}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Último check: {healthStatus.lastCheck?.toLocaleTimeString() || 'Nunca'} | 
              Fallos consecutivos: {healthStatus.consecutiveFailures}
            </p>
          </div>
          <button
            onClick={attemptRecovery}
            className="ml-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  return null;
};





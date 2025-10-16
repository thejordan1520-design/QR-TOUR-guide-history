import React from 'react'
import { useUserAccess } from '../../hooks/useUserAccess'

interface UserAccessStatusProps {
  className?: string
  showDetails?: boolean
}

export const UserAccessStatus: React.FC<UserAccessStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { hasAudioAccess, userInfo, isLoading, error } = useUserAccess()

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600">Verificando acceso...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm text-red-600">Error verificando acceso</span>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        <span className="text-sm text-gray-600">No autenticado</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Indicador de estado */}
      <div className={`w-3 h-3 rounded-full ${
        hasAudioAccess ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      {/* Texto de estado */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${
          hasAudioAccess ? 'text-green-700' : 'text-red-700'
        }`}>
          {hasAudioAccess ? '🎵 Acceso Premium' : '🔒 Plan Gratuito'}
        </span>
        
        {showDetails && (
          <div className="text-xs text-gray-500">
            <div>Plan: {userInfo.planType}</div>
            {userInfo.expiresAt && (
              <div>Expira: {new Date(userInfo.expiresAt).toLocaleDateString()}</div>
            )}
            <div>Estado: {userInfo.isActive ? 'Activo' : 'Inactivo'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserAccessStatus

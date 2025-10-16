import React from 'react'
import { useUserAccess } from '../../hooks/useUserAccess'

interface AudioAccessControlProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

export const AudioAccessControl: React.FC<AudioAccessControlProps> = ({
  children,
  fallback,
  showUpgradePrompt = true,
  className = ''
}) => {
  const { hasAudioAccess, userInfo, isLoading } = useUserAccess()

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Verificando acceso...</span>
      </div>
    )
  }

  // Si tiene acceso, mostrar el contenido
  if (hasAudioAccess) {
    return <>{children}</>
  }

  // Si no tiene acceso, mostrar fallback o prompt de upgrade
  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          {/* Icono */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Título */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🔒 Acceso Restringido
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Los audios están disponibles solo para usuarios Premium
            </p>
          </div>
          
          {/* Información del plan actual */}
          {userInfo && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-sm text-gray-700">
                <div className="font-medium">Plan actual: {userInfo.planType}</div>
                {userInfo.expiresAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Expira: {new Date(userInfo.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Botón de upgrade */}
          <button
            onClick={() => {
              // Redirigir a página de suscripciones
              window.location.href = '/subscribe'
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            🎵 Actualizar a Premium
          </button>
          
          {/* Beneficios */}
          <div className="text-xs text-gray-500 max-w-sm">
            <p>Con Premium obtienes:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Acceso completo a todos los audios</li>
              <li>Descarga offline</li>
              <li>Calidad de audio premium</li>
              <li>Soporte prioritario</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Si no se debe mostrar prompt, no mostrar nada
  return null
}

export default AudioAccessControl

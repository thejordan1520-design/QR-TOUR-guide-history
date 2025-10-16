import React, { useState, useEffect } from 'react'
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { passwordService, PasswordChangeResult } from '../../services/passwordService'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PasswordChangeResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setResult(null)
      setValidationErrors([])
      
      // Verificar si es usuario OAuth
      checkUserType()
    }
  }, [isOpen])

  const checkUserType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const provider = user.app_metadata?.provider || 'email'
        setIsOAuthUser(provider !== 'email')
      }
    } catch (error) {
      console.error('Error checking user type:', error)
    }
  }

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (formData.newPassword) {
      const validation = passwordService.validatePassword(formData.newPassword)
      setValidationErrors(validation.errors)
    } else {
      setValidationErrors([])
    }
  }, [formData.newPassword])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Validaciones básicas
      if (!isOAuthUser && !formData.currentPassword) {
        setResult({
          success: false,
          message: 'La contraseña actual es requerida'
        })
        return
      }

      if (!formData.newPassword) {
        setResult({
          success: false,
          message: 'La nueva contraseña es requerida'
        })
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setResult({
          success: false,
          message: 'Las contraseñas no coinciden'
        })
        return
      }

      if (!isOAuthUser && formData.currentPassword === formData.newPassword) {
        setResult({
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual'
        })
        return
      }

      // Validar fortaleza de contraseña
      const validation = passwordService.validatePassword(formData.newPassword)
      if (!validation.isValid) {
        setResult({
          success: false,
          message: 'La contraseña no cumple con los requisitos de seguridad',
          error: validation.errors.join(', ')
        })
        return
      }

      // Cambiar contraseña
      const changeResult = await passwordService.changePassword(
        formData.currentPassword,
        formData.newPassword
      )

      setResult(changeResult)

      if (changeResult.success) {
        // Limpiar formulario y cerrar modal después de un breve delay
        setTimeout(() => {
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
          onSuccess?.()
          onClose()
        }, 2000)
      }

    } catch (error) {
      setResult({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setResult(null)
      setValidationErrors([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isOAuthUser ? 'Establecer Contraseña' : 'Cambiar Contraseña'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contraseña actual - solo para usuarios email/password */}
          {!isOAuthUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder={t('forms.placeholders.current_password')}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Información para usuarios OAuth */}
          {isOAuthUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Establecer Contraseña
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Como usuario de Google, puedes establecer una contraseña adicional para acceder con email y contraseña.
              </p>
            </div>
          )}

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                  validationErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('forms.placeholders.new_password')}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Validación de contraseña */}
            {formData.newPassword && (
              <div className="mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                ))}
                {validationErrors.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Contraseña válida
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                  formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder={t('forms.placeholders.confirm_password')}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Validación de confirmación */}
            {formData.confirmPassword && (
              <div className="mt-2">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Las contraseñas coinciden
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Las contraseñas no coinciden
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resultado */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </span>
              </div>
              {result.error && (
                <p className="text-xs text-red-600 mt-1">{result.error}</p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || validationErrors.length > 0 || formData.newPassword !== formData.confirmPassword}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isOAuthUser ? 'Estableciendo...' : 'Cambiando...'}
                </div>
              ) : (
                isOAuthUser ? 'Establecer Contraseña' : 'Cambiar Contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordChangeModal

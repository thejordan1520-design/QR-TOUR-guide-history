import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
  } | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (formData.password) {
      const errors: string[] = []
      
      if (formData.password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres')
      }
      if (!/[A-Z]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula')
      }
      if (!/[a-z]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula')
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos un número')
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos un carácter especial')
      }
      
      setValidationErrors(errors)
    } else {
      setValidationErrors([])
    }
  }, [formData.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
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
      if (!formData.password) {
        setResult({
          success: false,
          message: 'La contraseña es requerida'
        })
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setResult({
          success: false,
          message: 'Las contraseñas no coinciden'
        })
        return
      }

      if (validationErrors.length > 0) {
        setResult({
          success: false,
          message: 'La contraseña no cumple con los requisitos de seguridad',
          error: validationErrors.join(', ')
        })
        return
      }

      // Actualizar contraseña usando Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        setResult({
          success: false,
          message: 'Error al actualizar la contraseña',
          error: error.message
        })
      } else {
        setResult({
          success: true,
          message: 'Contraseña actualizada exitosamente. Redirigiendo...'
        })
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/profile/settings')
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-gray-600">
            Ingresa tu nueva contraseña para completar el proceso
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.password ? 'text' : 'password'}
                name="password"
                value={formData.password}
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
                onClick={() => togglePasswordVisibility('password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPasswords.password ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Validación de contraseña */}
            {formData.password && (
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
                  formData.confirmPassword && formData.password !== formData.confirmPassword
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
                {formData.password === formData.confirmPassword ? (
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

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading || validationErrors.length > 0 || formData.password !== formData.confirmPassword}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Actualizando...
              </div>
            ) : (
              'Actualizar Contraseña'
            )}
          </button>
        </form>

        {/* Enlace de regreso */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/profile/settings')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Volver a configuración
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage

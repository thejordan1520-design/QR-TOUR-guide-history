import { supabase } from '../lib/supabase'

export interface PasswordChangeResult {
  success: boolean
  message: string
  error?: string
}

export interface PasswordResetResult {
  success: boolean
  message: string
  error?: string
}

export class PasswordService {
  /**
   * Cambiar contraseña para usuarios con email/password
   * @param currentPassword - Contraseña actual (opcional para usuarios OAuth)
   * @param newPassword - Nueva contraseña
   * @returns Promise<PasswordChangeResult>
   */
  static async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<PasswordChangeResult> {
    try {
      // Verificar que el usuario esté autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return {
          success: false,
          message: 'Usuario no autenticado',
          error: userError?.message
        }
      }

      const provider = user.app_metadata?.provider || 'email'

      // Para usuarios OAuth, no requerir contraseña actual
      if (provider !== 'email' && currentPassword) {
        // Si es usuario OAuth pero proporcionó contraseña actual, verificar
        // (esto es opcional, podríamos saltarnos la verificación)
        console.log('Usuario OAuth intentando cambiar contraseña con contraseña actual')
      }

      // Actualizar contraseña usando Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        return {
          success: false,
          message: 'Error al cambiar la contraseña',
          error: updateError.message
        }
      }

      return {
        success: true,
        message: provider === 'email' 
          ? 'Contraseña cambiada exitosamente'
          : 'Contraseña establecida exitosamente'
      }

    } catch (error) {
      console.error('Error changing password:', error)
      return {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Enviar email de reset de contraseña
   * @param email - Email del usuario
   * @returns Promise<PasswordResetResult>
   */
  static async sendPasswordReset(email: string): Promise<PasswordResetResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return {
          success: false,
          message: 'Error al enviar email de reset',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Email de reset enviado. Revisa tu bandeja de entrada.'
      }

    } catch (error) {
      console.error('Error sending password reset:', error)
      return {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Verificar si el usuario puede cambiar contraseña
   * @returns Promise<boolean>
   */
  static async canChangePassword(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return false
      }

      // Usuarios con provider email siempre pueden cambiar contraseña
      if (user.app_metadata?.provider === 'email') {
        return true
      }

      // Usuarios OAuth también pueden cambiar contraseña si tienen una establecida
      // o si queremos permitirles establecer una
      return true // Permitir a todos los usuarios cambiar/establecer contraseña
    } catch (error) {
      console.error('Error checking password change capability:', error)
      return false
    }
  }

  /**
   * Obtener información del proveedor de autenticación
   * @returns Promise<{ provider: string; canChangePassword: boolean; externalUrl?: string }>
   */
  static async getAuthProviderInfo(): Promise<{
    provider: string
    canChangePassword: boolean
    externalUrl?: string
  }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return {
          provider: 'unknown',
          canChangePassword: false
        }
      }

      const provider = user.app_metadata?.provider || 'email'
      const canChangePassword = await this.canChangePassword()

      let externalUrl: string | undefined
      if (provider === 'google') {
        externalUrl = 'https://myaccount.google.com/security'
      } else if (provider === 'azure') {
        externalUrl = 'https://account.microsoft.com/security'
      }

      return {
        provider,
        canChangePassword,
        externalUrl
      }

    } catch (error) {
      console.error('Error getting auth provider info:', error)
      return {
        provider: 'unknown',
        canChangePassword: false
      }
    }
  }

  /**
   * Validar fortaleza de contraseña
   * @param password - Contraseña a validar
   * @returns { isValid: boolean; errors: string[] }
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Exportar instancia para uso directo
export const passwordService = PasswordService

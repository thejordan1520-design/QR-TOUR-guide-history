import { supabase } from '../lib/supabase'

export interface UserAccessInfo {
  email: string
  planType: 'free' | 'premium'
  hasAudioAccess: boolean
  expiresAt?: string
  isActive: boolean
}

export class UserAccessService {
  /**
   * Verificar si un usuario tiene acceso a audios
   * @param userEmail - Email del usuario
   * @returns Promise<boolean> - true si tiene acceso, false si no
   */
  static async hasAudioAccess(userEmail: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('plan_type, plan_expires_at, is_active')
        .eq('email', userEmail)
        .single()

      if (error || !user) {
        console.warn(`Usuario no encontrado: ${userEmail}`)
        return false
      }

      // Verificar si el usuario está activo
      if (!user.is_active) {
        return false
      }

      // Verificar si tiene plan premium y no está expirado
      if (user.plan_type === 'premium') {
        if (user.plan_expires_at) {
          const expirationDate = new Date(user.plan_expires_at)
          const now = new Date()
          return expirationDate > now
        }
        // Si es premium pero no tiene fecha de expiración, asumir que es ilimitado
        return true
      }

      // Si es free, no tiene acceso a audios
      return false
    } catch (error) {
      console.error('Error verificando acceso a audios:', error)
      return false
    }
  }

  /**
   * Obtener información completa de acceso del usuario
   * @param userEmail - Email del usuario
   * @returns Promise<UserAccessInfo | null>
   */
  static async getUserAccessInfo(userEmail: string): Promise<UserAccessInfo | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('email, plan_type, plan_expires_at, is_active')
        .eq('email', userEmail)
        .single()

      if (error || !user) {
        console.warn(`Usuario no encontrado: ${userEmail}`)
        return null
      }

      const hasAudioAccess = await this.hasAudioAccess(userEmail)

      return {
        email: user.email,
        planType: user.plan_type as 'free' | 'premium',
        hasAudioAccess,
        expiresAt: user.plan_expires_at,
        isActive: user.is_active
      }
    } catch (error) {
      console.error('Error obteniendo información de acceso:', error)
      return null
    }
  }

  /**
   * Verificar acceso para el usuario actual autenticado
   * @returns Promise<boolean>
   */
  static async hasCurrentUserAudioAccess(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user?.email) {
        return false
      }

      return await this.hasAudioAccess(user.email)
    } catch (error) {
      console.error('Error verificando acceso del usuario actual:', error)
      return false
    }
  }

  /**
   * Obtener información de acceso del usuario actual
   * @returns Promise<UserAccessInfo | null>
   */
  static async getCurrentUserAccessInfo(): Promise<UserAccessInfo | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user?.email) {
        return null
      }

      return await this.getUserAccessInfo(user.email)
    } catch (error) {
      console.error('Error obteniendo información del usuario actual:', error)
      return null
    }
  }

  /**
   * Actualizar plan de usuario (solo para administradores)
   * @param userEmail - Email del usuario
   * @param planType - Tipo de plan ('free' | 'premium')
   * @param expiresAt - Fecha de expiración (opcional)
   * @returns Promise<boolean>
   */
  static async updateUserPlan(
    userEmail: string, 
    planType: 'free' | 'premium', 
    expiresAt?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        plan_type: planType,
        updated_at: new Date().toISOString()
      }

      if (expiresAt) {
        updateData.plan_expires_at = expiresAt
      } else if (planType === 'free') {
        updateData.plan_expires_at = null
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', userEmail)

      if (error) {
        console.error('Error actualizando plan de usuario:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error actualizando plan de usuario:', error)
      return false
    }
  }

  /**
   * Obtener todos los usuarios con sus planes
   * @returns Promise<UserAccessInfo[]>
   */
  static async getAllUsersWithPlans(): Promise<UserAccessInfo[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('email, plan_type, plan_expires_at, is_active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error obteniendo usuarios:', error)
        return []
      }

      const usersWithAccess = await Promise.all(
        users.map(async (user) => {
          const hasAudioAccess = await this.hasAudioAccess(user.email)
          return {
            email: user.email,
            planType: user.plan_type as 'free' | 'premium',
            hasAudioAccess,
            expiresAt: user.plan_expires_at,
            isActive: user.is_active
          }
        })
      )

      return usersWithAccess
    } catch (error) {
      console.error('Error obteniendo usuarios con planes:', error)
      return []
    }
  }
}

// Exportar instancia para uso directo
export const userAccessService = UserAccessService

import { supabase } from '../lib/supabase'
import type { SupabaseUser, SupabaseProfile } from '../lib/supabase'
import { API_CONFIG } from '../config/api'

class SupabaseAuthService {
  private currentUser: SupabaseUser | null = null

  // Obtener usuario actual
  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting current user:', error)
        return null
      }
      this.currentUser = user
      return user
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      return null
    }
  }

  // Login con Google
  async signInWithGoogle(): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        console.error('Google sign in error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Login con Microsoft
  async signInWithMicrosoft(): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
          scopes: 'email profile'
        }
      })

      if (error) {
        console.error('Microsoft sign in error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in signInWithMicrosoft:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Login con Email/Password
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Email sign in error:', error)
        return { success: false, error: error.message }
      }

      this.currentUser = data.user
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Error in signInWithEmail:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Registro con Email/Password
  async signUpWithEmail(email: string, password: string, fullName?: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        console.error('Email sign up error:', error)
        return { success: false, error: error.message }
      }

      this.currentUser = data.user
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Error in signUpWithEmail:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Logout
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        return { success: false, error: error.message }
      }

      this.currentUser = null
      return { success: true }
    } catch (error) {
      console.error('Error in signOut:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Crear o actualizar perfil en Supabase
  async upsertProfile(user: SupabaseUser): Promise<{ success: boolean; profile?: SupabaseProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting profile:', error)
        return { success: false, error: error.message }
      }

      return { success: true, profile: data }
    } catch (error) {
      console.error('Error in upsertProfile:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Vincular usuario existente de SQLite con Supabase
  async linkExistingUser(email: string, supabaseUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Aquí puedes hacer una llamada a tu backend SQLite para vincular
      const response = await fetch('${API_CONFIG.EXPRESS_API.baseUrl}/api/auth/link-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          supabase_user_id: supabaseUserId
        })
      })

      if (!response.ok) {
        throw new Error('Error linking user')
      }

      return { success: true }
    } catch (error) {
      console.error('Error in linkExistingUser:', error)
      return { success: false, error: 'Error vinculando usuario' }
    }
  }

  // Obtener token de acceso
  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        return null
      }
      return session.access_token
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }
}

// Instancia singleton
export const supabaseAuth = new SupabaseAuthService()

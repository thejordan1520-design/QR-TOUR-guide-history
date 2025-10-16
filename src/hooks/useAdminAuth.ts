import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin, clearSupabaseSessions } from '../lib/supabase';
import { refreshSupabaseSession, checkSupabaseConnection, handleJWTError } from '../utils/supabaseAuth';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Iniciando sesión como admin...');
      
      // Limpiar sesiones públicas antes del login admin
      clearSupabaseSessions();

      const { data, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('❌ Error de login:', loginError);
        setError(loginError.message);
        return false;
      }

      console.log('✅ Login admin exitoso');
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('❌ Error general de login:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Cerrando sesión de admin...');
      await supabaseAdmin.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Limpiar también sesiones públicas al hacer logout admin
      clearSupabaseSessions();
      
      // Redirigir al login del admin después del logout
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('❌ Error cerrando sesión:', err);
      // Aún así redirigir al login en caso de error
      window.location.href = '/admin/login';
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Verificando autenticación...');

      // Obtener sesión actual directamente
      const { data: { session }, error: sessionError } = await supabaseAdmin.auth.getSession();

      if (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError);
        setError(sessionError.message);
        setIsAuthenticated(false);
        return;
      }

      if (session && session.user) {
        console.log('✅ Usuario autenticado:', session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        console.log('⚠️ No hay sesión activa');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('❌ Error verificando autenticación:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refrescando sesión...');
      const refreshed = await refreshSupabaseSession();
      if (refreshed) {
        await checkAuth();
      }
      return refreshed;
    } catch (err) {
      console.error('❌ Error refrescando sesión:', err);
      return false;
    }
  }, [checkAuth]);

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de estado de autenticación:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('✅ Token refrescado automáticamente');
          setUser(session.user);
          setIsAuthenticated(true);
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    user,
    login,
    logout,
    checkAuth,
    refreshSession
  };
};


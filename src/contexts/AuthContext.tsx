// CONTEXTO DE AUTENTICACIÓN ÚNICO Y SIMPLE
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabasePublic } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  email: string;
  is_admin: boolean;
  display_name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Convertir usuario de Supabase - VERSIÓN SIMPLIFICADA
  const convertUser = async (supabaseUser: User): Promise<AppUser> => {
    // Por ahora, crear usuario básico sin consultar tabla users
    // TODO: Implementar consulta a tabla users cuando esté disponible
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      is_admin: supabaseUser.email === 'jordandn15@outlook.com', // Admin temporal
      display_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuario'
    };
  };

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabasePublic.auth.getSession();
        
        if (session?.user) {
          const appUser = await convertUser(session.user);
          setUser(appUser);
          setSession(session);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const appUser = await convertUser(session.user);
        setUser(appUser);
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabasePublic.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error desconocido' };
    }
  };

  const signOut = async () => {
    try {
      await supabasePublic.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

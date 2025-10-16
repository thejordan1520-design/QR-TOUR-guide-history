import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { useRealtimeSync } from './useRealtimeSync';

// Interface basada en la estructura real de Supabase
export interface AdminUser {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bio: string;
  member_since: string;
  notifications_enabled: boolean;
  accessibility_settings: string;
  language_preference: string;
  offline_mode_enabled: boolean;
  created_at: string;
  updated_at: string;
  role: string;
  is_active: boolean;
  plan_type: string;
  plan_expires_at: string;
  total_spent: number;
  gamification_points: number;
  is_admin: boolean;
  auth_id: string;
  last_sign_in_at: string;
  is_verified: boolean;
  display_order: number;
}

export interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (userData: Partial<AdminUser>) => Promise<{ success: boolean; error?: string; user?: AdminUser }>;
  updateUser: (id: string, userData: Partial<AdminUser>) => Promise<{ success: boolean; error?: string; user?: AdminUser }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (id: string, role: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPlan: (id: string, planType: string, expiresAt?: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { syncTrigger } = useRealtimeSync();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading users from Supabase...');
      
      const { data, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error loading users:', fetchError);
        setError(fetchError.message);
        return;
      }

      setUsers(data || []);
      console.log(`✅ Loaded ${data?.length || 0} users from database`);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar usuarios inicialmente
  useEffect(() => {
    loadUsers();
  }, []);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (syncTrigger > 0) {
      console.log('🔄 useAdminUsers: Cambio detectado, recargando usuarios...');
      loadUsers();
    }
  }, [syncTrigger, loadUsers]);

  // Crear nuevo usuario
  const createUser = useCallback(async (userData: Partial<AdminUser>): Promise<{ success: boolean; error?: string; user?: AdminUser }> => {
    try {
      console.log('➕ Creating new user:', userData);
      
      const newUser = {
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_since: new Date().toISOString(),
        is_active: true,
        notifications_enabled: true,
        offline_mode_enabled: false,
        total_spent: 0,
        gamification_points: 0,
        is_admin: false,
        is_verified: false,
        display_order: 0,
        role: userData.role || 'user',
        plan_type: userData.plan_type || 'free',
        language_preference: userData.language_preference || 'es',
        accessibility_settings: userData.accessibility_settings || '{}',
        // Generar user_id si no se proporciona
        user_id: userData.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const { data, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return { success: false, error: insertError.message };
      }

      console.log('✅ User created successfully:', data);
      
      // Actualizar lista local
      setUsers(prev => [data, ...prev]);
      
      return { success: true, user: data };
    } catch (err) {
      console.error('Error creating user:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  // Actualizar usuario
  const updateUser = useCallback(async (id: string, userData: Partial<AdminUser>): Promise<{ success: boolean; error?: string; user?: AdminUser }> => {
    try {
      console.log('✏️ Updating user:', id, userData);
      
      const updateData = {
        ...userData,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ User updated successfully:', data);
      
      // Actualizar lista local
      setUsers(prev => prev.map(user => user.id === id ? data : user));
      
      return { success: true, user: data };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  // Eliminar usuario
  const deleteUser = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🗑️ Deleting user:', id);
      
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return { success: false, error: deleteError.message };
      }

      console.log('✅ User deleted successfully');
      
      // Actualizar lista local
      setUsers(prev => prev.filter(user => user.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  // Toggle status del usuario (activo/inactivo)
  const toggleUserStatus = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const newStatus = !user.is_active;
      console.log(`🔄 Toggling user status: ${user.display_name} -> ${newStatus ? 'active' : 'inactive'}`);

      return await updateUser(id, { is_active: newStatus });
    } catch (err) {
      console.error('Error toggling user status:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [users, updateUser]);

  // Actualizar rol del usuario
  const updateUserRole = useCallback(async (id: string, role: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`👑 Updating user role: ${id} -> ${role}`);
      return await updateUser(id, { role });
    } catch (err) {
      console.error('Error updating user role:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [updateUser]);

  // Actualizar plan del usuario
  const updateUserPlan = useCallback(async (id: string, planType: string, expiresAt?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`💳 Updating user plan: ${id} -> ${planType}`);
      const updateData: Partial<AdminUser> = { plan_type: planType };
      
      if (expiresAt) {
        updateData.plan_expires_at = expiresAt;
      }
      
      return await updateUser(id, updateData);
    } catch (err) {
      console.error('Error updating user plan:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [updateUser]);

  return {
    users,
    loading,
    error,
    refetch: loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRole,
    updateUserPlan
  };
};

// Hook base para todas las secciones del admin - Evita errores de formularios y RLS
import { useState, useCallback } from 'react';
import { supabaseAdmin } from '../lib/supabase';

export interface AdminBaseConfig {
  tableName: string;
  primaryKey: string;
  defaultValues: Record<string, any>;
}

export const useAdminBase = (config: AdminBaseConfig) => {
  const [isLoading, setIsLoading] = useState(false);

  // Función genérica para crear registros
  const createRecord = useCallback(async (data: Record<string, any>): Promise<{ success: boolean; error?: string; record?: any }> => {
    try {
      setIsLoading(true);
      console.log(`➕ Creating new ${config.tableName}:`, data);
      
      const newRecord = {
        ...config.defaultValues,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabaseAdmin
        .from(config.tableName)
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        console.error(`Error creating ${config.tableName}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${config.tableName} created successfully:`, result);
      return { success: true, record: result };
    } catch (err) {
      console.error(`Error creating ${config.tableName}:`, err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Función genérica para actualizar registros
  const updateRecord = useCallback(async (id: string, data: Record<string, any>): Promise<{ success: boolean; error?: string; record?: any }> => {
    try {
      setIsLoading(true);
      console.log(`✏️ Updating ${config.tableName}:`, id, data);
      
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabaseAdmin
        .from(config.tableName)
        .update(updateData)
        .eq(config.primaryKey, id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${config.tableName}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${config.tableName} updated successfully:`, result);
      return { success: true, record: result };
    } catch (err) {
      console.error(`Error updating ${config.tableName}:`, err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Función genérica para eliminar registros
  const deleteRecord = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log(`🗑️ Deleting ${config.tableName}:`, id);
      
      const { error } = await supabaseAdmin
        .from(config.tableName)
        .delete()
        .eq(config.primaryKey, id);

      if (error) {
        console.error(`Error deleting ${config.tableName}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${config.tableName} deleted successfully`);
      return { success: true };
    } catch (err) {
      console.error(`Error deleting ${config.tableName}:`, err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Función genérica para obtener registros
  const fetchRecords = useCallback(async (): Promise<{ success: boolean; error?: string; records?: any[] }> => {
    try {
      setIsLoading(true);
      console.log(`🔍 Fetching ${config.tableName}...`);
      
      const { data, error } = await supabaseAdmin
        .from(config.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${config.tableName}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Fetched ${data?.length || 0} ${config.tableName} records`);
      return { success: true, records: data || [] };
    } catch (err) {
      console.error(`Error fetching ${config.tableName}:`, err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return {
    isLoading,
    createRecord,
    updateRecord,
    deleteRecord,
    fetchRecords
  };
};

// Helper para crear configuración de tabla
export const createTableConfig = (tableName: string, primaryKey: string, defaultValues: Record<string, any>): AdminBaseConfig => {
  return {
    tableName,
    primaryKey,
    defaultValues
  };
};




import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AppearanceSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminAppearance = () => {
  const [settings, setSettings] = useState<AppearanceSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 [AdminAppearance] Iniciando carga de configuraciones...');

      const { data, error: fetchError } = await supabase
        .from('appearance_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (fetchError) {
        console.error('❌ [AdminAppearance] Error de Supabase:', fetchError);
        
        // Manejo específico de errores
        if (fetchError.message?.includes('JWT expired')) {
          setError('Sesión expirada. Por favor, recarga la página.');
        } else if (fetchError.message?.includes('relation "appearance_settings" does not exist')) {
          setError('La tabla de configuraciones de apariencia no existe. Ejecuta el script create-missing-admin-tables.sql en Supabase.');
        } else if (fetchError.message?.includes('permission denied')) {
          setError('Sin permisos para acceder a las configuraciones. Verifica las políticas RLS.');
        } else {
          setError(fetchError.message || 'Error desconocido cargando configuraciones');
        }
        
        setSettings([]);
        return;
      }

      console.log('✅ [AdminAppearance] Configuraciones cargadas:', data?.length || 0);
      setSettings(data || []);
    } catch (err: any) {
      console.error('❌ [AdminAppearance] Error cargando configuraciones:', err);
      setError(err.message || 'Error desconocido cargando configuraciones');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSetting = useCallback(async (settingData: Partial<AppearanceSetting>) => {
    try {
      console.log('📝 [AdminAppearance] Creando configuración:', settingData);

      const insertData: any = {
        setting_key: settingData.setting_key || '',
        setting_value: settingData.setting_value || '',
        setting_type: settingData.setting_type || 'text',
        category: settingData.category || 'general',
        description: settingData.description || '',
        is_active: settingData.is_active !== undefined ? settingData.is_active : true
      };

      const { data, error: createError } = await supabase
        .from('appearance_settings')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('✅ [AdminAppearance] Configuración creada:', data);
      await fetchSettings(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ [AdminAppearance] Error creando configuración:', err);
      throw err;
    }
  }, [fetchSettings]);

  const updateSetting = useCallback(async (settingKey: string, newValue: any) => {
    try {
      console.log('✏️ [AdminAppearance] Actualizando configuración:', settingKey, newValue);

      const { data, error: updateError } = await supabase
        .from('appearance_settings')
        .update({ 
          setting_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ [AdminAppearance] Configuración actualizada:', data);
      await fetchSettings(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ [AdminAppearance] Error actualizando configuración:', err);
      throw err;
    }
  }, [fetchSettings]);

  const deleteSetting = useCallback(async (settingKey: string) => {
    try {
      console.log('🗑️ [AdminAppearance] Eliminando configuración:', settingKey);

      const { error: deleteError } = await supabase
        .from('appearance_settings')
        .delete()
        .eq('setting_key', settingKey);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ [AdminAppearance] Configuración eliminada');
      await fetchSettings(); // Recargar lista
    } catch (err: any) {
      console.error('❌ [AdminAppearance] Error eliminando configuración:', err);
      throw err;
    }
  }, [fetchSettings]);

  const toggleSettingStatus = useCallback(async (settingKey: string) => {
    try {
      const setting = settings.find(s => s.setting_key === settingKey);
      if (!setting) throw new Error('Configuración no encontrada');

      await updateSetting(settingKey, setting.setting_value); // Esto actualizará el timestamp
    } catch (err: any) {
      console.error('❌ [AdminAppearance] Error cambiando estado:', err);
      throw err;
    }
  }, [settings, updateSetting]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    createSetting,
    updateSetting,
    deleteSetting,
    toggleSettingStatus
  };
};
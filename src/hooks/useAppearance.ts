import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AppearanceSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAppearance = () => {
  const [settings, setSettings] = useState<AppearanceSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useAppearance] Obteniendo configuraciones de apariencia...');

      const { data, error: fetchError } = await supabase
        .from('appearance_settings')
        .select('*')
        .eq('is_active', true)
        .order('setting_key', { ascending: true });

      if (fetchError) {
        console.error('❌ [useAppearance] Error de Supabase:', fetchError);
        
        // Si la tabla no existe, mostrar error específico
        if (fetchError.message.includes('relation') && fetchError.message.includes('does not exist')) {
          setError('La tabla de configuraciones de apariencia no existe. Ejecuta el script create-admin-tables.sql en Supabase.');
        } else {
          setError(fetchError.message);
        }
        setSettings([]);
        return;
      }

      setSettings(data || []);
      console.log('✅ [useAppearance] Configuraciones cargadas:', data?.length || 0);
    } catch (err) {
      console.error('❌ [useAppearance] Error cargando configuraciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (settingKey: string, value: any) => {
    try {
      console.log('📝 [useAppearance] Actualizando configuración:', settingKey, value);

      const { data, error: updateError } = await supabase
        .from('appearance_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Actualizar estado local
      setSettings(prev => 
        prev.map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, setting_value: value, updated_at: new Date().toISOString() }
            : setting
        )
      );

      console.log('✅ [useAppearance] Configuración actualizada:', settingKey);
      return data;
    } catch (err) {
      console.error('❌ [useAppearance] Error actualizando configuración:', err);
      throw err;
    }
  }, []);

  const createSetting = useCallback(async (settingData: Partial<AppearanceSetting>) => {
    try {
      console.log('📝 [useAppearance] Creando configuración:', settingData);

      const { data, error: createError } = await supabase
        .from('appearance_settings')
        .insert([{
          setting_key: settingData.setting_key || '',
          setting_value: settingData.setting_value || '',
          setting_type: settingData.setting_type || 'string',
          description: settingData.description || '',
          is_active: settingData.is_active !== undefined ? settingData.is_active : true
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Actualizar estado local
      setSettings(prev => [...prev, data]);

      console.log('✅ [useAppearance] Configuración creada:', settingData.setting_key);
      return data;
    } catch (err) {
      console.error('❌ [useAppearance] Error creando configuración:', err);
      throw err;
    }
  }, []);

  const deleteSetting = useCallback(async (settingKey: string) => {
    try {
      console.log('🗑️ [useAppearance] Eliminando configuración:', settingKey);

      const { error: deleteError } = await supabase
        .from('appearance_settings')
        .delete()
        .eq('setting_key', settingKey);

      if (deleteError) {
        throw deleteError;
      }

      // Actualizar estado local
      setSettings(prev => prev.filter(setting => setting.setting_key !== settingKey));

      console.log('✅ [useAppearance] Configuración eliminada:', settingKey);
    } catch (err) {
      console.error('❌ [useAppearance] Error eliminando configuración:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
    createSetting,
    deleteSetting
  };
};
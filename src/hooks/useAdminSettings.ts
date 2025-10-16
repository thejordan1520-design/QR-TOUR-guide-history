import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  updated_at: string;
}

export interface SettingsStats {
  total: number;
  byType: Record<string, number>;
  recentlyUpdated: number;
  needsAttention: number;
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) {
        console.error('❌ Error fetching settings:', error);
        throw error;
      }

      console.log('✅ Settings fetched:', data?.length || 0);
      setSettings(data || []);
    } catch (err) {
      console.error('❌ Error in fetchSettings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSetting = useCallback(async (settingData: Partial<AdminSetting>) => {
    try {
      console.log('📝 Creating setting:', settingData);
      
      const settingToCreate = {
        setting_key: settingData.setting_key?.trim() || '',
        setting_value: settingData.setting_value?.trim() || '',
        setting_type: settingData.setting_type || 'string',
        description: settingData.description?.trim() || '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('app_settings')
        .insert(settingToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating setting:', error);
        throw error;
      }

      console.log('✅ Setting created:', data);
      
      // Refrescar la lista
      await fetchSettings();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating setting:', err);
      throw err;
    }
  }, [fetchSettings]);

  const updateSetting = useCallback(async (id: string, settingData: Partial<AdminSetting>) => {
    try {
      console.log('✏️ Updating setting:', id, settingData);
      
      const updateData = {
        ...settingData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('app_settings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating setting:', error);
        throw error;
      }

      console.log('✅ Setting updated:', data);
      
      // Refrescar la lista
      await fetchSettings();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating setting:', err);
      throw err;
    }
  }, [fetchSettings]);

  const updateSettingByKey = useCallback(async (key: string, value: string, type: string = 'string') => {
    try {
      console.log('✏️ Updating setting by key:', key, value);
      
      const updateData = {
        setting_value: value,
        setting_type: type,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('app_settings')
        .update(updateData)
        .eq('setting_key', key)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating setting by key:', error);
        throw error;
      }

      console.log('✅ Setting updated by key:', data);
      
      // Refrescar la lista
      await fetchSettings();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating setting by key:', err);
      throw err;
    }
  }, [fetchSettings]);

  const deleteSetting = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting setting:', id);
      
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting setting:', error);
        throw error;
      }

      console.log('✅ Setting deleted');
      
      // Refrescar la lista
      await fetchSettings();
    } catch (err) {
      console.error('❌ Error deleting setting:', err);
      throw err;
    }
  }, [fetchSettings]);

  const getSetting = useCallback((key: string): AdminSetting | null => {
    return settings.find(setting => setting.setting_key === key) || null;
  }, [settings]);

  const getSettingValue = useCallback((key: string, defaultValue: any = null): any => {
    const setting = getSetting(key);
    if (!setting) return defaultValue;

    try {
      switch (setting.setting_type) {
        case 'number':
          return parseFloat(setting.setting_value);
        case 'boolean':
          return setting.setting_value === 'true';
        case 'json':
          return JSON.parse(setting.setting_value);
        case 'array':
          return JSON.parse(setting.setting_value);
        default:
          return setting.setting_value;
      }
    } catch (err) {
      console.error('❌ Error parsing setting value:', err);
      return defaultValue;
    }
  }, [getSetting]);

  const setSettingValue = useCallback(async (key: string, value: any, type: string = 'string') => {
    try {
      let stringValue: string;
      
      switch (type) {
        case 'number':
          stringValue = value.toString();
          break;
        case 'boolean':
          stringValue = value ? 'true' : 'false';
          break;
        case 'json':
        case 'array':
          stringValue = JSON.stringify(value);
          break;
        default:
          stringValue = value.toString();
      }

      await updateSettingByKey(key, stringValue, type);
    } catch (err) {
      console.error('❌ Error setting value:', err);
      throw err;
    }
  }, [updateSettingByKey]);

  const exportSettings = useCallback(async (format: 'json' | 'env' = 'json') => {
    try {
      console.log('📤 Exporting settings in', format, 'format');
      
      if (format === 'json') {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `settings_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'env') {
        const envContent = settings.map(setting => 
          `${setting.setting_key.toUpperCase()}=${setting.setting_value}`
        ).join('\n');
        
        const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(envContent);
        const exportFileDefaultName = `settings_${new Date().toISOString().split('T')[0]}.env`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
      
      console.log('✅ Settings exported successfully');
    } catch (err) {
      console.error('❌ Error exporting settings:', err);
      throw err;
    }
  }, [settings]);

  const importSettings = useCallback(async (settingsData: AdminSetting[]) => {
    try {
      console.log('📥 Importing settings:', settingsData.length);
      
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(settingsData, { onConflict: 'setting_key' })
        .select();

      if (error) {
        console.error('❌ Error importing settings:', error);
        throw error;
      }

      console.log('✅ Settings imported successfully');
      
      // Refrescar la lista
      await fetchSettings();
      
      return data;
    } catch (err) {
      console.error('❌ Error importing settings:', err);
      throw err;
    }
  }, [fetchSettings]);

  const resetToDefaults = useCallback(async () => {
    try {
      console.log('🔄 Resetting settings to defaults');
      
      const defaultSettings = [
        {
          setting_key: 'site_name',
          setting_value: 'QR Tour',
          setting_type: 'string',
          description: 'Nombre del sitio web',
          updated_at: new Date().toISOString()
        },
        {
          setting_key: 'site_description',
          setting_value: 'Plataforma de turismo con códigos QR',
          setting_type: 'string',
          description: 'Descripción del sitio web',
          updated_at: new Date().toISOString()
        },
        {
          setting_key: 'maintenance_mode',
          setting_value: 'false',
          setting_type: 'boolean',
          description: 'Modo de mantenimiento',
          updated_at: new Date().toISOString()
        },
        {
          setting_key: 'max_upload_size',
          setting_value: '10485760',
          setting_type: 'number',
          description: 'Tamaño máximo de archivo en bytes (10MB)',
          updated_at: new Date().toISOString()
        },
        {
          setting_key: 'allowed_file_types',
          setting_value: '["jpg", "jpeg", "png", "gif", "mp3", "wav"]',
          setting_type: 'array',
          description: 'Tipos de archivo permitidos',
          updated_at: new Date().toISOString()
        }
      ];

      const { data, error } = await supabase
        .from('app_settings')
        .upsert(defaultSettings, { onConflict: 'setting_key' })
        .select();

      if (error) {
        console.error('❌ Error resetting settings:', error);
        throw error;
      }

      console.log('✅ Settings reset to defaults');
      
      // Refrescar la lista
      await fetchSettings();
      
      return data;
    } catch (err) {
      console.error('❌ Error resetting settings:', err);
      throw err;
    }
  }, [fetchSettings]);

  const getSettingsStats = useCallback((): SettingsStats => {
    const total = settings.length;
    
    // Estadísticas por tipo
    const byType: Record<string, number> = {};
    settings.forEach(setting => {
      byType[setting.setting_type] = (byType[setting.setting_type] || 0) + 1;
    });
    
    // Configuraciones actualizadas recientemente (última semana)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentlyUpdated = settings.filter(setting => 
      new Date(setting.updated_at) > oneWeekAgo
    ).length;
    
    // Configuraciones que necesitan atención (sin descripción o valores vacíos)
    const needsAttention = settings.filter(setting => 
      !setting.description.trim() || !setting.setting_value.trim()
    ).length;

    return {
      total,
      byType,
      recentlyUpdated,
      needsAttention
    };
  }, [settings]);

  const searchSettings = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    
    return settings.filter(setting => 
      setting.setting_key.toLowerCase().includes(searchTerm) ||
      setting.setting_value.toLowerCase().includes(searchTerm) ||
      setting.description.toLowerCase().includes(searchTerm)
    );
  }, [settings]);

  const validateSettingValue = useCallback((value: string, type: string): boolean => {
    try {
      switch (type) {
        case 'number':
          return !isNaN(parseFloat(value));
        case 'boolean':
          return value === 'true' || value === 'false';
        case 'json':
          JSON.parse(value);
          return true;
        case 'array':
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        default:
          return true;
      }
    } catch (err) {
      return false;
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
    createSetting,
    updateSetting,
    updateSettingByKey,
    deleteSetting,
    getSetting,
    getSettingValue,
    setSettingValue,
    exportSettings,
    importSettings,
    resetToDefaults,
    getSettingsStats,
    searchSettings,
    validateSettingValue,
    refetch: fetchSettings
  };
};




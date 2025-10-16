import { useState, useEffect } from 'react';
import { appSettingsService } from '../supabaseServices';

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await appSettingsService.getAllSettings();
        
        if (error) {
          console.error('Error fetching app settings from Supabase:', error);
          setError(error.message);
          setSettings({});
        } else {
          // Convertir array a objeto clave-valor
          const settingsMap: Record<string, string> = {};
          (data || []).forEach((setting: AppSetting) => {
            settingsMap[setting.setting_key] = setting.setting_value;
          });
          setSettings(settingsMap);
          console.log('✅ App settings loaded from Supabase:', Object.keys(settingsMap).length, 'settings');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching app settings:', err);
        setError(err.message);
        setSettings({});
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Función para obtener un setting específico
  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  return { settings, loading, error, getSetting };
};

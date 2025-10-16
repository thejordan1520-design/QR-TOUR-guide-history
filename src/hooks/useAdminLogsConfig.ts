import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminSystemLog {
  id: string;
  system_event: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  details: Record<string, any>;
  created_at: string;
}

export interface AdminConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export const useAdminLogsConfig = () => {
  const [systemLogs, setSystemLogs] = useState<AdminSystemLog[]>([]);
  const [configs, setConfigs] = useState<AdminConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching system logs:', error);
        throw error;
      }

      console.log('✅ System logs fetched:', data?.length || 0);
      setSystemLogs(data || []);
    } catch (err) {
      console.error('❌ Error in fetchSystemLogs:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try {
      // Por ahora usaremos datos mock para configuraciones
      // ya que no hay una tabla específica de configuraciones
      const mockConfigs: AdminConfig[] = [
        {
          id: 'config-1',
          key: 'site_name',
          value: 'QR Tour Puerto Plata',
          description: 'Nombre del sitio web',
          category: 'general',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'config-2',
          key: 'max_upload_size',
          value: '10MB',
          description: 'Tamaño máximo de archivos a subir',
          category: 'uploads',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'config-3',
          key: 'enable_notifications',
          value: 'true',
          description: 'Habilitar notificaciones del sistema',
          category: 'notifications',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'config-4',
          key: 'maintenance_mode',
          value: 'false',
          description: 'Modo de mantenimiento',
          category: 'system',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'config-5',
          key: 'default_language',
          value: 'es',
          description: 'Idioma por defecto del sistema',
          category: 'localization',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      console.log('✅ Configs loaded:', mockConfigs.length);
      setConfigs(mockConfigs);
    } catch (err) {
      console.error('❌ Error in fetchConfigs:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  const createSystemLog = useCallback(async (logData: Partial<AdminSystemLog>) => {
    try {
      console.log('📝 Creating system log:', logData);
      
      const logToCreate = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        system_event: logData.system_event?.trim() || 'custom_event',
        level: logData.level || 'info',
        details: logData.details || {},
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('system_logs')
        .insert(logToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating system log:', error);
        throw error;
      }

      console.log('✅ System log created:', data);
      
      // Refrescar la lista
      await fetchSystemLogs();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating system log:', err);
      throw err;
    }
  }, [fetchSystemLogs]);

  const updateConfig = useCallback(async (id: string, configData: Partial<AdminConfig>) => {
    try {
      console.log('✏️ Updating config:', id, configData);
      
      // Actualizar en el estado local (simulando actualización)
      setConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.id === id 
            ? { ...config, ...configData }
            : config
        )
      );
      
      console.log('✅ Config updated');
      return { id, ...configData };
    } catch (err) {
      console.error('❌ Error updating config:', err);
      throw err;
    }
  }, []);

  const deleteSystemLog = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting system log:', id);
      
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting system log:', error);
        throw error;
      }

      console.log('✅ System log deleted');
      
      // Refrescar la lista
      await fetchSystemLogs();
    } catch (err) {
      console.error('❌ Error deleting system log:', err);
      throw err;
    }
  }, [fetchSystemLogs]);

  const clearOldLogs = useCallback(async (daysToKeep: number = 30) => {
    try {
      console.log('🧹 Clearing old logs older than', daysToKeep, 'days');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Error clearing old logs:', error);
        throw error;
      }

      console.log('✅ Old logs cleared');
      
      // Refrescar la lista
      await fetchSystemLogs();
    } catch (err) {
      console.error('❌ Error clearing old logs:', err);
      throw err;
    }
  }, [fetchSystemLogs]);

  const exportLogs = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      console.log('📤 Exporting logs in', format, 'format');
      
      if (format === 'json') {
        const dataStr = JSON.stringify(systemLogs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'csv') {
        const headers = ['ID', 'Event', 'Level', 'Details', 'Created At'];
        const csvContent = [
          headers.join(','),
          ...systemLogs.map(log => [
            log.id,
            `"${log.system_event}"`,
            log.level,
            `"${JSON.stringify(log.details).replace(/"/g, '""')}"`,
            log.created_at
          ].join(','))
        ].join('\n');
        
        const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
        const exportFileDefaultName = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
      
      console.log('✅ Logs exported successfully');
    } catch (err) {
      console.error('❌ Error exporting logs:', err);
      throw err;
    }
  }, [systemLogs]);

  const getLogStats = useCallback(() => {
    const totalLogs = systemLogs.length;
    const errorLogs = systemLogs.filter(log => log.level === 'error').length;
    const warningLogs = systemLogs.filter(log => log.level === 'warning').length;
    const infoLogs = systemLogs.filter(log => log.level === 'info').length;
    const debugLogs = systemLogs.filter(log => log.level === 'debug').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = systemLogs.filter(log => 
      log.created_at.startsWith(today)
    ).length;

    return {
      total: totalLogs,
      errors: errorLogs,
      warnings: warningLogs,
      info: infoLogs,
      debug: debugLogs,
      today: todayLogs
    };
  }, [systemLogs]);

  useEffect(() => {
    fetchSystemLogs();
    fetchConfigs();
  }, [fetchSystemLogs, fetchConfigs]);

  return {
    systemLogs,
    configs,
    loading,
    error,
    fetchSystemLogs,
    fetchConfigs,
    createSystemLog,
    updateConfig,
    deleteSystemLog,
    clearOldLogs,
    exportLogs,
    getLogStats,
    refetch: () => {
      fetchSystemLogs();
      fetchConfigs();
    }
  };
};




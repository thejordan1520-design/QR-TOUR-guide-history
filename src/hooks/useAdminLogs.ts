import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_table?: string;
  target_id?: string;
  description: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

export interface UserLog {
  id: string;
  user_id?: string;
  action_type: string;
  target_table?: string;
  target_id?: string;
  description: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  log_level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  component: string;
  message: string;
  stack_trace?: string;
  metadata?: any;
  created_at: string;
}

export interface LogStatistics {
  log_type: string;
  total_count: number;
  error_count: number;
  warning_count: number;
  info_count: number;
}

export const useAdminLogs = () => {
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminLogs = useCallback(async (limit = 100, offset = 0) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Error fetching admin logs:', err);
      throw err;
    }
  }, []);

  const fetchUserLogs = useCallback(async (limit = 100, offset = 0) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Error fetching user logs:', err);
      throw err;
    }
  }, []);

  const fetchSystemLogs = useCallback(async (limit = 100, offset = 0) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Error fetching system logs:', err);
      throw err;
    }
  }, []);

  const fetchLogStatistics = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const { data, error: fetchError } = await supabase.rpc('get_log_statistics', {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
      });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Error fetching log statistics:', err);
      throw err;
    }
  }, []);

  const fetchAllLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔍 [useAdminLogs] Obteniendo logs...');
    
    try {
      const [adminLogsData, userLogsData, systemLogsData, statisticsData] = await Promise.all([
        fetchAdminLogs().catch(err => {
          console.warn('⚠️ [useAdminLogs] Error en admin_logs:', err);
          return [];
        }),
        fetchUserLogs().catch(err => {
          console.warn('⚠️ [useAdminLogs] Error en user_logs:', err);
          return [];
        }),
        fetchSystemLogs().catch(err => {
          console.warn('⚠️ [useAdminLogs] Error en system_logs:', err);
          return [];
        }),
        fetchLogStatistics().catch(err => {
          console.warn('⚠️ [useAdminLogs] Error en estadísticas:', err);
          return [];
        }),
      ]);

      setAdminLogs(adminLogsData);
      setUserLogs(userLogsData);
      setSystemLogs(systemLogsData);
      setStatistics(statisticsData);
      
      // Si todas las tablas fallan, mostrar error específico
      if (adminLogsData.length === 0 && userLogsData.length === 0 && systemLogsData.length === 0) {
        setError('Las tablas de logs no existen. Ejecuta el script create-admin-tables.sql en Supabase.');
      }
      
      console.log('✅ [useAdminLogs] Logs cargados:', {
        admin: adminLogsData.length,
        user: userLogsData.length,
        system: systemLogsData.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar logs');
      console.error('❌ [useAdminLogs] Error cargando logs:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAdminLogs, fetchUserLogs, fetchSystemLogs, fetchLogStatistics]);

  const logAdminAction = useCallback(async (
    actionType: string,
    targetTable?: string,
    targetId?: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('log_admin_action', {
        p_admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_action_type: actionType,
        p_target_table: targetTable,
        p_target_id: targetId,
        p_description: description,
        p_old_values: oldValues,
        p_new_values: newValues,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_session_id: sessionId,
      });

      if (rpcError) throw rpcError;
      return data;
    } catch (err) {
      console.error('Error logging admin action:', err);
      throw err;
    }
  }, []);

  const logUserAction = useCallback(async (
    userId: string | null,
    actionType: string,
    targetTable?: string,
    targetId?: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('log_user_action', {
        p_user_id: userId,
        p_action_type: actionType,
        p_target_table: targetTable,
        p_target_id: targetId,
        p_description: description,
        p_metadata: metadata,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_session_id: sessionId,
      });

      if (rpcError) throw rpcError;
      return data;
    } catch (err) {
      console.error('Error logging user action:', err);
      throw err;
    }
  }, []);

  const logSystemEvent = useCallback(async (
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG',
    component: string,
    message: string,
    stackTrace?: string,
    metadata?: any
  ) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('log_system_event', {
        p_log_level: logLevel,
        p_component: component,
        p_message: message,
        p_stack_trace: stackTrace,
        p_metadata: metadata,
      });

      if (rpcError) throw rpcError;
      return data;
    } catch (err) {
      console.error('Error logging system event:', err);
      throw err;
    }
  }, []);

  const clearLogs = useCallback(async (logType: 'admin' | 'user' | 'system', olderThanDays = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let tableName: string;
      switch (logType) {
        case 'admin':
          tableName = 'admin_logs';
          break;
        case 'user':
          tableName = 'user_logs';
          break;
        case 'system':
          tableName = 'system_logs';
          break;
        default:
          throw new Error('Invalid log type');
      }

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (deleteError) throw deleteError;
      await fetchAllLogs(); // Refresh logs after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar logs');
      throw err;
    }
  }, [fetchAllLogs]);

  useEffect(() => {
    fetchAllLogs();
  }, [fetchAllLogs]);

  return {
    adminLogs,
    userLogs,
    systemLogs,
    statistics,
    loading,
    error,
    fetchAllLogs,
    fetchAdminLogs,
    fetchUserLogs,
    fetchSystemLogs,
    fetchLogStatistics,
    logAdminAction,
    logUserAction,
    logSystemEvent,
    clearLogs,
  };
};
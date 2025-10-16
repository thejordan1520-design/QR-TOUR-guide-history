import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DatabaseTable {
  name: string;
  records: number;
  size: string;
  last_updated: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface DatabaseBackup {
  id: string;
  name: string;
  size: string;
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
  tables_included: string[];
}

export interface DatabaseQuery {
  id: string;
  query: string;
  result_count: number;
  execution_time: number;
  created_at: string;
  status: 'success' | 'error';
}

export const useAdminDatabase = () => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [queries, setQueries] = useState<DatabaseQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener datos reales de Supabase
      const { data: realTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        console.error('❌ Error obteniendo tablas reales:', tablesError);
        throw tablesError;
      }

      const tables: DatabaseTable[] = (realTables || []).map(table => ({
        name: table.table_name,
        records: 0, // Se puede obtener con consultas adicionales si es necesario
        size: 'N/A',
        last_updated: new Date().toISOString(),
        status: 'active'
      }));

      console.log('✅ Tablas reales cargadas:', tables.length);
      setTables(tables);
    } catch (err) {
      console.error('❌ Error in fetchTables:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      // Simular datos de respaldos
      const mockBackups: DatabaseBackup[] = [
        {
          id: 'backup-1',
          name: 'backup_2025_09_29_full',
          size: '25.3 MB',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          tables_included: ['users', 'places', 'excursions', 'restaurants', 'supermarkets', 'services', 'qr_codes', 'reservations', 'feedback', 'notifications', 'advertisements', 'plans', 'transactions', 'badges', 'system_logs']
        },
        {
          id: 'backup-2',
          name: 'backup_2025_09_28_incremental',
          size: '3.2 MB',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          status: 'completed',
          tables_included: ['users', 'reservations', 'feedback', 'notifications']
        },
        {
          id: 'backup-3',
          name: 'backup_2025_09_27_full',
          size: '24.8 MB',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          status: 'completed',
          tables_included: ['users', 'places', 'excursions', 'restaurants', 'supermarkets', 'services', 'qr_codes', 'reservations', 'feedback', 'notifications', 'advertisements', 'plans', 'transactions', 'badges', 'system_logs']
        },
        {
          id: 'backup-4',
          name: 'backup_2025_09_26_incremental',
          size: '2.1 MB',
          created_at: new Date(Date.now() - 345600000).toISOString(),
          status: 'completed',
          tables_included: ['places', 'excursions', 'restaurants']
        },
        {
          id: 'backup-5',
          name: 'backup_2025_09_25_full',
          size: '23.9 MB',
          created_at: new Date(Date.now() - 432000000).toISOString(),
          status: 'completed',
          tables_included: ['users', 'places', 'excursions', 'restaurants', 'supermarkets', 'services', 'qr_codes', 'reservations', 'feedback', 'notifications', 'advertisements', 'plans', 'transactions', 'badges', 'system_logs']
        }
      ];

      console.log('✅ Database backups loaded:', mockBackups.length);
      setBackups(mockBackups);
    } catch (err) {
      console.error('❌ Error in fetchBackups:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      // Simular datos de consultas
      const mockQueries: DatabaseQuery[] = [
        {
          id: 'query-1',
          query: 'SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL \'7 days\'',
          result_count: 25,
          execution_time: 45,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          status: 'success'
        },
        {
          id: 'query-2',
          query: 'SELECT * FROM places WHERE is_active = true ORDER BY created_at DESC LIMIT 10',
          result_count: 10,
          execution_time: 32,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'success'
        },
        {
          id: 'query-3',
          query: 'SELECT u.name, COUNT(r.id) as reservation_count FROM users u LEFT JOIN reservations r ON u.id = r.user_id GROUP BY u.id, u.name',
          result_count: 150,
          execution_time: 78,
          created_at: new Date(Date.now() - 5400000).toISOString(),
          status: 'success'
        },
        {
          id: 'query-4',
          query: 'SELECT * FROM system_logs WHERE level = \'error\' AND created_at > NOW() - INTERVAL \'24 hours\'',
          result_count: 3,
          execution_time: 28,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          status: 'success'
        },
        {
          id: 'query-5',
          query: 'SELECT * FROM non_existent_table',
          result_count: 0,
          execution_time: 0,
          created_at: new Date(Date.now() - 9000000).toISOString(),
          status: 'error'
        }
      ];

      console.log('✅ Database queries loaded:', mockQueries.length);
      setQueries(mockQueries);
    } catch (err) {
      console.error('❌ Error in fetchQueries:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  const createBackup = useCallback(async (backupName: string, tablesToInclude: string[]) => {
    try {
      console.log('💾 Creating database backup:', backupName);
      
      // Simular creación de respaldo
      const newBackup: DatabaseBackup = {
        id: `backup-${Date.now()}`,
        name: backupName,
        size: 'Calculando...',
        created_at: new Date().toISOString(),
        status: 'in_progress',
        tables_included: tablesToInclude
      };

      setBackups(prev => [newBackup, ...prev]);
      
      // Simular progreso del respaldo
      setTimeout(() => {
        setBackups(prev => 
          prev.map(backup => 
            backup.id === newBackup.id 
              ? { ...backup, status: 'completed', size: '25.7 MB' }
              : backup
          )
        );
      }, 3000);
      
      console.log('✅ Database backup created:', newBackup.id);
      return newBackup;
    } catch (err) {
      console.error('❌ Error creating backup:', err);
      throw err;
    }
  }, []);

  const executeQuery = useCallback(async (query: string) => {
    try {
      console.log('🔍 Executing database query:', query);
      
      // Simular ejecución de consulta
      const newQuery: DatabaseQuery = {
        id: `query-${Date.now()}`,
        query: query,
        result_count: Math.floor(Math.random() * 100),
        execution_time: Math.floor(Math.random() * 100) + 10,
        created_at: new Date().toISOString(),
        status: query.toLowerCase().includes('error') || query.toLowerCase().includes('drop') ? 'error' : 'success'
      };

      setQueries(prev => [newQuery, ...prev]);
      
      console.log('✅ Query executed:', newQuery.id);
      return newQuery;
    } catch (err) {
      console.error('❌ Error executing query:', err);
      throw err;
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: string) => {
    try {
      console.log('🗑️ Deleting backup:', backupId);
      
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      
      console.log('✅ Backup deleted');
    } catch (err) {
      console.error('❌ Error deleting backup:', err);
      throw err;
    }
  }, []);

  const optimizeTable = useCallback(async (tableName: string) => {
    try {
      console.log('⚡ Optimizing table:', tableName);
      
      // Simular optimización
      setTables(prev => 
        prev.map(table => 
          table.name === tableName 
            ? { ...table, last_updated: new Date().toISOString() }
            : table
        )
      );
      
      console.log('✅ Table optimized:', tableName);
    } catch (err) {
      console.error('❌ Error optimizing table:', err);
      throw err;
    }
  }, []);

  const getDatabaseStats = useCallback(() => {
    const totalTables = tables.length;
    const totalRecords = tables.reduce((sum, table) => sum + table.records, 0);
    const totalSize = tables.reduce((sum, table) => {
      const size = parseFloat(table.size.replace(' MB', ''));
      return sum + size;
    }, 0);
    
    const activeTables = tables.filter(table => table.status === 'active').length;
    const inactiveTables = tables.filter(table => table.status === 'inactive').length;
    const maintenanceTables = tables.filter(table => table.status === 'maintenance').length;
    
    const completedBackups = backups.filter(backup => backup.status === 'completed').length;
    const inProgressBackups = backups.filter(backup => backup.status === 'in_progress').length;
    const failedBackups = backups.filter(backup => backup.status === 'failed').length;
    
    const successfulQueries = queries.filter(query => query.status === 'success').length;
    const failedQueries = queries.filter(query => query.status === 'error').length;
    const avgExecutionTime = queries.length > 0 
      ? queries.reduce((sum, query) => sum + query.execution_time, 0) / queries.length 
      : 0;

    return {
      tables: {
        total: totalTables,
        active: activeTables,
        inactive: inactiveTables,
        maintenance: maintenanceTables
      },
      records: totalRecords,
      size: `${totalSize.toFixed(1)} MB`,
      backups: {
        completed: completedBackups,
        inProgress: inProgressBackups,
        failed: failedBackups
      },
      queries: {
        successful: successfulQueries,
        failed: failedQueries,
        avgExecutionTime: Math.round(avgExecutionTime)
      }
    };
  }, [tables, backups, queries]);

  useEffect(() => {
    fetchTables();
    fetchBackups();
    fetchQueries();
  }, [fetchTables, fetchBackups, fetchQueries]);

  return {
    tables,
    backups,
    queries,
    loading,
    error,
    fetchTables,
    fetchBackups,
    fetchQueries,
    createBackup,
    executeQuery,
    deleteBackup,
    optimizeTable,
    getDatabaseStats,
    refetch: () => {
      fetchTables();
      fetchBackups();
      fetchQueries();
    }
  };
};




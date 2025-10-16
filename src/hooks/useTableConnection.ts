import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface TableConnectionStatus {
  tableName: string;
  exists: boolean;
  accessible: boolean;
  error?: string;
  recordCount?: number;
}

export const useTableConnection = (tableName: string) => {
  const [status, setStatus] = useState<TableConnectionStatus>({
    tableName,
    exists: false,
    accessible: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkTableConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 [useTableConnection] Verificando tabla: ${tableName}`);

      // Intentar hacer una consulta simple para verificar si la tabla existe y es accesible
      const { data, error: queryError, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (queryError) {
        console.error(`❌ [useTableConnection] Error en tabla ${tableName}:`, queryError);
        
        // Determinar si es un error de tabla no encontrada o de permisos
        if (queryError.message.includes('relation') && queryError.message.includes('does not exist')) {
          setStatus({
            tableName,
            exists: false,
            accessible: false,
            error: `Tabla '${tableName}' no existe`
          });
        } else if (queryError.message.includes('permission denied') || queryError.message.includes('RLS')) {
          setStatus({
            tableName,
            exists: true,
            accessible: false,
            error: `Sin permisos para acceder a '${tableName}'`
          });
        } else {
          setStatus({
            tableName,
            exists: true,
            accessible: false,
            error: queryError.message
          });
        }
      } else {
        console.log(`✅ [useTableConnection] Tabla ${tableName} accesible, registros: ${count || 0}`);
        setStatus({
          tableName,
          exists: true,
          accessible: true,
          recordCount: count || 0
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error(`❌ [useTableConnection] Error general en ${tableName}:`, err);
      setError(errorMessage);
      setStatus({
        tableName,
        exists: false,
        accessible: false,
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    checkTableConnection();
  }, [checkTableConnection]);

  return {
    status,
    loading,
    error,
    refetch: checkTableConnection
  };
};

export const useMultipleTableConnections = (tableNames: string[]) => {
  const [statuses, setStatuses] = useState<TableConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAllTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 [useMultipleTableConnections] Verificando ${tableNames.length} tablas...`);

      const results = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            const { data, error: queryError, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
              .limit(1);

            if (queryError) {
              if (queryError.message.includes('relation') && queryError.message.includes('does not exist')) {
                return {
                  tableName,
                  exists: false,
                  accessible: false,
                  error: `Tabla '${tableName}' no existe`
                };
              } else if (queryError.message.includes('permission denied') || queryError.message.includes('RLS')) {
                return {
                  tableName,
                  exists: true,
                  accessible: false,
                  error: `Sin permisos para acceder a '${tableName}'`
                };
              } else {
                return {
                  tableName,
                  exists: true,
                  accessible: false,
                  error: queryError.message
                };
              }
            } else {
              return {
                tableName,
                exists: true,
                accessible: true,
                recordCount: count || 0
              };
            }
          } catch (err) {
            return {
              tableName,
              exists: false,
              accessible: false,
              error: err instanceof Error ? err.message : 'Error desconocido'
            };
          }
        })
      );

      setStatuses(results);
      
      const failedTables = results.filter(r => !r.accessible);
      if (failedTables.length > 0) {
        console.warn(`⚠️ [useMultipleTableConnections] ${failedTables.length} tablas con problemas:`, failedTables);
      } else {
        console.log(`✅ [useMultipleTableConnections] Todas las tablas accesibles`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error(`❌ [useMultipleTableConnections] Error general:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tableNames]);

  useEffect(() => {
    checkAllTables();
  }, [checkAllTables]);

  return {
    statuses,
    loading,
    error,
    refetch: checkAllTables
  };
};


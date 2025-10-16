import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';
import { tableSetupService, TableSetupResult } from '../../services/tableSetupService';

interface TableDiagnosticsProps {
  onTableStatusChange?: (status: any) => void;
}

const TableDiagnostics: React.FC<TableDiagnosticsProps> = ({ onTableStatusChange }) => {
  const [tableStatus, setTableStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkTables = async () => {
    setLoading(true);
    try {
      console.log('🔍 [TableDiagnostics] Verificando estado de tablas...');
      const results = await tableSetupService.verifyAllTables();
      setTableStatus(results);
      setLastChecked(new Date());
      
      if (onTableStatusChange) {
        onTableStatusChange(results);
      }
    } catch (error) {
      console.error('❌ [TableDiagnostics] Error verificando tablas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTables();
  }, []);

  const getStatusIcon = (result: TableSetupResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (result.error?.includes('no existe')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (result: TableSetupResult) => {
    if (result.success) {
      return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
    } else if (result.error?.includes('no existe')) {
      return <Badge variant="destructive">No existe</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnóstico de Tablas Supabase
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            onClick={checkTables} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Verificar Tablas
          </Button>
          {lastChecked && (
            <span className="text-sm text-gray-500">
              Última verificación: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(tableStatus).map(([tableName, result]: [string, any]) => (
            <div key={tableName} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result)}
                <div>
                  <div className="font-medium capitalize">
                    {tableName.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.message}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {result.error}
                    </div>
                  )}
                </div>
              </div>
              {getStatusBadge(result)}
            </div>
          ))}
        </div>

        {Object.keys(tableStatus).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No se han verificado las tablas aún
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div className="text-gray-500">Verificando tablas...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableDiagnostics;


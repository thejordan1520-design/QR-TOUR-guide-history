import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, 
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAccounting, FinancialStats } from '../../hooks/useAccounting';

interface FinancialOverviewProps {
  className?: string;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ className = '' }) => {
  const { getFinancialStats } = useAccounting();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30'); // días

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const statsData = await getFinancialStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setStats(statsData);
    } catch (err) {
      console.error('Error cargando estadísticas financieras:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProfitChange = () => {
    if (!stats) return 0;
    const profitMargin = stats.total_income > 0 ? (stats.net_profit / stats.total_income) * 100 : 0;
    return profitMargin;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <Button onClick={loadStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumen Financiero
          </CardTitle>
          <div className="flex items-center space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="7">7 días</option>
              <option value="30">30 días</option>
              <option value="90">90 días</option>
              <option value="365">1 año</option>
            </select>
            <Button onClick={loadStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ingresos */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Ingresos</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats?.total_income || 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>Últimos {period} días</span>
            </div>
          </div>

          {/* Gastos */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Gastos</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(stats?.total_expenses || 0)}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-red-600">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              <span>Últimos {period} días</span>
            </div>
          </div>

          {/* Beneficio Neto */}
          <div className={`rounded-lg p-4 ${(stats?.net_profit || 0) >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${(stats?.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  Beneficio Neto
                </p>
                <p className={`text-2xl font-bold ${(stats?.net_profit || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {formatCurrency(stats?.net_profit || 0)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${(stats?.net_profit || 0) >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <BarChart3 className={`w-6 h-6 ${(stats?.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={`${(stats?.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Margen: {getProfitChange().toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Transacciones</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats?.transaction_count || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Promedio por Transacción</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats?.avg_transaction_amount || 0)}
            </p>
          </div>
        </div>

        {/* Indicador de rendimiento */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Rendimiento</span>
            <span>{getProfitChange().toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                getProfitChange() >= 20 ? 'bg-green-500' :
                getProfitChange() >= 10 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.max(getProfitChange(), 0), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverview;




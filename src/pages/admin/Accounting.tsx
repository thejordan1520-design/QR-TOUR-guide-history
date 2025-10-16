import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Calculator, Plus, Search, RefreshCw, Download, TrendingUp, TrendingDown, 
  DollarSign, Calendar, Filter, BarChart3, PieChart, FileText, Target
} from 'lucide-react';
import { useAccounting, FinancialTransaction, FinancialStats, Budget } from '../../hooks/useAccounting';

const Accounting = () => {
  const {
    transactions,
    categories,
    budgets,
    loading,
    error,
    fetchTransactions,
    getFinancialStats,
    getIncomeByPeriod,
    createTransaction,
    createBudget
  } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // días
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    status: ''
  });

  // Calcular fechas basadas en el período seleccionado
  const getDateRange = useCallback((days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }, []);

  // Cargar estadísticas financieras
  const loadFinancialStats = useCallback(async () => {
    try {
      const dateRange = getDateRange(parseInt(selectedPeriod));
      const statsData = await getFinancialStats(dateRange.start, dateRange.end);
      setStats(statsData);
      
      // Cargar datos de ingresos por período
      const incomeData = await getIncomeByPeriod(dateRange.start, dateRange.end, 'day');
      setIncomeData(incomeData);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, [selectedPeriod, getFinancialStats, getIncomeByPeriod, getDateRange]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    const dateRange = getDateRange(parseInt(selectedPeriod));
    fetchTransactions({
      startDate: filters.startDate || dateRange.start,
      endDate: filters.endDate || dateRange.end,
      type: filters.type || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined
    });
  }, [filters, selectedPeriod, fetchTransactions, getDateRange]);

  // Filtrar transacciones por término de búsqueda
  const filteredTransactions = transactions.filter((transaction: FinancialTransaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totales por tipo
  const totalsByType = transactions.reduce((acc, transaction) => {
    if (transaction.status === 'completed') {
      if (transaction.transaction_type === 'income') {
        acc.income += transaction.amount;
      } else if (transaction.transaction_type === 'expense') {
        acc.expenses += transaction.amount;
      }
    }
    return acc;
  }, { income: 0, expenses: 0 });

  // Cargar datos al cambiar el período
  useEffect(() => {
    loadFinancialStats();
  }, [loadFinancialStats]);

  // Aplicar filtros automáticamente
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando contabilidad...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button onClick={() => fetchTransactions()} className="mt-2" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contabilidad y Finanzas</h1>
          <p className="text-gray-600">Gestión completa de transacciones financieras y reportes</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Reporte
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats?.total_income?.toFixed(2) || totalsByType.income.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats?.total_expenses?.toFixed(2) || totalsByType.expenses.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Beneficio Neto</p>
                <p className={`text-2xl font-bold ${(stats?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats?.net_profit?.toFixed(2) || (totalsByType.income - totalsByType.expenses).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transacciones</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.transaction_count || transactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y controles */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
              <option value="refund">Reembolsos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={applyFilters} variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => fetchTransactions()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Lista de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Transacciones Financieras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Descripción</th>
                  <th className="text-left py-3 px-4">Categoría</th>
                  <th className="text-left py-3 px-4">Monto</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Método</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction: FinancialTransaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={transaction.transaction_type === 'income' ? 'default' : 'secondary'}
                        className={transaction.transaction_type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {transaction.transaction_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.category}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        ${transaction.amount.toFixed(2)} {transaction.currency}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {transaction.payment_method || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron transacciones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Presupuestos */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Presupuestos
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Presupuesto
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget: Budget) => {
                const percentage = (budget.spent_amount / budget.budget_amount) * 100;
                const isOverBudget = percentage > budget.alert_threshold;
                
                return (
                  <div key={budget.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{budget.name}</h3>
                      <Badge variant={isOverBudget ? 'destructive' : 'default'}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{budget.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gastado:</span>
                        <span className="font-semibold">${budget.spent_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Presupuesto:</span>
                        <span className="font-semibold">${budget.budget_amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {budgets.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay presupuestos configurados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Accounting;
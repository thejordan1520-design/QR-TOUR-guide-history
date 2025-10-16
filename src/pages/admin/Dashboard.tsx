import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { supabaseAdmin } from '../../lib/supabase';
import FinancialOverview from '../../components/admin/FinancialOverview';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Star, 
  TrendingUp, 
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalReservations: number;
  averageRating: number;
  freeUsers: number;
  premiumUsers: number;
  revenueToday: number;
  userGrowth: { month: string; count: number }[];
  monthlyRevenue: { month: string; amount: number }[];
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalReservations: 0,
    averageRating: 0,
    freeUsers: 0,
    premiumUsers: 0,
    revenueToday: 0,
    userGrowth: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas de usuarios
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*');
      
      // Obtener estadísticas de reservaciones
      const { data: reservations, error: reservationsError } = await supabaseAdmin
        .from('reservations')
        .select('*');
      
      // Obtener estadísticas de transacciones
      const { data: transactions, error: transactionsError } = await supabaseAdmin
        .from('transactions')
        .select('*');
      
      // Obtener estadísticas de feedback
      const { data: feedback, error: feedbackError } = await supabaseAdmin
        .from('feedback')
        .select('*');

      if (usersError) console.error('Error fetching users:', usersError);
      if (reservationsError) console.error('Error fetching reservations:', reservationsError);
      if (transactionsError) console.error('Error fetching transactions:', transactionsError);
      if (feedbackError) console.error('Error fetching feedback:', feedbackError);

      // Calcular estadísticas
      const totalUsers = users?.length || 0;
      const totalReservations = reservations?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const averageRating = feedback && feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length 
        : 0;
      
      const freeUsers = users?.filter(u => !u.is_premium).length || 0;
      const premiumUsers = users?.filter(u => u.is_premium).length || 0;
      
      // Ingresos de hoy
      const today = new Date().toISOString().split('T')[0];
      const revenueToday = transactions?.filter(t => 
        t.created_at?.startsWith(today)
      ).reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      // Generar datos de crecimiento de usuarios (últimos 6 meses)
      const userGrowth = [];
      const monthlyRevenue = [];
      const months = ['may', 'jun', 'jul', 'ago', 'sep', 'oct'];
      
      for (let i = 0; i < 6; i++) {
        const month = months[i];
        const year = '2025';
        
        // Contar usuarios registrados en cada mes
        const monthUsers = users?.filter(u => {
          if (!u.created_at) return false;
          const userMonth = new Date(u.created_at).toLocaleDateString('es-ES', { month: 'short' });
          return userMonth === month;
        }).length || 0;
        
        // Calcular ingresos del mes
        const monthRevenue = transactions?.filter(t => {
          if (!t.created_at) return false;
          const transactionMonth = new Date(t.created_at).toLocaleDateString('es-ES', { month: 'short' });
          return transactionMonth === month;
        }).reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        
        userGrowth.push({ month: `${month} ${year}`, count: monthUsers });
        monthlyRevenue.push({ month: `${month} ${year}`, amount: monthRevenue });
      }

      setStats({
        totalUsers,
        totalRevenue,
        totalReservations,
        averageRating: Math.round(averageRating * 10) / 10,
        freeUsers,
        premiumUsers,
        revenueToday,
        userGrowth,
        monthlyRevenue
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && trendValue && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="ml-1">{trendValue}</span>
                  </div>
                )}
              </dd>
              <dd className="text-sm text-gray-500">{subtitle}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Bienvenido al panel de administración de QR Tour</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                  <option>Últimos 30 días</option>
                  <option>Últimos 7 días</option>
                  <option>Últimos 90 días</option>
                </select>
                <button
                  onClick={fetchDashboardStats}
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
              <span className="text-sm text-gray-700">
                Hola, {user?.display_name || user?.email}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
            </div>
          ) : (
            <>
              {/* Resumen Financiero */}
              <div className="mb-8">
                <FinancialOverview />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                  title="Usuarios Totales"
                  value={stats.totalUsers}
                  subtitle="100% desde el mes pasado"
                  icon={Users}
                  trend="down"
                  trendValue="100%"
                />
                <StatCard
                  title="Ingresos Totales"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  subtitle="0% este mes"
                  icon={DollarSign}
                  trend="up"
                  trendValue="0%"
                />
                <StatCard
                  title="Reservaciones"
                  value={stats.totalReservations}
                  subtitle={`${stats.totalReservations} pendientes`}
                  icon={Calendar}
                />
                <StatCard
                  title="Calificación Promedio"
                  value={stats.averageRating}
                  subtitle={`${stats.totalReservations} reseñas`}
                  icon={Star}
                />
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                  title="Usuarios Gratuitos"
                  value={stats.freeUsers}
                  subtitle="Usuarios sin suscripción"
                  icon={Users}
                />
                <StatCard
                  title="Usuarios Premium"
                  value={stats.premiumUsers}
                  subtitle="Usuarios con suscripción"
                  icon={TrendingUp}
                />
                <StatCard
                  title="Ingresos Hoy"
                  value={`$${stats.revenueToday.toLocaleString()}`}
                  subtitle="Ingresos del día actual"
                  icon={DollarSign}
                />
                {/* Tarjeta opcional de testimonios: comentar o añadir métrica real cuando exista */}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Crecimiento de Usuarios</h3>
                    <p className="text-sm text-gray-500 mb-4">Evolución mensual de registros</p>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {stats.userGrowth.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-blue-500 w-8 rounded-t"
                            style={{ height: `${Math.max(item.count * 20, 10)}px` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2">{item.count}</span>
                          <span className="text-xs text-gray-400 mt-1">{item.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Usuarios Registrados
                    </div>
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ingresos Mensuales</h3>
                    <p className="text-sm text-gray-500 mb-4">Tendencia de ingresos por mes</p>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {stats.monthlyRevenue.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-green-500 w-8 rounded-t"
                            style={{ height: `${Math.max(item.amount * 2, 10)}px` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2">${item.amount}</span>
                          <span className="text-xs text-gray-400 mt-1">{item.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Ingresos ($)
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-8 text-center text-sm text-gray-500">
                Última actualización: {lastUpdated.toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
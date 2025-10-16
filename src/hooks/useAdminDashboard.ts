import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  // Usuarios
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByMonth: Array<{ month: string; count: number }>;
  
  // Ingresos
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueByMonth: Array<{ month: string; amount: number }>;
  
  // Planes
  totalPlans: number;
  activePlans: number;
  plansSold: number;
  popularPlan: string;
  
  // Contenido
  totalPlaces: number;
  totalExcursions: number;
  totalRestaurants: number;
  totalServices: number;
  totalQRCodes: number;
  
  // Reservaciones
  totalReservations: number;
  pendingReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  
  // Feedback y Testimonios
  totalFeedback: number;
  averageRating: number;
  publicTestimonials: number;
  pendingResponses: number;
  
  // Notificaciones
  totalNotifications: number;
  sentNotifications: number;
  pendingNotifications: number;
  
  // Actividad Reciente
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
  
  // Métricas de Crecimiento
  userGrowthRate: number;
  revenueGrowthRate: number;
  contentGrowthRate: number;
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching dashboard stats...');

      // Timeout de seguridad: si tarda más de 15 segundos, abortar
      timeoutId = setTimeout(() => {
        console.error('⏱️ TIMEOUT: Dashboard fetch tomó más de 15 segundos');
        setLoading(false);
        setError('Timeout de conexión. Presiona F5.');
      }, 15000); // Reducido a 15s ya que solo hay 3 queries

      // ✅ OPTIMIZACIÓN: Ejecutar queries en paralelo con Promise.allSettled
      console.log('🚀 Ejecutando queries en paralelo...');
      
      // ✅ REDUCIR A SOLO 3 QUERIES ESENCIALES (no 10) para evitar timeouts
      const [
        usersResult,
        feedbackResult,
        reservationsResult
      ] = await Promise.allSettled([
        supabase.from('users').select('id, created_at, plan_type').limit(1000),
        supabase.from('feedback').select('id, rating, created_at').limit(1000),
        supabase.from('reservations').select('id, status, created_at').limit(1000)
      ]);

      // Datos mock para las demás (temporalmente)
      const plansResult = { status: 'fulfilled' as const, value: { data: [] } };
      const transactionsResult = { status: 'fulfilled' as const, value: { data: [] } };
      const excursionsResult = { status: 'fulfilled' as const, value: { data: [] } };
      const restaurantsResult = { status: 'fulfilled' as const, value: { data: [] } };
      const servicesResult = { status: 'fulfilled' as const, value: { data: [] } };
      const qrCodesResult = { status: 'fulfilled' as const, value: { data: [] } };
      const notificationsResult = { status: 'fulfilled' as const, value: { data: [] } };

      // Extraer datos de resultados (manejar errores individualmente)
      const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
      const plans = plansResult.status === 'fulfilled' ? plansResult.value.data || [] : [];
      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data || [] : [];
      const excursions = excursionsResult.status === 'fulfilled' ? excursionsResult.value.data || [] : [];
      const restaurants = restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.data || [] : [];
      const services = servicesResult.status === 'fulfilled' ? servicesResult.value.data || [] : [];
      const qrCodes = qrCodesResult.status === 'fulfilled' ? qrCodesResult.value.data || [] : [];
      const reservations = reservationsResult.status === 'fulfilled' ? reservationsResult.value.data || [] : [];
      const feedback = feedbackResult.status === 'fulfilled' ? feedbackResult.value.data || [] : [];
      const notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value.data || [] : [];

      // Log de errores individuales si existen
      if (usersResult.status === 'rejected') console.warn('⚠️ Error users:', usersResult.reason);
      if (plansResult.status === 'rejected') console.warn('⚠️ Error plans:', plansResult.reason);
      if (transactionsResult.status === 'rejected') console.warn('⚠️ Error transactions:', transactionsResult.reason);
      if (excursionsResult.status === 'rejected') console.warn('⚠️ Error excursions:', excursionsResult.reason);
      if (restaurantsResult.status === 'rejected') console.warn('⚠️ Error restaurants:', restaurantsResult.reason);
      if (servicesResult.status === 'rejected') console.warn('⚠️ Error services:', servicesResult.reason);
      if (qrCodesResult.status === 'rejected') console.warn('⚠️ Error qr_codes:', qrCodesResult.reason);
      if (reservationsResult.status === 'rejected') console.warn('⚠️ Error reservations:', reservationsResult.reason);
      if (feedbackResult.status === 'rejected') console.warn('⚠️ Error feedback:', feedbackResult.reason);
      if (notificationsResult.status === 'rejected') console.warn('⚠️ Error notifications:', notificationsResult.reason);

      console.log('✅ Queries completadas en paralelo');

      // Places no existe como tabla
      const places = [];

      // Calcular estadísticas de usuarios
      const totalUsers = users.length;
      const freeUsers = users.filter(user => user.plan_type === 'free').length;
      const premiumUsers = users.filter(user => user.plan_type !== 'free').length;

      // Calcular usuarios por período
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newUsersToday = users.filter(user => new Date(user.created_at) >= today).length;
      const newUsersThisWeek = users.filter(user => new Date(user.created_at) >= thisWeek).length;
      const newUsersThisMonth = users.filter(user => new Date(user.created_at) >= thisMonth).length;

      // Calcular usuarios por mes (últimos 6 meses)
      const usersByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = users.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= month && userDate < nextMonth;
        }).length;
        usersByMonth.push({
          month: month.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          count
        });
      }

      // Calcular estadísticas de ingresos
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const revenueToday = completedTransactions.filter(t => new Date(t.created_at) >= today)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const revenueThisWeek = completedTransactions.filter(t => new Date(t.created_at) >= thisWeek)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const revenueThisMonth = completedTransactions.filter(t => new Date(t.created_at) >= thisMonth)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calcular ingresos por mes (últimos 6 meses)
      const revenueByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const amount = completedTransactions.filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate >= month && transactionDate < nextMonth;
        }).reduce((sum, t) => sum + (t.amount || 0), 0);
        revenueByMonth.push({
          month: month.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          amount
        });
      }

      // Calcular estadísticas de planes
      const totalPlans = plans.length;
      const activePlans = plans.filter(plan => plan.is_active).length;
      const plansSold = completedTransactions.length;
      
      // Plan más popular
      const planSales = completedTransactions.reduce((acc, t) => {
        const planId = t.plan_id || 'free';
        acc[planId] = (acc[planId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // También contar por plan_type de usuarios
      const userPlanCounts = users.reduce((acc, u) => {
        acc[u.plan_type] = (acc[u.plan_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const popularPlan = Object.entries(userPlanCounts).reduce((a, b) => 
        userPlanCounts[a[0]] > userPlanCounts[b[0]] ? a : b, ['free', 0]
      )[0];

      // Calcular estadísticas de contenido
      const totalPlaces = places.length;
      const totalExcursions = excursions.length;
      const totalRestaurants = restaurants.length;
      const totalServices = services.length;
      const totalQRCodes = qrCodes.length;

      // Calcular estadísticas de reservaciones
      const totalReservations = reservations.length;
      const pendingReservations = reservations.filter(r => r.status === 'pending').length;
      const completedReservations = reservations.filter(r => r.status === 'completed').length;
      const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;

      // Calcular estadísticas de feedback
      const totalFeedback = feedback.length;
      const averageRating = feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
        : 0;
      const publicTestimonials = feedback.filter(f => f.is_public).length;
      const pendingResponses = feedback.filter(f => !f.admin_response).length;

      // Calcular estadísticas de notificaciones
      const totalNotifications = notifications.length;
      const sentNotifications = notifications.filter(n => n.status === 'sent').length;
      const pendingNotifications = notifications.filter(n => n.status === 'pending').length;

      // Crear actividad reciente (simulada basada en datos reales)
      const recentActivity = [
        ...users.slice(-5).map(user => ({
          id: user.id,
          type: 'user',
          description: 'Nuevo usuario registrado',
          timestamp: user.created_at,
          user: user.id
        })),
        ...completedTransactions.slice(-3).map(transaction => ({
          id: transaction.id,
          type: 'payment',
          description: `Pago procesado: $${transaction.amount}`,
          timestamp: transaction.created_at
        })),
        ...feedback.slice(-2).map(fb => ({
          id: fb.id,
          type: 'feedback',
          description: 'Nuevo feedback recibido',
          timestamp: fb.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 10);

      // Calcular tasas de crecimiento
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const lastMonthUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= lastMonth && userDate < thisMonthStart;
      }).length;
      
      const thisMonthUsers = newUsersThisMonth;
      const userGrowthRate = lastMonthUsers > 0 
        ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
        : 0;

      const lastMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?.amount || 0;
      const thisMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?.amount || 0;
      const revenueGrowthRate = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const contentGrowthRate = 0; // Se puede calcular si se necesita

      const dashboardStats: DashboardStats = {
        // Usuarios
        totalUsers,
        freeUsers,
        premiumUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        usersByMonth,
        
        // Ingresos
        totalRevenue,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        revenueByMonth,
        
        // Planes
        totalPlans,
        activePlans,
        plansSold,
        popularPlan,
        
        // Contenido
        totalPlaces,
        totalExcursions,
        totalRestaurants,
        totalServices,
        totalQRCodes,
        
        // Reservaciones
        totalReservations,
        pendingReservations,
        completedReservations,
        cancelledReservations,
        
        // Feedback y Testimonios
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        publicTestimonials,
        pendingResponses,
        
        // Notificaciones
        totalNotifications,
        sentNotifications,
        pendingNotifications,
        
        // Actividad Reciente
        recentActivity,
        
        // Métricas de Crecimiento
        userGrowthRate: Math.round(userGrowthRate * 10) / 10,
        revenueGrowthRate: Math.round(revenueGrowthRate * 10) / 10,
        contentGrowthRate
      };

      console.log('✅ Dashboard stats calculated:', dashboardStats);
      console.log('📊 Stats details:', {
        totalUsers: dashboardStats.totalUsers,
        totalRevenue: dashboardStats.totalRevenue,
        totalExcursions: dashboardStats.totalExcursions,
        totalRestaurants: dashboardStats.totalRestaurants,
        totalServices: dashboardStats.totalServices,
        totalQRCodes: dashboardStats.totalQRCodes,
        totalReservations: dashboardStats.totalReservations,
        totalFeedback: dashboardStats.totalFeedback,
        totalNotifications: dashboardStats.totalNotifications
      });
      setStats(dashboardStats);
      
      // Limpiar timeout si todo salió bien
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard stats:', err);
      console.error('❌ Error details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard. Recarga la página.');
      
      // Limpiar timeout en caso de error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Dashboard fetch completed, loading set to false');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let hasStarted = false; // Prevenir múltiples ejecuciones
    
    const loadData = async () => {
      if (!isMounted || hasStarted) return;
      hasStarted = true;
      
      console.log('📊 Iniciando carga de dashboard...');
      
      try {
        await fetchDashboardStats();
      } catch (err) {
        console.error('❌ Error crítico cargando dashboard:', err);
        // Asegurar que loading se desactive incluso con error
        if (isMounted) {
          setLoading(false);
          setError('Error al cargar dashboard. Recarga la página (F5).');
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Solo al montar, UNA VEZ

  console.log('🔄 Hook returning:', { stats: !!stats, loading, error });
  
  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};

// Hook personalizado para métricas del dashboard
import { useState, useEffect } from 'react';
import { 
  userService, 
  destinationsService, 
  scansService, 
  reservationsService, 
  feedbackService,
  advertisementsService,
  plansService
} from '../services/supabaseServices';

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    users: {
      total: 0,
      active: 0,
      premium: 0,
      loading: true
    },
    destinations: {
      total: 0,
      featured: 0,
      loading: true
    },
    scans: {
      total: 0,
      today: 0,
      weekly: 0,
      loading: true
    },
    reservations: {
      total: 0,
      pending: 0,
      confirmed: 0,
      loading: true
    },
    feedback: {
      total: 0,
      positive: 0,
      negative: 0,
      loading: true
    },
    revenue: {
      total: 0,
      monthly: 0,
      loading: true
    },
    advertisements: {
      total: 0,
      active: 0,
      impressions: 0,
      loading: true
    }
  });

  const [charts, setCharts] = useState({
    userGrowth: [],
    scanActivity: [],
    reservationTrends: [],
    feedbackDistribution: [],
    revenueChart: [],
    adPerformance: [],
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState({
    scans: [],
    reservations: [],
    feedback: [],
    loading: true
  });

  // Cargar métricas básicas
  const loadBasicMetrics = async () => {
    try {
      // Usuarios
      const userStats = await userService.getUserStats();
      if (!userStats.error) {
        setMetrics(prev => ({
          ...prev,
          users: {
            ...prev.users,
            ...userStats.data,
            loading: false
          }
        }));
      }

      // Destinos
      const { data: destinations, error: destError } = await destinationsService.getAllDestinations(1, 1000);
      if (!destError) {
        const featured = destinations.filter(d => d.is_featured).length;
        setMetrics(prev => ({
          ...prev,
          destinations: {
            total: destinations.length,
            featured: featured,
            loading: false
          }
        }));
      }

      // Escaneos
      const scanStats = await scansService.getScanStats();
      if (!scanStats.error) {
        setMetrics(prev => ({
          ...prev,
          scans: {
            ...scanStats.data,
            loading: false
          }
        }));
      }

      // Reservaciones
      const { data: reservations, error: resError } = await reservationsService.getAllReservations(1, 1000);
      if (!resError) {
        const pending = reservations.filter(r => r.status === 'pending').length;
        const confirmed = reservations.filter(r => r.status === 'confirmed').length;
        setMetrics(prev => ({
          ...prev,
          reservations: {
            total: reservations.length,
            pending: pending,
            confirmed: confirmed,
            loading: false
          }
        }));
      }

      // Feedback
      const feedbackStats = await feedbackService.getFeedbackStats();
      if (!feedbackStats.error) {
        setMetrics(prev => ({
          ...prev,
          feedback: {
            ...feedbackStats.data,
            loading: false
          }
        }));
      }

      // Anuncios
      const { data: ads, error: adsError } = await advertisementsService.getAllAdvertisements(1, 1000);
      if (!adsError) {
        const active = ads.filter(ad => ad.status === 'active').length;
        const impressions = ads.reduce((sum, ad) => sum + (parseInt(ad.current_impressions) || 0), 0);
        setMetrics(prev => ({
          ...prev,
          advertisements: {
            total: ads.length,
            active: active,
            impressions: impressions,
            loading: false
          }
        }));
      }

    } catch (error) {
      console.error('Error loading basic metrics:', error);
    }
  };

  // Cargar datos para gráficos
  const loadChartData = async () => {
    try {
      // Datos de crecimiento de usuarios (últimos 6 meses)
      const userGrowthData = await generateUserGrowthData();
      
      // Datos de actividad de escaneos (últimos 7 días)
      const scanActivityData = await generateScanActivityData();
      
      // Datos de tendencias de reservaciones (últimos 30 días)
      const reservationTrendsData = await generateReservationTrendsData();
      
      // Distribución de feedback
      const feedbackDistributionData = await generateFeedbackDistributionData();
      
      // Datos de ingresos
      const revenueData = await generateRevenueData();
      
      // Rendimiento de anuncios
      const adPerformanceData = await generateAdPerformanceData();

      setCharts({
        userGrowth: userGrowthData,
        scanActivity: scanActivityData,
        reservationTrends: reservationTrendsData,
        feedbackDistribution: feedbackDistributionData,
        revenueChart: revenueData,
        adPerformance: adPerformanceData,
        loading: false
      });

    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  // Cargar actividad reciente
  const loadRecentActivity = async () => {
    try {
      // Escaneos recientes
      const { data: recentScans } = await scansService.getAllScans(1, 5);
      
      // Reservaciones recientes
      const { data: recentReservations } = await reservationsService.getAllReservations(1, 5);
      
      // Feedback reciente
      const { data: recentFeedback } = await feedbackService.getAllFeedback(1, 5);

      setRecentActivity({
        scans: recentScans || [],
        reservations: recentReservations || [],
        feedback: recentFeedback || [],
        loading: false
      });

    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  // Funciones auxiliares para generar datos de gráficos REALES
  const generateUserGrowthData = async () => {
    try {
      // Obtener datos reales de usuarios por mes
      const { data: users } = await userService.getAllUsers(1, 1000);
      if (!users) return [];
      
      // Agrupar usuarios por mes de creación
      const userGrowth = {};
      users.forEach(user => {
        const month = new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short' });
        userGrowth[month] = (userGrowth[month] || 0) + 1;
      });
      
      return Object.entries(userGrowth).map(([month, count]) => ({
        month,
        users: count
      }));
    } catch (error) {
      console.error('Error generating user growth data:', error);
      return [];
    }
  };

  const generateScanActivityData = async () => {
    try {
      // Obtener datos reales de escaneos por día
      const { data: scans } = await scansService.getAllScans(1, 1000);
      if (!scans) return [];
      
      // Agrupar escaneos por día de la semana
      const scanActivity = {};
      scans.forEach(scan => {
        const day = new Date(scan.created_at).toLocaleDateString('es-ES', { weekday: 'short' });
        scanActivity[day] = (scanActivity[day] || 0) + 1;
      });
      
      return Object.entries(scanActivity).map(([day, count]) => ({
        day,
        scans: count
      }));
    } catch (error) {
      console.error('Error generating scan activity data:', error);
      return [];
    }
  };

  const generateReservationTrendsData = async () => {
    try {
      // Obtener datos reales de reservaciones
      const { data: reservations } = await reservationsService.getAllReservations(1, 1000);
      if (!reservations) return [];
      
      // Agrupar reservaciones por semana
      const reservationTrends = {};
      reservations.forEach(reservation => {
        const week = `Sem ${Math.ceil(new Date(reservation.created_at).getDate() / 7)}`;
        reservationTrends[week] = (reservationTrends[week] || 0) + 1;
      });
      
      return Object.entries(reservationTrends).map(([week, count]) => ({
        week,
        reservations: count
      }));
    } catch (error) {
      console.error('Error generating reservation trends data:', error);
      return [];
    }
  };

  const generateFeedbackDistributionData = async () => {
    try {
      // Obtener datos reales de feedback
      const { data: feedback } = await feedbackService.getAllFeedback(1, 1000);
      if (!feedback) return [];
      
      // Agrupar feedback por rating
      const feedbackDistribution = {};
      feedback.forEach(fb => {
        const rating = `${fb.rating || 5} estrellas`;
        feedbackDistribution[rating] = (feedbackDistribution[rating] || 0) + 1;
      });
      
      return Object.entries(feedbackDistribution).map(([rating, count]) => ({
        rating,
        count
      }));
    } catch (error) {
      console.error('Error generating feedback distribution data:', error);
      return [];
    }
  };

  const generateRevenueData = async () => {
    try {
      // Obtener datos reales de planes y usuarios premium
      const { data: plans } = await plansService.getAllPlans(1, 1000);
      const { data: users } = await userService.getAllUsers(1, 1000);
      
      if (!plans || !users) return [];
      
      // Calcular ingresos por mes basado en usuarios premium
      const revenueData = {};
      users.forEach(user => {
        if (user.plan_type === 'premium') {
          const month = new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short' });
          const plan = plans.find(p => p.plan_key === user.plan_type);
          const revenue = plan ? plan.price_usd : 0;
          revenueData[month] = (revenueData[month] || 0) + revenue;
        }
      });
      
      return Object.entries(revenueData).map(([month, revenue]) => ({
        month,
        revenue
      }));
    } catch (error) {
      console.error('Error generating revenue data:', error);
      return [];
    }
  };

  const generateAdPerformanceData = async () => {
    try {
      // Obtener datos reales de anuncios
      const { data: ads } = await advertisementsService.getAllAdvertisements(1, 1000);
      if (!ads) return [];
      
      return ads.map(ad => ({
        ad: ad.title_es || ad.title_en || 'Sin título',
        impressions: parseInt(ad.current_impressions) || 0,
        clicks: parseInt(ad.current_impressions) * 0.05 || 0 // Estimación de clicks
      }));
    } catch (error) {
      console.error('Error generating ad performance data:', error);
      return [];
    }
  };

  // Cargar todos los datos
  const loadAllData = async () => {
    setMetrics(prev => ({
      ...prev,
      users: { ...prev.users, loading: true },
      destinations: { ...prev.destinations, loading: true },
      scans: { ...prev.scans, loading: true },
      reservations: { ...prev.reservations, loading: true },
      feedback: { ...prev.feedback, loading: true },
      advertisements: { ...prev.advertisements, loading: true }
    }));

    setCharts(prev => ({ ...prev, loading: true }));
    setRecentActivity(prev => ({ ...prev, loading: true }));

    await Promise.all([
      loadBasicMetrics(),
      loadChartData(),
      loadRecentActivity()
    ]);
  };

  // Refrescar datos
  const refreshData = () => {
    loadAllData();
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    metrics,
    charts,
    recentActivity,
    refreshData,
    loading: metrics.users.loading || charts.loading || recentActivity.loading
  };
};

export default useDashboardMetrics;

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Users, DollarSign, TrendingUp, Star,
  MessageSquare, Bell, MapPin, Calendar, QrCode, Utensils,
  Bus, Camera, RefreshCw,
  BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

const DashboardSimple = () => {
  const { stats, loading, error, refetch } = useAdminDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Debug logs
  console.log('🔍 Dashboard Simple Debug:', { stats, loading, error });

  const handleRefresh = async () => {
    try {
      await refetch();
      console.log('✅ Dashboard actualizado');
    } catch (err) {
      console.error('❌ Error actualizando dashboard:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Simple</h2>
          <p className="text-gray-600">Resumen general del sistema</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuarios Totales */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {stats.userGrowthRate >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stats.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.userGrowthRate)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos Totales */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {stats.revenueGrowthRate >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stats.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.revenueGrowthRate)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservaciones */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservaciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {stats.pendingReservations} pendientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calificación Promedio */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-sm text-gray-500">
                  {stats.totalFeedback} reseñas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Usuarios Gratuitos</p>
                <p className="text-lg font-bold text-gray-900">{stats.freeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Usuarios Premium</p>
                <p className="text-lg font-bold text-gray-900">{stats.premiumUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-lg font-bold text-gray-900">${stats.revenueToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Testimonios Públicos</p>
                <p className="text-lg font-bold text-gray-900">{stats.publicTestimonials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Contenido del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlaces}</p>
              <p className="text-sm text-gray-600">Lugares</p>
            </div>
            <div className="text-center">
              <Camera className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalExcursions}</p>
              <p className="text-sm text-gray-600">Excursiones</p>
            </div>
            <div className="text-center">
              <Utensils className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</p>
              <p className="text-sm text-gray-600">Restaurantes</p>
            </div>
            <div className="text-center">
              <Bus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              <p className="text-sm text-gray-600">Servicios</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSimple;




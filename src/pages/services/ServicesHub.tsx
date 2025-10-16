import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Utensils, ShoppingCart, Car, Users, Mountain, Bus, Calendar,
  Pill, Hotel, Home, Coffee, Store, Briefcase, Wrench, Scissors, Dumbbell, Heart, Plane
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TileProps { icon: React.ReactNode; title: string; desc: string; to: string; count?: number | null; gradient?: string }

const ServiceTile: React.FC<TileProps> = ({ icon, title, desc, to, count, gradient }) => {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-2xl p-6 bg-white border hover:shadow-lg transition-all flex flex-col justify-between"
      onClick={() => navigate(to)}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-white mb-3 ${gradient || 'bg-blue-600'}`}>
        {icon}
      </div>
      <div className="font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
      {typeof count === 'number' && (
        <div className="mt-3 text-xs text-gray-500">{count} elementos</div>
      )}
    </div>
  );
};

const ServicesHub: React.FC = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<{[k: string]: number | null}>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolver la ruta de navegación real según la categoría
  const resolveCategoryRoute = (category: any): string => {
    const id: string = category?.id || '';
    const route: string = category?.route || '';

    // Preferir por ID cuando esté disponible
    const idMap: Record<string, string> = {
      'category-restaurants': '/restaurants',
      'category-supermarkets': '/supermarkets',
      'category-taxis': '/taxis',
      'category-guides': '/guides',
      'category-excursions': '/excursions',
      'category-buses': '/buses',
      'category-events': '/events',
      // Farmacias no tiene página dedicada aún → usar ruta de BD
    };

    if (id && idMap[id]) return idMap[id];

    // Fallback por ruta almacenada en BD
    const routeMap: Record<string, string> = {
      '/services/restaurants': '/restaurants',
      '/services/supermarkets': '/supermarkets',
      '/services/taxis': '/taxis',
      '/services/guides': '/guides',
      '/services/excursions': '/excursions',
      '/services/buses': '/buses',
      '/services/events': '/events',
    };

    if (route && routeMap[route]) return routeMap[route];

    // Último recurso: dejar la ruta tal cual (para categorías genéricas)
    return route || '/services';
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        console.log('🔄 ServicesHub: Iniciando carga de categorías...');
        
        // Cargar categorías desde la base de datos
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        console.log('📊 ServicesHub: Respuesta de categorías:', { 
          data: categoriesData, 
          error: categoriesError,
          count: categoriesData?.length 
        });

        if (categoriesError) {
          console.error('❌ ServicesHub: Error cargando categorías:', categoriesError);
        } else {
          console.log('✅ ServicesHub: Categorías cargadas exitosamente:', categoriesData);
          if (isMounted) setCategories(categoriesData || []);
        }

        // Cargar conteos de elementos
        console.log('🔄 ServicesHub: Cargando conteos...');
        const tables = [
          { key: 'restaurants', table: 'restaurants' },
          { key: 'supermarkets', table: 'supermarkets' },
          { key: 'taxis', table: 'taxi_drivers' },
          { key: 'guides', table: 'tourist_guides' },
          { key: 'excursions', table: 'excursions' },
          { key: 'buses', table: 'buss' },
          { key: 'events', table: 'events' },
          { key: 'pharmacies', table: 'pharmacies' },
        ];
        const results = await Promise.all(
          tables.map(async t => {
            const { data, error, count } = await supabase
              .from(t.table)
              .select('id', { count: 'exact', head: false })
              .limit(1);
            if (error) {
              // Si la tabla no existe o no hay permisos, no bloquear: devolver null
              console.warn(`⚠️ Conteo no disponible para ${t.table}:`, error?.message || error);
              return [t.key, null] as const;
            }
            const result = [t.key, typeof count === 'number' ? count : (data ? data.length : 0)] as const;
            console.log(`📊 Conteo de ${t.table}:`, result[1]);
            return result;
          })
        );
        console.log('📊 ServicesHub: Conteos finales:', Object.fromEntries(results));
        if (isMounted) setCounts(Object.fromEntries(results));
      } catch (error) {
        console.error('❌ ServicesHub: Error general:', error);
        if (isMounted) setCounts({});
      } finally {
        console.log('✅ ServicesHub: Finalizando carga...');
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Función para obtener el componente de icono
  const getIconComponent = (iconStr: string) => {
    // Primero verificar si es un emoji (1-2 caracteres)
    if (iconStr && iconStr.length <= 2) {
      // Usar los iconos de Lucide en lugar de mostrar el emoji directamente
      const emojiToIconMap: {[key: string]: React.ReactNode} = {
        '🍴': <Utensils className="w-6 h-6" />,
        '🛒': <ShoppingCart className="w-6 h-6" />,
        '🚖': <Car className="w-6 h-6" />,
        '👨‍🏫': <Users className="w-6 h-6" />,
        '⛰️': <Mountain className="w-6 h-6" />,
        '🚌': <Bus className="w-6 h-6" />,
        '📅': <Calendar className="w-6 h-6" />,
        '💊': <Pill className="w-6 h-6" />,
        '🏨': <Hotel className="w-6 h-6" />,
        '🏠': <Home className="w-6 h-6" />,
        '☕': <Coffee className="w-6 h-6" />,
        '🛍️': <Store className="w-6 h-6" />,
        '💼': <Briefcase className="w-6 h-6" />,
        '🔧': <Wrench className="w-6 h-6" />,
        '💇': <Scissors className="w-6 h-6" />,
        '💪': <Dumbbell className="w-6 h-6" />,
        '❤️': <Heart className="w-6 h-6" />,
        '✈️': <Plane className="w-6 h-6" />,
        '🎭': <Calendar className="w-6 h-6" />,
        '🎨': <Briefcase className="w-6 h-6" />,
        '📚': <Store className="w-6 h-6" />,
        '🏖️': <Mountain className="w-6 h-6" />
      };
      return emojiToIconMap[iconStr] || <Briefcase className="w-6 h-6" />;
    }
    
    // Si es un nombre de icono de Lucide, usarlo directamente
    const iconMap: {[key: string]: React.ReactNode} = {
      'Utensils': <Utensils className="w-6 h-6" />,
      'ShoppingCart': <ShoppingCart className="w-6 h-6" />,
      'Car': <Car className="w-6 h-6" />,
      'Users': <Users className="w-6 h-6" />,
      'Mountain': <Mountain className="w-6 h-6" />,
      'Bus': <Bus className="w-6 h-6" />,
      'Calendar': <Calendar className="w-6 h-6" />,
      'Pill': <Pill className="w-6 h-6" />,
      'Hotel': <Hotel className="w-6 h-6" />,
      'Home': <Home className="w-6 h-6" />,
      'Coffee': <Coffee className="w-6 h-6" />,
      'Store': <Store className="w-6 h-6" />,
      'Briefcase': <Briefcase className="w-6 h-6" />,
      'Wrench': <Wrench className="w-6 h-6" />,
      'Scissors': <Scissors className="w-6 h-6" />,
      'Dumbbell': <Dumbbell className="w-6 h-6" />,
      'Heart': <Heart className="w-6 h-6" />,
      'Plane': <Plane className="w-6 h-6" />
    };
    return iconMap[iconStr] || <Briefcase className="w-6 h-6" />;
  };

  // Mapear categorías a claves de conteo
  const getCategoryCount = (categoryId: string) => {
    const countMap: {[key: string]: string} = {
      'category-restaurants': 'restaurants',
      'category-supermarkets': 'supermarkets',
      'category-taxis': 'taxis',
      'category-guides': 'guides',
      'category-excursions': 'excursions',
      'category-buses': 'buses',
      'category-events': 'events',
      'category-pharmacies': 'pharmacies'
    };
    const countKey = countMap[categoryId];
    return countKey ? counts[countKey] ?? null : null;
  };

  if (loading) {
    console.log('🔄 ServicesHub: Mostrando loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  console.log('🔄 ServicesHub: Renderizando con:', { 
    categoriesCount: categories.length, 
    categories: categories,
    counts: counts 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Servicios y Restaurantes</h1>
        <p className="text-gray-600 mb-8">Restaurantes cercanos, Supermercados, Taxis, Guías, Excursiones, Buses y Eventos</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <ServiceTile 
              key={category.id}
              gradient={category.gradient}
              icon={getIconComponent(category.icon)}
              title={category.name}
              desc={category.description}
              to={resolveCategoryRoute(category)}
              count={getCategoryCount(category.id)}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay categorías disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesHub;
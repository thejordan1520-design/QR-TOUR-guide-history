import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Phone, Globe, Star, Clock, Heart, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRealtimeOrderSync } from '../../services/realtimeOrderSync';

interface Service {
  id: string;
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  image_url?: string;
  price?: string;
  rating?: number;
  category: string;
  service_type: string;
  is_active: boolean;
  created_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  gradient: string;
  route: string;
  is_active: boolean;
}

const ServiceCategoryPage: React.FC = () => {
  const { categoryRoute } = useParams<{ categoryRoute: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirigir slugs conocidos a sus páginas dedicadas
  useEffect(() => {
    const redirectMap: Record<string, string> = {
      restaurants: '/restaurants',
      supermarkets: '/supermarkets',
      taxis: '/taxis',
      guides: '/guides',
      excursions: '/excursions',
      buses: '/buses',
      events: '/events'
    };
    if (categoryRoute && redirectMap[categoryRoute]) {
      navigate(redirectMap[categoryRoute], { replace: true });
    }
  }, [categoryRoute, navigate]);

  useEffect(() => {
    const fetchCategoryAndServices = async () => {
      if (!categoryRoute) {
        setError('Categoría no encontrada');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar la categoría por su ruta
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('route', `/services/${categoryRoute}`)
          .eq('is_active', true)
          .single();

        if (categoryError || !categoryData) {
          setError('Categoría no encontrada');
          setLoading(false);
          return;
        }

        setCategory(categoryData);

        // Buscar servicios que pertenezcan a esta categoría
        // Buscar en la tabla services donde category coincida con el nombre de la categoría
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('category', categoryData.name)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (servicesError) {
          console.error('Error cargando servicios:', servicesError);
          setServices([]);
        } else {
          setServices(servicesData || []);
        }

      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar la categoría');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndServices();
  }, [categoryRoute]);

  // Realtime para cambios en servicios de esta categoría
  useRealtimeOrderSync(['services'], () => {
    if (!category) return;
    (async () => {
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('category', category.name)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      setServices(servicesData || []);
    })();
  });

  const getIconComponent = (iconStr: string) => {
    // Mapeo de emojis a iconos de Lucide
    const emojiToIconMap: {[key: string]: string} = {
      '🍴': 'Utensils',
      '🛒': 'ShoppingCart',
      '🚖': 'Car',
      '👨‍🏫': 'Users',
      '⛰️': 'Mountain',
      '🚌': 'Bus',
      '📅': 'Calendar',
      '💊': 'Pill',
      '🏨': 'Hotel',
      '🏠': 'Home',
      '☕': 'Coffee',
      '🛍️': 'Store',
      '💼': 'Briefcase',
      '🔧': 'Wrench',
      '💇': 'Scissors',
      '💪': 'Dumbbell',
      '❤️': 'Heart',
      '✈️': 'Plane'
    };
    
    return emojiToIconMap[iconStr] || 'Briefcase';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categoría...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Categoría no encontrada</h1>
          <p className="text-gray-600 mb-6">La categoría que buscas no existe o no está disponible.</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Servicios
          </button>
          
          <div className="flex items-center mb-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white mr-4 ${category.gradient}`}>
              <span className="text-2xl">{category.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {services.length} {services.length === 1 ? 'servicio' : 'servicios'} disponible{services.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Service Image */}
                {service.image_url && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Service Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    {service.rating && (
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="text-sm font-medium">{service.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                  )}
                  
                  {/* Service Details */}
                  <div className="space-y-2 mb-4">
                    {service.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{service.location}</span>
                      </div>
                    )}
                    
                    {service.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{service.phone}</span>
                      </div>
                    )}
                    
                    {service.price && (
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <span>{service.price}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {service.website_url && (
                      <a
                        href={service.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Globe className="w-4 h-4 inline mr-1" />
                        Sitio Web
                      </a>
                    )}
                    
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-4 ${category.gradient}`}>
              <span className="text-2xl">{category.icon}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios disponibles</h3>
            <p className="text-gray-600">Esta categoría aún no tiene servicios registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCategoryPage;




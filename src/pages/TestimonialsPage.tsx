import React, { useEffect, useState } from 'react';
import { Star, Quote, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface Testimony {
  id: string;
  rating: number;
  comment: string;
  category: string;
  destination_title: string | null;
  admin_response: string | null;
  created_at: string;
  user?: {
    display_name?: string;
    email?: string;
  };
}

const TestimonialsPage: React.FC = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3'>('all');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      console.log('📰 Cargando testimonios publicados...');
      
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          rating,
          comment,
          category,
          destination_title,
          admin_response,
          created_at,
          user:users!feedback_user_id_fkey (
            display_name,
            email
          )
        `)
        .eq('is_published', true)
        .eq('is_public', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error cargando testimonios:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} testimonios cargados`);
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'suggestion': 'bg-blue-100 text-blue-800',
      'compliment': 'bg-green-100 text-green-800',
      'bug': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true;
    return t.rating.toString() === filter;
  });

  const averageRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando testimonios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Quote className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lo que Dicen Nuestros Visitantes
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Experiencias reales de personas que exploraron Puerto Plata con QR Tour
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold">{testimonials.length}</div>
              <div className="text-blue-200 text-sm">Testimonios</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">{averageRating}</span>
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-blue-200 text-sm">Calificación Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('5')}
            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1 ${
              filter === '5'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            5 <Star className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => setFilter('4')}
            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1 ${
              filter === '4'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            4+ <Star className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Testimonials Grid */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay testimonios disponibles aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimony) => (
              <div
                key={testimony.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header with Rating */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {(testimony.user?.display_name || testimony.user?.email || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {testimony.user?.display_name || testimony.user?.email?.split('@')[0] || 'Usuario Verificado'}
                        </p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(testimony.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {getRatingStars(testimony.rating)}
                    <span className="ml-1 text-sm font-medium text-gray-700">{testimony.rating}/5</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {testimony.destination_title && (
                    <div className="flex items-center gap-1 text-blue-600 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{testimony.destination_title}</span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 w-6 h-6 text-blue-200" />
                    <p className="text-gray-700 pl-6 text-sm leading-relaxed">
                      {testimony.comment}
                    </p>
                  </div>

                  {testimony.admin_response && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-blue-600 mb-2">📩 Respuesta de QR Tour:</p>
                      <p className="text-gray-600 text-xs leading-relaxed bg-blue-50 p-3 rounded-lg">
                        {testimony.admin_response}
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(testimony.category)}`}>
                      {testimony.category === 'compliment' && '👍 Elogio'}
                      {testimony.category === 'suggestion' && '💡 Sugerencia'}
                      {testimony.category === 'bug' && '⚠️ Problema'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Has probado QR Tour?
          </h2>
          <p className="text-gray-600 mb-6">
            Comparte tu experiencia y ayuda a otros viajeros a descubrir Puerto Plata
          </p>
          <button
            onClick={() => window.location.href = '/feedback'}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Dejar mi Testimonio
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;





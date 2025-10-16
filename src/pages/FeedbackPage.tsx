import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Star, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { feedbackService } from '../services/supabaseServices';
import FeedbackForm from '../components/ui/FeedbackForm';
import { supabase } from '../lib/supabase';

interface Feedback {
  id: string;
  user_id: string;
  destination_id?: string;
  destination_title?: string;
  destination_description?: string;
  rating: number;
  comment: string;
  category: string;
  is_public: boolean;
  admin_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

const FeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [user, currentPage]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Cambio detectado en feedback:', payload);
          // Recargar feedback cuando hay cambios
          loadFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error, count } = await feedbackService.getUserFeedback(
        user?.id,
        currentPage,
        itemsPerPage
      );

      if (error) {
        setError('Error al cargar feedback');
        console.error('Error loading feedback:', error);
        return;
      }

      setFeedback(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (err) {
      setError('Error al cargar feedback');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = () => {
    setShowFeedbackForm(false);
    loadFeedback(); // Recargar la lista
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destination_title && item.destination_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesRating = filterRating === 'all' || 
      (filterRating === 'high' && item.rating >= 4) ||
      (filterRating === 'medium' && item.rating >= 3 && item.rating < 4) ||
      (filterRating === 'low' && item.rating < 3);

    return matchesSearch && matchesCategory && matchesRating;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'suggestion': return '💡';
      case 'bug': return '⚠️';
      case 'compliment': return '👍';
      case 'general': return '💬';
      case 'feature': return '✨';
      case 'improvement': return '🚀';
      case 'other': return '📝';
      default: return '💬';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'suggestion': return 'Sugerencia';
      case 'bug': return 'Algo no está bien';
      case 'compliment': return 'Elogio';
      case 'general': return 'General';
      case 'feature': return 'Nueva Funcionalidad';
      case 'improvement': return 'Mejora';
      case 'other': return 'Otro';
      default: return 'General';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-100">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Inicia sesión para ver tu feedback
          </h2>
          <p className="text-gray-600">
            Necesitas estar autenticado para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mi Feedback
              </h1>
              <p className="text-gray-600">
                Gestiona tus comentarios y sugerencias
              </p>
            </div>
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Feedback
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar en feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                <option value="suggestion">Sugerencia</option>
                <option value="bug">Algo no está bien</option>
                <option value="compliment">Elogio</option>
                <option value="general">General</option>
                <option value="feature">Nueva Funcionalidad</option>
                <option value="improvement">Mejora</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las calificaciones</option>
                <option value="high">Alta (4-5 estrellas)</option>
                <option value="medium">Media (3 estrellas)</option>
                <option value="low">Baja (1-2 estrellas)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadFeedback}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('feedback.retry')}
                </button>
              </div>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('feedback.no_feedback_yet')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('feedback.share_experience')}
                </p>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('feedback.create_first_feedback')}
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFeedback.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getCategoryLabel(item.category)}
                          </h3>
                          {item.destination_title && (
                            <p className="text-sm text-gray-600">
                              Sobre: {item.destination_title}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= item.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`ml-2 text-sm font-medium ${getRatingColor(item.rating)}`}>
                          {item.rating}/5
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 mb-4">{item.comment}</p>

                      {/* Admin Response */}
                      {item.admin_response && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Respuesta del administrador
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">{item.admin_response}</p>
                          {item.responded_at && (
                            <p className="text-xs text-blue-600 mt-2">
                              Respondido el {new Date(item.responded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            {item.is_public ? (
                              <>
                                <Eye className="w-4 h-4" />
                                Público
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Privado
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Form Modal */}
        <FeedbackForm
          isOpen={showFeedbackForm}
          onClose={() => setShowFeedbackForm(false)}
          onSuccess={handleFeedbackSubmit}
        />
      </div>
    </div>
  );
};

export default FeedbackPage;

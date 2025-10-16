import { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../services/supabaseServices';
import { supabase } from '../lib/supabase';

interface Feedback {
  id: string;
  user_id: string;
  destination_id: string;
  destination_title?: string;
  destination_description?: string;
  rating: number;
  comment: string;
  admin_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at?: string;
  is_public: boolean;
  category?: string;
  helpful_count?: number;
}

interface UseUserFeedbackReturn {
  feedback: Feedback[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  loadFeedback: (page?: number) => Promise<void>;
  refreshFeedback: () => Promise<void>;
}

export const useUserFeedback = (userId?: string, itemsPerPage = 10): UseUserFeedbackReturn => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const loadFeedback = useCallback(async (page = 1) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError, count } = await feedbackService.getUserFeedback(
        userId,
        page,
        itemsPerPage
      );

      if (fetchError) {
        console.error('Error cargando feedback:', fetchError);
        setError('Error al cargar tus sugerencias');
        return;
      }

      setFeedback(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error crítico cargando feedback:', err);
      setError('Error inesperado al cargar tus sugerencias');
    } finally {
      setLoading(false);
    }
  }, [userId, itemsPerPage]);

  const refreshFeedback = useCallback(async () => {
    await loadFeedback(currentPage);
  }, [loadFeedback, currentPage]);

  // Cargar feedback inicial
  useEffect(() => {
    if (userId) {
      loadFeedback(1);
    }
  }, [userId, loadFeedback]);

  // Suscripción a cambios en tiempo real para respuestas
  useEffect(() => {
    if (!userId) return;

    console.log('🔔 Configurando suscripción a feedback para usuario:', userId);

    const channel = supabase
      .channel(`user-feedback-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Cambio detectado en feedback del usuario:', payload);
          
          // Verificar si es una nueva respuesta
          if (payload.new.admin_response && !payload.old.admin_response) {
            console.log('✅ Nueva respuesta detectada:', payload.new);
          }
          
          // Actualizar el feedback específico con la nueva respuesta
          setFeedback(prev => 
            prev.map(item => 
              item.id === payload.new.id 
                ? { ...item, ...payload.new }
                : item
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción a feedback:', status);
      });

    return () => {
      console.log('🧹 Limpiando suscripción a feedback');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    feedback,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    loadFeedback,
    refreshFeedback
  };
};

export default useUserFeedback;

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNotifications } from './useNotifications';

interface FeedbackReply {
  id: string;
  user_id: string;
  destination_title?: string;
  comment: string;
  admin_response: string;
  responded_at: string;
  created_at: string;
}

interface UseFeedbackRepliesReturn {
  replies: FeedbackReply[];
  showToast: boolean;
  currentReply: FeedbackReply | null;
  markReplyAsSeen: (replyId: string) => void;
  hideToast: () => void;
  viewDetails: () => void;
}

export const useFeedbackReplies = (userId?: string): UseFeedbackRepliesReturn => {
  const [replies, setReplies] = useState<FeedbackReply[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [currentReply, setCurrentReply] = useState<FeedbackReply | null>(null);
  const [seenReplies, setSeenReplies] = useState<Set<string>>(new Set());
  
  // Usar el hook de notificaciones existente
  const { notifications, refreshNotifications } = useNotifications(userId, false);

  // Cargar respuestas existentes al montar el componente
  useEffect(() => {
    if (!userId) return;

    const loadExistingReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('id, user_id, destination_title, comment, admin_response, responded_at, created_at')
          .eq('user_id', userId)
          .not('admin_response', 'is', null)
          .order('responded_at', { ascending: false });

        if (error) {
          console.error('Error cargando respuestas existentes:', error);
          return;
        }

        setReplies(data || []);
      } catch (error) {
        console.error('Error crítico cargando respuestas:', error);
      }
    };

    loadExistingReplies();
  }, [userId]);

  // Detectar notificaciones de feedback y mostrar toast
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Buscar notificaciones de feedback recientes (últimos 5 minutos)
    const recentFeedbackNotifications = notifications.filter(notification => {
      if (notification.type !== 'info' || !notification.title?.includes('Respuesta a tu sugerencia')) {
        return false;
      }

      const notificationTime = new Date(notification.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - notificationTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      return minutesDiff <= 5;
    });

    // Mostrar toast para la notificación más reciente
    if (recentFeedbackNotifications.length > 0) {
      const latestNotification = recentFeedbackNotifications[0];
      const metadata = latestNotification.metadata;
      
      if (metadata && metadata.feedback_id && !seenReplies.has(metadata.feedback_id)) {
        const feedbackReply: FeedbackReply = {
          id: metadata.feedback_id,
          user_id: userId || '',
          destination_title: metadata.destination_title,
          comment: metadata.feedback_comment,
          admin_response: metadata.admin_response,
          responded_at: latestNotification.created_at,
          created_at: latestNotification.created_at
        };

        setCurrentReply(feedbackReply);
        setShowToast(true);
      }
    }
  }, [notifications, userId, seenReplies]);

  // Actualizar respuestas cuando cambien las notificaciones
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Extraer respuestas de feedback de las notificaciones
    const feedbackReplies: FeedbackReply[] = notifications
      .filter(notification => 
        notification.type === 'info' && 
        notification.title?.includes('Respuesta a tu sugerencia') &&
        notification.metadata?.feedback_id
      )
      .map(notification => ({
        id: notification.metadata.feedback_id,
        user_id: userId || '',
        destination_title: notification.metadata.destination_title,
        comment: notification.metadata.feedback_comment,
        admin_response: notification.metadata.admin_response,
        responded_at: notification.created_at,
        created_at: notification.created_at
      }))
      .sort((a, b) => new Date(b.responded_at).getTime() - new Date(a.responded_at).getTime());

    setReplies(feedbackReplies);
  }, [notifications, userId]);

  const markReplyAsSeen = useCallback((replyId: string) => {
    setSeenReplies(prev => new Set([...prev, replyId]));
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
    if (currentReply) {
      markReplyAsSeen(currentReply.id);
    }
    setCurrentReply(null);
  }, [currentReply, markReplyAsSeen]);

  const viewDetails = useCallback(() => {
    // Redirigir a la página de feedback del usuario
    window.location.href = '/my-feedback';
    hideToast();
  }, [hideToast]);

  return {
    replies,
    showToast,
    currentReply,
    markReplyAsSeen,
    hideToast,
    viewDetails
  };
};

export default useFeedbackReplies;

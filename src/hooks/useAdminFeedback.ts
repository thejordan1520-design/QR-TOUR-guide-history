import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { resolveUserNames } from '../utils/userNameResolver';

export interface AdminFeedback {
  id: string;
  user_id: string;
  destination_id: string | null;
  destination_title: string | null;
  destination_description: string | null;
  rating: number;
  comment: string;
  category: string;
  is_public: boolean;
  admin_response: string | null;
  responded_at: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  display_order: number;
  // Campos para sistema de testimonios
  is_published?: boolean;
  published_at?: string | null;
  is_featured?: boolean;
  featured_order?: number | null;
  comment_en?: string | null;
  comment_fr?: string | null;
  // Datos del usuario relacionado
  user?: {
    display_name?: string;
    email?: string;
  };
}

export const useAdminFeedback = () => {
  const [feedback, setFeedback] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      console.log('💬 Obteniendo feedback...');
      
      // Primero obtener feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('❌ Error obteniendo feedback:', feedbackError);
        throw feedbackError;
      }

      // Usar función utilitaria para resolver nombres de usuario
      const userIds = [...new Set(feedbackData?.map(f => f.user_id) || [])];
      const usersMap = await resolveUserNames(userIds);

      // Combinar feedback con datos de usuarios
      const feedbackWithUsers = feedbackData?.map(feedback => ({
        ...feedback,
        user: usersMap[feedback.user_id] || null
      })) || [];

      console.log(`✅ ${feedbackWithUsers.length} feedback obtenido`);
      setFeedback(feedbackWithUsers);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching feedback:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar feedback');
    } finally {
      setLoading(false);
    }
  };

  const createFeedback = async (feedbackData: Partial<AdminFeedback>) => {
    try {
      console.log('💬 Creando feedback:', feedbackData);
      
      // Generar ID único basado en el usuario y timestamp
      const baseId = feedbackData.user_id?.toLowerCase().replace(/\s+/g, '-') || 'feedback';
      const uniqueId = `feedback-${baseId}-${Date.now()}`;
      
      const feedbackToCreate = {
        id: uniqueId,
        user_id: feedbackData.user_id?.trim() || 'ae4b5d5d-bf52-4695-9d84-15c54b105d07', // Usar ID existente por defecto
        destination_id: feedbackData.destination_id?.trim() || null,
        destination_title: feedbackData.destination_title?.trim() || null,
        destination_description: feedbackData.destination_description?.trim() || null,
        rating: feedbackData.rating || 0,
        comment: feedbackData.comment?.trim() || '',
        category: feedbackData.category?.trim() || 'general',
        is_public: feedbackData.is_public ?? true,
        admin_response: feedbackData.admin_response?.trim() || null,
        responded_at: feedbackData.responded_at || null,
        helpful_count: feedbackData.helpful_count || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: feedbackData.display_order || 999
      };

      const { data, error } = await supabase
        .from('feedback')
        .insert(feedbackToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando feedback:', error);
        throw error;
      }

      console.log('✅ Feedback creado:', data);
      
      // Refrescar la lista
      await fetchFeedback();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating feedback:', err);
      throw err;
    }
  };

  const updateFeedback = async (id: string, updates: Partial<AdminFeedback>) => {
    try {
      console.log('💬 Actualizando feedback:', id, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando feedback:', error);
        throw error;
      }

      console.log('✅ Feedback actualizado:', data);
      
      // Refrescar la lista
      await fetchFeedback();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating feedback:', err);
      throw err;
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      console.log('💬 Eliminando feedback:', id);
      
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando feedback:', error);
        throw error;
      }

      console.log('✅ Feedback eliminado');
      
      // Refrescar la lista
      setTimeout(() => fetchFeedback(), 100);
      
    } catch (err) {
      console.error('❌ Error deleting feedback:', err);
      throw err;
    }
  };

  const addAdminResponse = async (id: string, response: string) => {
    try {
      console.log(`💬 Agregando respuesta de admin al feedback ${id}`);
      
      // Primero obtener el feedback para tener el user_id
      const { data: feedbackData, error: fetchError } = await supabase
        .from('feedback')
        .select('user_id, comment, rating, category')
        .eq('id', id)
        .single();

      if (fetchError || !feedbackData) {
        console.error('❌ Error obteniendo feedback:', fetchError);
        throw fetchError || new Error('Feedback no encontrado');
      }

      // Actualizar el feedback con la respuesta
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          admin_response: response,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error agregando respuesta:', error);
        throw error;
      }

      console.log('✅ Respuesta agregada exitosamente');

      // Crear notificación para el usuario
      try {
        console.log('🔔 Creando notificación para el usuario...');
        
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: feedbackData.user_id,
            type: 'info',
            title: '📩 QR Tour respondió a tu feedback',
            message: response,
            action_url: '/feedback',
            is_read: false,
            status: 'sent',
            target_audience: 'specific',
            metadata: {
              feedback_id: id,
              original_comment: feedbackData.comment,
              rating: feedbackData.rating,
              category: feedbackData.category,
              responded_at: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (notifError) {
          console.warn('⚠️ Error creando notificación (no crítico):', notifError);
        } else {
          console.log('✅ Notificación creada exitosamente para el usuario');
        }
      } catch (notifErr) {
        console.warn('⚠️ Error en sistema de notificaciones:', notifErr);
        // No fallar la operación principal
      }
      
      await fetchFeedback();
      
      return data;
    } catch (err) {
      console.error('❌ Error adding admin response:', err);
      throw err;
    }
  };

  const togglePublicStatus = async (id: string) => {
    try {
      const feedbackItem = feedback.find(f => f.id === id);
      if (!feedbackItem) throw new Error('Feedback no encontrado');

      const newStatus = !feedbackItem.is_public;
      console.log(`💬 Cambiando estado público del feedback ${id} a ${newStatus ? 'público' : 'privado'}`);

      const { error } = await supabase
        .from('feedback')
        .update({ 
          is_public: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error cambiando estado público:', error);
        throw error;
      }

      console.log('✅ Estado público cambiado exitosamente');
      await fetchFeedback();
    } catch (err) {
      console.error('❌ Error toggling public status:', err);
      throw err;
    }
  };

  const incrementHelpfulCount = async (id: string) => {
    try {
      const feedbackItem = feedback.find(f => f.id === id);
      if (!feedbackItem) throw new Error('Feedback no encontrado');

      const newCount = feedbackItem.helpful_count + 1;
      console.log(`💬 Incrementando contador de útil para feedback ${id}`);

      const { error } = await supabase
        .from('feedback')
        .update({ 
          helpful_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error incrementando contador:', error);
        throw error;
      }

      console.log('✅ Contador incrementado exitosamente');
      await fetchFeedback();
    } catch (err) {
      console.error('❌ Error incrementing helpful count:', err);
      throw err;
    }
  };

  const publishAsTestimony = async (id: string) => {
    try {
      const feedbackItem = feedback.find(f => f.id === id);
      if (!feedbackItem) throw new Error('Feedback no encontrado');

      const isCurrentlyPublished = feedbackItem.is_published || false;
      console.log(`📰 ${isCurrentlyPublished ? 'Despublicando' : 'Publicando'} feedback ${id} como testimonio`);

      const { error } = await supabase
        .from('feedback')
        .update({ 
          is_published: !isCurrentlyPublished,
          published_at: !isCurrentlyPublished ? new Date().toISOString() : null,
          is_public: !isCurrentlyPublished ? true : feedbackItem.is_public, // Si se publica, hacer público también
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error publicando testimonio:', error);
        throw error;
      }

      console.log(`✅ Feedback ${isCurrentlyPublished ? 'despublicado' : 'publicado'} como testimonio`);
      await fetchFeedback();
    } catch (err) {
      console.error('❌ Error publishing testimony:', err);
      throw err;
    }
  };

  const featureInHomePage = async (id: string, order: number) => {
    try {
      const feedbackItem = feedback.find(f => f.id === id);
      if (!feedbackItem) throw new Error('Feedback no encontrado');

      const isCurrentlyFeatured = feedbackItem.is_featured || false;
      
      console.log(`⭐ ${isCurrentlyFeatured ? 'Quitando de' : 'Destacando en'} HomePage: ${id}`);

      // Si se está destacando, verificar que no haya más de 3
      if (!isCurrentlyFeatured) {
        const featuredCount = feedback.filter(f => f.is_featured).length;
        if (featuredCount >= 3) {
          throw new Error('Ya hay 3 testimonios destacados en la HomePage. Debes quitar uno primero.');
        }
      }

      // Traducir comentario automáticamente si se está destacando
      let translations = {};
      if (!isCurrentlyFeatured) {
        console.log('🌐 Traduciendo comentario a inglés y francés...');
        translations = await translateComment(feedbackItem.comment);
      }

      const { error } = await supabase
        .from('feedback')
        .update({ 
          is_featured: !isCurrentlyFeatured,
          featured_order: !isCurrentlyFeatured ? order : null,
          is_published: !isCurrentlyFeatured ? true : feedbackItem.is_published, // Auto-publicar si se destaca
          ...translations,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error destacando en HomePage:', error);
        throw error;
      }

      console.log(`✅ Testimonio ${isCurrentlyFeatured ? 'quitado de' : 'destacado en'} HomePage`);
      await fetchFeedback();
    } catch (err) {
      console.error('❌ Error featuring testimony:', err);
      throw err;
    }
  };

  // Función auxiliar para traducir comentarios automáticamente
  const translateComment = async (comment: string): Promise<{ comment_en?: string; comment_fr?: string }> => {
    try {
      console.log('🌐 Traduciendo comentario automáticamente...');
      
      // Usar LibreTranslate API (gratuita y open source)
      // Instancia pública: https://libretranslate.de
      const LIBRETRANSLATE_URL = 'https://libretranslate.de/translate';
      
      // Detectar idioma del comentario original (asumimos español)
      const sourceLang = 'es';
      
      // Traducir a inglés
      let comment_en = comment;
      try {
        const enResponse = await fetch(LIBRETRANSLATE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: comment,
            source: sourceLang,
            target: 'en',
            format: 'text'
          })
        });
        
        if (enResponse.ok) {
          const enData = await enResponse.json();
          comment_en = enData.translatedText || comment;
          console.log('✅ Traducido a inglés:', comment_en.substring(0, 50));
        }
      } catch (err) {
        console.warn('⚠️ Error traduciendo a inglés, usando original:', err);
      }
      
      // Traducir a francés
      let comment_fr = comment;
      try {
        const frResponse = await fetch(LIBRETRANSLATE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: comment,
            source: sourceLang,
            target: 'fr',
            format: 'text'
          })
        });
        
        if (frResponse.ok) {
          const frData = await frResponse.json();
          comment_fr = frData.translatedText || comment;
          console.log('✅ Traducido a francés:', comment_fr.substring(0, 50));
        }
      } catch (err) {
        console.warn('⚠️ Error traduciendo a francés, usando original:', err);
      }
      
      return {
        comment_en,
        comment_fr
      };
    } catch (error) {
      console.error('❌ Error general en traducción:', error);
      return {
        comment_en: comment,
        comment_fr: comment
      };
    }
  };

  // Cargar feedback al montar el componente (solo una vez)
  useEffect(() => {
    fetchFeedback();
  }, []); // ✅ Sin dependencias para evitar loops

  return {
    feedback,
    loading,
    error,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    addAdminResponse,
    togglePublicStatus,
    incrementHelpfulCount,
    publishAsTestimony,
    featureInHomePage,
    refetch: fetchFeedback
  };
};

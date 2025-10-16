// Servicios completos para Supabase
// @ts-nocheck
import { supabase } from '../lib/supabase';
import { API_CONFIG } from '../config/api';

// ============================================
// SERVICIO DE USUARIOS
// ============================================
export const userService = {
  // Obtener todos los usuarios con paginación
  async getAllUsers(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener usuario por ID
  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Crear usuario
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar usuario
  async updateUser(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Eliminar usuario
  async deleteUser(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    return { data, error };
  },

  // Obtener estadísticas de usuarios
  async getUserStats() {
    const { data: totalUsers, error: totalError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const { data: activeUsers, error: activeError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: premiumUsers, error: premiumError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('is_premium', true);

    return {
      data: {
        total: totalUsers?.length || 0,
        active: activeUsers?.length || 0,
        premium: premiumUsers?.length || 0
      },
      error: totalError || activeError || premiumError
    };
  }
};

// ============================================
// SERVICIO DE DESTINOS
// ============================================
export const destinationsService = {
  // Obtener todos los destinos
  async getAllDestinations(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('destinations')
      .select('*', { count: 'exact' })
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todos los destinos sin paginación (para drag and drop)
  async getAllDestinationsUnpaginated(search = '') {
    let query = supabase
      .from('destinations')
      .select('*')
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    return { data, error };
  },

  // Obtener destino por ID
  async getDestinationById(id) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Crear destino
  async createDestination(destinationData) {
    // Obtener el siguiente order_position
    const { data: lastDestination } = await supabase
      .from('destinations')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastDestination?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...destinationData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('destinations')
      .insert([dataToInsert])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar destino
  async updateDestination(id, destinationData) {
    const { data, error } = await supabase
      .from('destinations')
      .update(destinationData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Actualizar orden de destinos (para drag and drop)
  async updateDestinationsOrder(destinationsWithNewOrder) {
    try {
      // Actualizar cada destino con su nueva posición
      const updatePromises = destinationsWithNewOrder.map((destination, index) => 
        supabase
          .from('destinations')
          .update({ order_position: index + 1 })
          .eq('id', destination.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Eliminar destino
  async deleteDestination(id) {
    const { data, error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);

    return { data, error };
  },

  // Obtener destinos destacados
  async getFeaturedDestinations() {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Marcar/desmarcar como destacado
  async toggleFeatured(id, isFeatured) {
    const { data, error } = await supabase
      .from('destinations')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// ============================================
// SERVICIO DE ESCANEOS QR
// ============================================
export const scansService = {
  // Obtener todos los escaneos
  async getAllScans(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('scans')
      .select(`
        *,
        users:user_id(email, username),
        destinations:destination_id(title, description)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`users.email.ilike.%${search}%,destinations.title.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener estadísticas de escaneos
  async getScanStats() {
    const { data: totalScans, error: totalError } = await supabase
      .from('scans')
      .select('id', { count: 'exact' });

    const { data: todayScans, error: todayError } = await supabase
      .from('scans')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: weeklyScans, error: weeklyError } = await supabase
      .from('scans')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    return {
      data: {
        total: totalScans?.length || 0,
        today: todayScans?.length || 0,
        weekly: weeklyScans?.length || 0
      },
      error: totalError || todayError || weeklyError
    };
  },

  // Obtener escaneos por destino
  async getScansByDestination(destinationId) {
    const { data, error } = await supabase
      .from('scans')
      .select(`
        *,
        users:user_id(email, username)
      `)
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// ============================================
// SERVICIO DE CÓDIGOS QR
// ============================================
export const qrCodesService = {
  // Obtener todos los códigos QR
  async getAllQRCodes(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('qr_codes')
      .select(`
        *,
        destinations:destination_id(title, description)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`code.ilike.%${search}%,destinations.title.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Crear código QR
  async createQRCode(qrData) {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([qrData])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar código QR
  async updateQRCode(id, qrData) {
    const { data, error } = await supabase
      .from('qr_codes')
      .update(qrData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Eliminar código QR
  async deleteQRCode(id) {
    const { data, error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE RESERVACIONES
// ============================================
export const reservationsService = {
  // Obtener todas las reservaciones
  async getAllReservations(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('reservations')
      .select(`
        *,
        users:user_id(email, username),
        destinations:destination_id(title, description)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`users.email.ilike.%${search}%,destinations.title.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Crear reservación
  async createReservation(reservationData) {
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar estado de reservación
  async updateReservationStatus(id, status) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Eliminar reservación
  async deleteReservation(id) {
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE FEEDBACK
// ============================================
export const feedbackService = {
  // Obtener todo el feedback
  async getAllFeedback(page = 1, limit = 10, search = '') {
    try {
      console.log('🚀 Iniciando getAllFeedback...');
      
      // Obtener feedback con JOIN usando RPC
      const { data, error, count } = await supabase.rpc('get_feedback_with_users', {
        page_num: page,
        page_size: limit,
        search_term: search || ''
      });

      if (error) {
        console.error('❌ Error en RPC get_feedback_with_users:', error);
        
        // Fallback: usar consulta simple sin JOIN
        console.log('🔄 Usando fallback sin JOIN...');
        return await this.getAllFeedbackFallback(page, limit, search);
      }

      console.log('✅ Feedback obtenido via RPC:', data?.length || 0, 'elementos');
      console.log('📋 Datos completos:', data);

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      console.error('❌ Error crítico en getAllFeedback:', error);
      return await this.getAllFeedbackFallback(page, limit, search);
    }
  },

  // Fallback: obtener feedback sin JOIN
  async getAllFeedbackFallback(page = 1, limit = 10, search = '') {
    try {
      console.log('🔄 Usando método fallback...');
      
      // Obtener feedback
      let query = supabase
        .from('feedback')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`comment.ilike.%${search}%,destination_title.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: feedbackData, error: feedbackError, count } = await query
        .range(from, to);

      if (feedbackError) {
        console.error('❌ Error en fallback:', feedbackError);
        return { data: [], error: feedbackError, count: 0 };
      }

      if (!feedbackData || feedbackData.length === 0) {
        return { data: [], error: null, count: 0 };
      }

      // Obtener perfiles
      const userIds = [...new Set(feedbackData.map(item => item.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Error obteniendo perfiles en fallback:', profilesError);
      }

      // Combinar datos
      const profilesMap = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }

      const feedbackWithUsers = feedbackData.map((item) => {
        const profile = profilesMap[item.user_id];
        return {
          ...item,
          user_email: profile?.email || 'N/A',
          user_username: profile?.full_name || profile?.email?.split('@')[0] || 'Usuario',
          user_avatar: profile?.avatar_url || null
        };
      });

      console.log('✅ Fallback completado:', feedbackWithUsers);
      return { data: feedbackWithUsers, error: null, count };
    } catch (error) {
      console.error('❌ Error en fallback:', error);
      return { data: [], error, count: 0 };
    }
  },

  // Responder a feedback
  async respondToFeedback(id, response) {
    try {
      // Primero obtener el feedback para obtener el user_id
      const { data: feedbackData, error: fetchError } = await supabase
        .from('feedback')
        .select('user_id, comment, destination_title')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error obteniendo feedback:', fetchError);
        return { data: null, error: fetchError };
      }

      // Actualizar el feedback con la respuesta del admin
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          admin_response: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando feedback:', error);
        return { data: null, error };
      }

      // Crear notificación para el usuario
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: feedbackData.user_id,
            type: 'info',
            title: 'QR Tour respondió',
            message: response, // Solo la respuesta directa del admin
            action_url: '/profile',
            metadata: {
              feedback_id: id,
              feedback_comment: feedbackData.comment,
              destination_title: feedbackData.destination_title,
              admin_response: response
            }
          });

        if (notificationError) {
          console.warn('Error creando notificación:', notificationError);
          // No fallar la operación principal por un error de notificación
        }
      } catch (notificationError) {
        console.warn('Error creando notificación:', notificationError);
        // No fallar la operación principal por un error de notificación
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error crítico en respondToFeedback:', error);
      return { data: null, error };
    }
  },

  // Obtener feedback de un usuario específico
  async getUserFeedback(userId, page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('feedback')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error en getUserFeedback:', error);
        return { data: [], error, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      console.error('Error crítico en getUserFeedback:', error);
      return { data: [], error, count: 0 };
    }
  },

  // Obtener estadísticas de feedback
  async getFeedbackStats() {
    try {
      const { data: totalFeedback, error: totalError } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' });

      const { data: positiveFeedback, error: positiveError } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' })
        .gte('rating', 4);

      const { data: negativeFeedback, error: negativeError } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' })
        .lt('rating', 3);

      const { data: respondedFeedback, error: respondedError } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' })
        .not('admin_response', 'is', null);

      // Calcular promedio de rating
      const { data: allRatings, error: ratingsError } = await supabase
        .from('feedback')
        .select('rating');

      let average = 0;
      if (allRatings && allRatings.length > 0) {
        const sum = allRatings.reduce((acc, item) => acc + item.rating, 0);
        average = sum / allRatings.length;
      }

      return {
        data: {
          total: totalFeedback?.length || 0,
          positive: positiveFeedback?.length || 0,
          negative: negativeFeedback?.length || 0,
          responded: respondedFeedback?.length || 0,
          average: average
        },
        error: totalError || positiveError || negativeError || respondedError || ratingsError
      };
    } catch (error) {
      console.error('Error en getFeedbackStats:', error);
      return {
        data: {
          total: 0,
          positive: 0,
          negative: 0,
          responded: 0,
          average: 0
        },
        error
      };
    }
  },

  // Crear nuevo feedback (para usuarios)
  async createFeedback(feedbackData) {
    // Detectar idioma del comentario (lo pasa el frontend)
    const currentLang = feedbackData.language || 'es';
    
    // Preparar el objeto de feedback con el comentario en el campo correcto
    const feedbackToInsert = {
      user_id: feedbackData.userId,
      destination_id: feedbackData.destinationId || null,
      destination_title: feedbackData.destinationTitle || null,
      rating: feedbackData.rating,
      category: feedbackData.category || 'general',
      is_public: feedbackData.isPublic !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Guardar el comentario en el campo correcto según el idioma
    if (currentLang === 'en') {
      feedbackToInsert.comment_en = feedbackData.comment;
      feedbackToInsert.comment = feedbackData.comment; // También en español para compatibilidad
    } else if (currentLang === 'fr') {
      feedbackToInsert.comment_fr = feedbackData.comment;
      feedbackToInsert.comment = feedbackData.comment; // También en español para compatibilidad
    } else {
      // Español (por defecto)
      feedbackToInsert.comment = feedbackData.comment;
    }

    console.log(`📝 Guardando feedback en idioma: ${currentLang}`);

    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackToInsert])
      .select()
      .single();

    // Si se creó exitosamente, crear notificación para los admins
    if (data && !error) {
      try {
        console.log('🔔 Creando notificación para admins sobre nuevo feedback...');
        
        // Crear notificación para todos los admins
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            type: 'feedback',
            title: `📝 Nuevo Feedback Recibido - ${feedbackData.rating}/5 ⭐`,
            message: feedbackData.comment.substring(0, 100) + (feedbackData.comment.length > 100 ? '...' : ''),
            target_audience: 'admin',
            action_url: '/admin/feedback',
            is_read: false,
            metadata: {
              feedback_id: data.id,
              user_id: feedbackData.userId,
              rating: feedbackData.rating,
              category: feedbackData.category,
              destination_title: feedbackData.destinationTitle
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (notifError) {
          console.warn('⚠️ Error creando notificación para admin:', notifError);
        } else {
          console.log('✅ Notificación creada para admins');
        }
      } catch (notifErr) {
        console.warn('⚠️ Error en notificación (no crítico):', notifErr);
      }
    }

    return { data, error };
  },

  // Obtener feedback del usuario actual
  async getUserFeedback(userId, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  }
};

// ============================================
// SERVICIO DE ANUNCIOS
// ============================================
export const advertisementsService = {
  // Obtener todos los anuncios
  async getAllAdvertisements(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title_es.ilike.%${search}%,title_en.ilike.%${search}%,advertiser_name.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Crear anuncio
  async createAdvertisement(adData) {
    const { data, error } = await supabase
      .from('advertisements')
      .insert([adData])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar anuncio
  async updateAdvertisement(id, adData) {
    const { data, error } = await supabase
      .from('advertisements')
      .update(adData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Eliminar anuncio
  async deleteAdvertisement(id) {
    const { data, error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    return { data, error };
  },

  // Obtener métricas de anuncios
  async getAdMetrics(adId) {
    const { data, error } = await supabase
      .from('ad_metrics')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// ============================================
// SERVICIO DE LOGS DE ACTIVIDAD
// ============================================
export const activityLogsService = {
  // Obtener todos los logs
  async getAllLogs(page = 1, limit = 10, search = '', type = '') {
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        users:user_id(email, username)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`users.email.ilike.%${search}%,action.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('action_type', type);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Crear log de actividad
  async createLog(logData) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([logData]);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE CONFIGURACIÓN DE APP
// ============================================
export const appSettingsService = {
  // Obtener todas las configuraciones
  async getAllSettings() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('setting_key');

    return { data, error };
  },

  // Obtener configuración por clave
  async getSetting(key) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    return { data, error };
  },

  // Actualizar configuración
  async updateSetting(key, value) {
    const { data, error } = await supabase
      .from('app_settings')
      .update({ 
        setting_value: value,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', key)
      .select()
      .single();

    return { data, error };
  },

  // Crear nueva configuración
  async createSetting(settingData) {
    const { data, error } = await supabase
      .from('app_settings')
      .insert([settingData])
      .select()
      .single();

    return { data, error };
  }
};

// ============================================
// SERVICIO DE NOTIFICACIONES
// ============================================
export const notificationsService = {
  // Obtener todas las notificaciones
  async getAllNotifications(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Crear notificación
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar notificación
  async updateNotification(id, notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .update(notificationData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Eliminar notificación
  async deleteNotification(id) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Enviar notificación a usuarios (inserta varias filas si corresponde)
  async sendNotificationToUsers(userIds, notificationData) {
    const payload = (userIds && userIds.length)
      ? userIds.map(userId => ({ ...notificationData, target_audience: 'specific', target_users: [userId] }))
      : [notificationData];

    const { data, error } = await supabase
      .from('notifications')
      .insert(payload);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE PLANES PREMIUM
// ============================================
export const plansService = {
  // Obtener todos los planes
  async getAllPlans() {
    // Intentar con subscription_plans primero; si falla, intentar con plans
    let { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price');

    if (error) {
      const fallback = await supabase
        .from('plans')
        .select('*')
        .order('price');
      data = fallback.data;
      error = fallback.error;
    }

    return { data, error };
  },

  // Crear plan
  async createPlan(planData) {
    // Crear en subscription_plans si existe; si no, en plans
    let { data, error } = await supabase
      .from('subscription_plans')
      .insert([planData])
      .select()
      .single();

    if (error) {
      const fallback = await supabase
        .from('plans')
        .insert([planData])
        .select()
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    return { data, error };
  },

  // Actualizar plan
  async updatePlan(id, planData) {
    let { data, error } = await supabase
      .from('subscription_plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const fallback = await supabase
        .from('plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    return { data, error };
  },

  // Eliminar plan
  async deletePlan(id) {
    let { data, error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) {
      const fallback = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
      data = fallback.data;
      error = fallback.error;
    }

    return { data, error };
  },

  // Obtener estadísticas de planes
  async getPlanStats() {
    // Intentar leer planes desde subscription_plans con fallback a plans
    let { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      const fallback = await supabase
        .from('plans')
        .select('*');
      plans = fallback.data || [];
      plansError = fallback.error;
    }

    if (plansError) return { data: null, error: plansError };

    const stats = await Promise.all(
      plans.map(async (plan) => {
        // Contar suscriptores desde user_subscriptions si existe; si no, intentar users.plan_id
        let userCount = 0;
        let revenue = 0;
        let err = null;

        const bySubs = await supabase
          .from('user_subscriptions')
          .select('id, status', { count: 'exact' })
          .eq('plan_id', plan.id)
          .eq('status', 'active');

        if (!bySubs.error) {
          userCount = (typeof bySubs.count === 'number' ? bySubs.count : (bySubs.data ? bySubs.data.length : 0));
        } else {
          const byUsers = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('plan_id', plan.id);
          if (!byUsers.error) {
            userCount = (typeof byUsers.count === 'number' ? byUsers.count : (byUsers.data ? byUsers.data.length : 0));
          } else {
            err = byUsers.error;
          }
        }

        const price = typeof plan.price === 'number' ? plan.price : parseFloat(plan.price || '0');
        revenue = userCount * (isFinite(price) ? price : 0);

        return {
          ...plan,
          user_count: userCount,
          revenue
        };
      })
    );

    return { data: stats, error: null };
  }
};

// ============================================
// SERVICIO DE SERVICIOS (Guías, Taxistas, Autobuses)
// ============================================
export const servicesService = {
  // Guías turísticos
  async getAllTourGuides(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('tourist_guides')
      .select('*', { count: 'exact' })
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todos los guías turísticos sin paginación (para drag and drop)
  async getAllTourGuidesUnpaginated(search = '') {
    console.log('🔄 tourGuidesService.getAllTourGuidesUnpaginated - Iniciando...');
    let query = supabase
      .from('tourist_guides')
      .select('*')
      // .eq('is_active', true) // Solo guías activos - Temporalmente comentado para debug
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    console.log('📊 tourGuidesService.getAllTourGuidesUnpaginated - Resultado:', { 
      dataCount: data?.length, 
      error: error?.message,
      firstItem: data?.[0]?.name 
    });

    return { data, error };
  },

  async createTourGuide(guideData) {
    // Obtener el siguiente order_position
    const { data: lastGuide } = await supabase
      .from('tourist_guides')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastGuide?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...guideData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('tourist_guides')
      .insert([dataToInsert])
      .select()
      .single();
    return { data, error };
  },

  async updateTourGuide(id, guideData) {
    const { data, error } = await supabase
      .from('tourist_guides')
      .update(guideData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteTourGuide(id) {
    const { data, error } = await supabase
      .from('tourist_guides')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Actualizar orden de guías turísticos (para drag and drop)
  async updateTourGuidesOrder(guidesWithNewOrder) {
    try {
      // Actualizar cada guía con su nueva posición
      const updatePromises = guidesWithNewOrder.map((guide, index) => 
        supabase
          .from('tourist_guides')
          .update({ order_position: index + 1 })
          .eq('id', guide.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Taxistas
  async getAllTaxiDrivers(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('taxi_drivers')
      .select('*', { count: 'exact' })
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todos los taxistas sin paginación (para drag and drop)
  async getAllTaxiDriversUnpaginated(search = '') {
    console.log('🔄 taxiDriversService.getAllTaxiDriversUnpaginated - Iniciando...');
    let query = supabase
      .from('taxi_drivers')
      .select('*')
      // .eq('is_active', true) // Solo taxis activos - Temporalmente comentado para debug
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    console.log('📊 taxiDriversService.getAllTaxiDriversUnpaginated - Resultado:', { 
      dataCount: data?.length, 
      error: error?.message,
      firstItem: data?.[0]?.name 
    });

    return { data, error };
  },

  async createTaxiDriver(driverData) {
    // Obtener el siguiente order_position
    const { data: lastDriver } = await supabase
      .from('taxi_drivers')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastDriver?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...driverData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('taxi_drivers')
      .insert([dataToInsert])
      .select()
      .single();
    return { data, error };
  },

  async updateTaxiDriver(id, driverData) {
    const { data, error } = await supabase
      .from('taxi_drivers')
      .update(driverData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteTaxiDriver(id) {
    const { data, error } = await supabase
      .from('taxi_drivers')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Actualizar orden de taxistas (para drag and drop)
  async updateTaxiDriversOrder(driversWithNewOrder) {
    try {
      // Actualizar cada taxista con su nueva posición
      const updatePromises = driversWithNewOrder.map((driver, index) => 
        supabase
          .from('taxi_drivers')
          .update({ order_position: index + 1 })
          .eq('id', driver.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Autobuses
  async getAllBuses(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('buss')
      .select('*', { count: 'exact' })
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`route.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todos los autobuses sin paginación (para drag and drop)
  async getAllBusesUnpaginated(search = '') {
    console.log('🔄 busesService.getAllBusesUnpaginated - Iniciando...');
    let query = supabase
      .from('buss')
      .select('*')
      // .eq('is_active', true) // Solo buses activos - Temporalmente comentado para debug
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`route.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error } = await query;
    console.log('📊 busesService.getAllBusesUnpaginated - Resultado:', { 
      dataCount: data?.length, 
      error: error?.message,
      firstItem: data?.[0]?.name 
    });

    return { data, error };
  },

  async createBus(busData) {
    // Obtener el siguiente order_position
    const { data: lastBus } = await supabase
      .from('buss')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastBus?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...busData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('buss')
      .insert([dataToInsert])
      .select()
      .single();
    return { data, error };
  },

  async updateBus(id, busData) {
    const { data, error } = await supabase
      .from('buss')
      .update(busData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteBus(id) {
    const { data, error } = await supabase
      .from('buss')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Actualizar orden de autobuses (para drag and drop)
  async updateBusesOrder(busesWithNewOrder) {
    try {
      // Actualizar cada autobús con su nueva posición
      const updatePromises = busesWithNewOrder.map((bus, index) => 
        supabase
          .from('buss')
          .update({ order_position: index + 1 })
          .eq('id', bus.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  }
};

// ============================================
// SERVICIO DE EXCURSIONES
// ============================================
export const excursionsService = {
  // Obtener todas las excursiones
  async getAllExcursions(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('excursions')
      .select('*', { count: 'exact' })
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      // buscar también por name si el esquema lo usa
      query = query.or(`title.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todas las excursiones sin paginación (para drag and drop)
  async getAllExcursionsUnpaginated(search = '') {
    console.log('🔄 excursionsService.getAllExcursionsUnpaginated - Iniciando...');
    let query = supabase
      .from('excursions')
      .select('*')
      // .eq('is_active', true) // Solo excursiones activas - Temporalmente comentado para debug
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    console.log('📊 excursionsService.getAllExcursionsUnpaginated - Resultado:', { 
      dataCount: data?.length, 
      error: error?.message,
      firstItem: data?.[0]?.name 
    });

    return { data, error };
  },

  // Crear excursión
  async createExcursion(excursionData) {
    // Obtener el siguiente order_position
    const { data: lastExcursion } = await supabase
      .from('excursions')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastExcursion?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...excursionData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('excursions')
      .insert([dataToInsert])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar excursión
  async updateExcursion(id, excursionData) {
    const { data, error } = await supabase
      .from('excursions')
      .update(excursionData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Actualizar orden de excursiones (para drag and drop)
  async updateExcursionsOrder(excursionsWithNewOrder) {
    try {
      // Actualizar cada excursión con su nueva posición
      const updatePromises = excursionsWithNewOrder.map((excursion, index) => 
        supabase
          .from('excursions')
          .update({ order_position: index + 1 })
          .eq('id', excursion.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Eliminar excursión
  async deleteExcursion(id) {
    const { data, error } = await supabase
      .from('excursions')
      .delete()
      .eq('id', id);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE EVENTOS
// ============================================
export const eventsService = {
  async getAllEvents(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: true });
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    return { data, error, count };
  },
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();
    return { data, error };
  },
  async updateEvent(id, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
  async deleteEvent(id) {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    return { data, error };
  }
};

// ============================================
// SERVICIO DE RESTAURANTES
// ============================================
export const restaurantsService = {
  // Obtener todos los restaurantes
  async getAllRestaurants(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('restaurants')
      .select('*')
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,cuisine.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todos los restaurantes sin paginación (para drag and drop)
  async getAllRestaurantsUnpaginated(search = '') {
    console.log('🔄 restaurantsService.getAllRestaurantsUnpaginated - Iniciando...');
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true) // Solo restaurantes activos
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,cuisine.ilike.%${search}%`);
    }

    const { data, error } = await query;
    console.log('📊 restaurantsService.getAllRestaurantsUnpaginated - Resultado:', { 
      dataCount: data?.length, 
      error: error?.message,
      firstItem: data?.[0]?.name 
    });

    return { data, error };
  },

  // Crear restaurante
  async createRestaurant(restaurantData) {
    // Obtener el siguiente order_position
    const { data: lastRestaurant } = await supabase
      .from('restaurants')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastRestaurant?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...restaurantData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('restaurants')
      .insert([dataToInsert])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar restaurante
  async updateRestaurant(id, restaurantData) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(restaurantData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Actualizar orden de restaurantes (para drag and drop)
  async updateRestaurantsOrder(restaurantsWithNewOrder) {
    try {
      // Actualizar cada restaurante con su nueva posición
      const updatePromises = restaurantsWithNewOrder.map((restaurant, index) => 
        supabase
          .from('restaurants')
          .update({ order_position: index + 1 })
          .eq('id', restaurant.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Eliminar restaurante
  async deleteRestaurant(id) {
    const { data, error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE SUPERMERCADOS
// ============================================
export const supermarketsService = {
  // Obtener todos los supermercados
  async getAllSupermarkets(page = 1, limit = 10, search = '') {
    let query = supabase
      .from('supermarkets')
      .select('*', { count: 'exact' })
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,chain.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    return { data, error, count };
  },

  // Obtener todos los supermercados sin paginación (para drag and drop)
  async getAllSupermarketsUnpaginated(search = '') {
    console.log('🔄 supermarketsService.getAllSupermarketsUnpaginated - Iniciando...');
    let query = supabase
      .from('supermarkets')
      .select('*')
      .eq('is_active', true) // Solo supermercados activos
      .order('order_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,chain.ilike.%${search}%`);
    }

    const { data, error } = await query;
    console.log('📊 supermarketsService.getAllSupermarketsUnpaginated - Resultado:', { 
      dataCount: data?.length, 
      error: error?.message,
      firstItem: data?.[0]?.name 
    });

    return { data, error };
  },

  // Crear supermercado
  async createSupermarket(supermarketData) {
    // Obtener el siguiente order_position
    const { data: lastSupermarket } = await supabase
      .from('supermarkets')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextOrderPosition = (lastSupermarket?.order_position || 0) + 1;
    
    const dataToInsert = {
      ...supermarketData,
      order_position: nextOrderPosition
    };

    const { data, error } = await supabase
      .from('supermarkets')
      .insert([dataToInsert])
      .select()
      .single();

    return { data, error };
  },

  // Actualizar supermercado
  async updateSupermarket(id, supermarketData) {
    const { data, error } = await supabase
      .from('supermarkets')
      .update(supermarketData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Actualizar orden de supermercados (para drag and drop)
  async updateSupermarketsOrder(supermarketsWithNewOrder) {
    try {
      // Actualizar cada supermercado con su nueva posición
      const updatePromises = supermarketsWithNewOrder.map((supermarket, index) => 
        supabase
          .from('supermarkets')
          .update({ order_position: index + 1 })
          .eq('id', supermarket.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si hay errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { error: errors[0].error };
      }

      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Eliminar supermercado
  async deleteSupermarket(id) {
    const { data, error } = await supabase
      .from('supermarkets')
      .delete()
      .eq('id', id);

    return { data, error };
  }
};

// ============================================
// SERVICIO DE GAMIFICACIÓN
// ============================================
export const gamificationService = {
  // Obtener todos los badges
  async getAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('rarity');

    return { data, error };
  },

  // Obtener todos los avatar collectibles
  async getAllCollectibles() {
    const { data, error } = await supabase
      .from('avatar_collectibles')
      .select('*')
      .order('rarity');

    return { data, error };
  },

  // Crear badge
  async createBadge(badgeData) {
    const { data, error } = await supabase
      .from('badges')
      .insert([badgeData])
      .select()
      .single();

    return { data, error };
  },

  // Crear collectible
  async createCollectible(collectibleData) {
    const { data, error } = await supabase
      .from('avatar_collectibles')
      .insert([collectibleData])
      .select()
      .single();

    return { data, error };
  }
};

// Exportar todos los servicios
export default {
  userService,
  destinationsService,
  scansService,
  qrCodesService,
  reservationsService,
  feedbackService,
  advertisementsService,
  activityLogsService,
  appSettingsService,
  notificationsService,
  plansService,
  servicesService,
  excursionsService,
  restaurantsService,
  supermarketsService,
  gamificationService
};


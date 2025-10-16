import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeDataSync } from '../services/realtimeDataSync';
import { useTranslation } from 'react-i18next';
import { excursionsService } from '../services/supabaseServices.js';
import { translatePlaces } from '../utils/translationUtils';

interface Excursion {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  location: string | null;
  phone: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  order_position: number | null;
  display_order: number | null;
}

export const useExcursions = () => {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const fetchExcursions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo excursiones desde Supabase...');
      
      // Obtener excursiones ordenadas por order_position
      const { data, error } = await supabase
        .from('excursions')
        .select('*')
        // .eq('is_active', true) // Temporalmente comentado para debug
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Error obteniendo excursiones:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ No se obtuvieron excursiones o formato incorrecto:', data);
        setExcursions([]);
        return;
      }
      
      console.log(`✅ ${data.length} excursiones obtenidas de Supabase`);
      
      // Procesar excursiones
      let transformedExcursions = data.map((excursion: any) => ({
        id: excursion.id,
        name: excursion.name || excursion.title || 'Sin nombre',
        description: excursion.description || 'Sin descripción',
        price: excursion.price || null,
        image_url: excursion.image_url || '/places/placeholder.jpg',
        location: excursion.location || null,
        phone: excursion.phone || null,
        website_url: excursion.website_url || null,
        is_active: excursion.is_active ?? true,
        created_at: excursion.created_at || new Date().toISOString(),
        updated_at: excursion.updated_at || new Date().toISOString(),
        order_position: excursion.order_position || 0,
        display_order: excursion.display_order || 0,
        duration: excursion.duration || null,
        meeting_point: excursion.meeting_point || null,
        max_participants: excursion.max_participants || null,
        difficulty_level: excursion.difficulty_level || null,
        category: excursion.category || null,
        includes: excursion.includes || [],
        requirements: excursion.requirements || []
      }));
      
      // Aplicar traducciones dinámicamente según el idioma seleccionado
      const currentLanguage = i18n.language;
      // console.log(`🌐 Idioma actual: ${currentLanguage}`);
      
      // SIEMPRE aplicar traducciones para todos los idiomas
      console.log(`🌐 Aplicando traducciones para idioma: ${currentLanguage}`);
      try {
        const translatedExcursions = await translatePlaces(transformedExcursions, currentLanguage);
        transformedExcursions = translatedExcursions;
        // console.log(`✅ Traducciones aplicadas para ${currentLanguage}`);
      } catch (translationError) {
        console.error('❌ Error aplicando traducciones:', translationError);
        // Continuar con los datos originales si falla la traducción
      }
      
      setExcursions(transformedExcursions);
      
    } catch (err) {
      console.error('❌ Error fetching excursions:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar excursiones');
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Sincronización en tiempo real para cambios de datos (orden + ratings + otros campos)
  const { isConnected } = useRealtimeDataSync(['excursions'], (update) => {
    console.log('🔄 Actualización de datos recibida en frontend:', update);
    
    // Si hay cambios en rating, orden o estado activo, refrescar excursiones
    if (update.changedFields.includes('rating') || 
        update.changedFields.includes('order_position') || 
        update.changedFields.includes('is_active') ||
        update.changedFields.includes('all')) {
      console.log('⭐ Cambios importantes detectados, refrescando excursiones...');
      fetchExcursions();
    }
  });

  // Cargar excursiones al montar el componente
  useEffect(() => {
    fetchExcursions();
  }, [fetchExcursions]);

  // Aplicar traducciones cuando cambie el idioma
  useEffect(() => {
    const applyTranslations = async () => {
      const currentLanguage = i18n.language;
      // console.log(`🌐 Idioma actual: ${currentLanguage}`);
      
      if (excursions.length > 0) {
        console.log(`🌐 Aplicando traducciones para ${currentLanguage}...`);
        try {
          const translatedExcursions = await translatePlaces(excursions, currentLanguage);
          setExcursions(translatedExcursions);
          // console.log(`✅ Traducciones aplicadas para ${currentLanguage}`);
        } catch (err) {
          console.error('❌ Error aplicando traducciones:', err);
        }
      }
    };

    // Aplicar traducciones cuando cambie el idioma
    applyTranslations();
  }, [i18n.language, excursions.length]); // Depender del idioma y del número de excursiones

  return {
    excursions,
    loading,
    error,
    refetch: fetchExcursions,
    isRealtimeConnected: isConnected
  };
};

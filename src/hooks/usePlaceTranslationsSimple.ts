import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface PlaceTranslation {
  id: string;
  key: string;
  language: string;
  value: string;
}

export function usePlaceTranslationsSimple() {
  const [loading, setLoading] = useState(false);

  // Función para obtener traducciones de un lugar específico
  const getPlaceTranslations = useCallback(async (placeId: string, language: string): Promise<{
    name: string;
    description: string;
    title?: string;
  } | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .like('key', `place.${placeId}.%`)
        .eq('language', language);

      if (error) {
        console.error('Error getting place translations:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Organizar las traducciones por campo
      const translations: any = {};
      data.forEach(t => {
        const field = t.key.split('.').pop();
        if (field) {
          translations[field] = t.value;
        }
      });

      return {
        name: translations.name || '',
        description: translations.description || '',
        title: translations.title || undefined
      };

    } catch (err) {
      console.error('Error in getPlaceTranslations:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para aplicar traducciones a múltiples lugares
  const translatePlaces = useCallback(async (
    places: any[], 
    targetLanguage: string
  ): Promise<any[]> => {
    if (targetLanguage === 'es') {
      // Si es español, no necesitamos traducir
      return places;
    }

    try {
      setLoading(true);
      
      // Obtener todas las traducciones para todos los lugares de una vez
      const placeIds = places.map(p => p.id);
      const placeIdPatterns = placeIds.map(id => `place.${id}.%`);
      
      // Obtener traducciones para todos los lugares de una vez
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language', targetLanguage);

      if (error) {
        console.error('Error getting translations:', error);
        return places; // Retornar lugares originales si hay error
      }

      // Crear mapa de traducciones por lugar
      const translationsMap = new Map<string, any>();
      
      if (data) {
        data.forEach(t => {
          // Solo procesar traducciones de lugares que estamos buscando
          if (t.key.startsWith('place.') && placeIds.some(id => t.key.includes(`place.${id}.`))) {
            const placeId = t.key.split('.')[1]; // place.{placeId}.field
            const field = t.key.split('.').pop();
            
            if (!translationsMap.has(placeId)) {
              translationsMap.set(placeId, {});
            }
            
            const placeTranslations = translationsMap.get(placeId);
            if (placeTranslations && field) {
              placeTranslations[field] = t.value;
            }
          }
        });
      }

      // Aplicar traducciones a los lugares
      const translatedPlaces = places.map(place => {
        const translations = translationsMap.get(place.id);
        
        if (translations && (translations.name || translations.description)) {
          return {
            ...place,
            name: translations.name || place.name,
            description: translations.description || place.description,
            title: translations.title || place.title
          };
        }
        
        return place; // Retornar lugar original si no hay traducciones
      });

      console.log(`✅ Aplicadas traducciones para ${targetLanguage} a ${translatedPlaces.length} lugares`);
      return translatedPlaces;

    } catch (err) {
      console.error('Error translating places:', err);
      return places; // Retornar lugares originales si hay error
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getPlaceTranslations,
    translatePlaces
  };
}

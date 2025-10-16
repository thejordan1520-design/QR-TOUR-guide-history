import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createTranslationService } from '../services/translationService';

interface PlaceTranslation {
  id: string;
  key: string;
  language: string;
  value: string;
}

interface TranslatedPlace {
  id: string;
  name: string;
  description: string;
  title?: string;
  // Campos originales
  original_name: string;
  original_description: string;
  original_title?: string;
  // Otros campos del lugar
  [key: string]: any;
}

export function usePlaceTranslations() {
  const [translations, setTranslations] = useState<Map<string, PlaceTranslation[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationService = createTranslationService();

  // Cargar traducciones existentes para un lugar
  const loadTranslations = useCallback(async (placeId: string) => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .like('key', `place.${placeId}.%`);

      if (error) throw error;

      setTranslations(prev => {
        const newMap = new Map(prev);
        newMap.set(placeId, data || []);
        return newMap;
      });

      return data || [];
    } catch (err) {
      console.error('Error loading translations:', err);
      return [];
    }
  }, []);

  // Traducir un lugar completo
  const translatePlace = useCallback(async (
    place: any, 
    targetLanguage: string, 
    sourceLanguage = 'es'
  ): Promise<TranslatedPlace> => {
    const placeId = place.id;
    
    // Cargar traducciones existentes
    const existingTranslations = await loadTranslations(placeId);
    
    // Crear mapa de traducciones existentes
    const translationMap = new Map<string, string>();
    existingTranslations.forEach(t => {
      if (t.language === targetLanguage) {
        const fieldName = t.key.split('.').pop(); // Extraer field_name del key
        if (fieldName) {
          translationMap.set(fieldName, t.value);
        }
      }
    });

    // Si ya tenemos todas las traducciones necesarias, usarlas
    if (translationMap.has('name') && translationMap.has('description')) {
      return {
        ...place,
        original_name: place.name,
        original_description: place.description,
        original_title: place.title,
        name: translationMap.get('name') || place.name,
        description: translationMap.get('description') || place.description,
        title: place.title ? (translationMap.get('title') || place.title) : undefined
      };
    }

    // Si no tenemos traducciones, generarlas
    setLoading(true);
    try {
      const translationResult = await translationService.translatePlace({
        name: place.name,
        description: place.description,
        title: place.title
      }, sourceLanguage);

      // Guardar las traducciones en la base de datos usando la estructura existente
      const translationsToSave = [
        {
          key: `place.${placeId}.name`,
          language: targetLanguage,
          value: translationResult.name[targetLanguage as keyof typeof translationResult.name]
        },
        {
          key: `place.${placeId}.description`,
          language: targetLanguage,
          value: translationResult.description[targetLanguage as keyof typeof translationResult.description]
        }
      ];

      if (place.title) {
        translationsToSave.push({
          key: `place.${placeId}.title`,
          language: targetLanguage,
          value: translationResult.title![targetLanguage as keyof typeof translationResult.title]
        });
      }

      // Insertar traducciones en la base de datos
      const { error: insertError } = await supabase
        .from('translations')
        .upsert(translationsToSave);

      if (insertError) {
        console.error('Error saving translations:', insertError);
      } else {
        // Actualizar el estado local
        await loadTranslations(placeId);
      }

      return {
        ...place,
        original_name: place.name,
        original_description: place.description,
        original_title: place.title,
        name: translationResult.name[targetLanguage as keyof typeof translationResult.name],
        description: translationResult.description[targetLanguage as keyof typeof translationResult.description],
        title: place.title ? translationResult.title![targetLanguage as keyof typeof translationResult.title] : undefined
      };

    } catch (err) {
      console.error('Error translating place:', err);
      setError('Error al traducir el lugar');
      
      // Retornar lugar sin traducción en caso de error
      return {
        ...place,
        original_name: place.name,
        original_description: place.description,
        original_title: place.title
      };
    } finally {
      setLoading(false);
    }
  }, [translationService, loadTranslations]);

  // Traducir múltiples lugares
  const translatePlaces = useCallback(async (
    places: any[], 
    targetLanguage: string, 
    sourceLanguage = 'es'
  ): Promise<TranslatedPlace[]> => {
    setLoading(true);
    setError(null);

    try {
      const translatedPlaces = await Promise.all(
        places.map(place => translatePlace(place, targetLanguage, sourceLanguage))
      );

      return translatedPlaces;
    } catch (err) {
      console.error('Error translating places:', err);
      setError('Error al traducir los lugares');
      return places.map(place => ({
        ...place,
        original_name: place.name,
        original_description: place.description,
        original_title: place.title
      }));
    } finally {
      setLoading(false);
    }
  }, [translatePlace]);

  // Obtener traducción específica de un campo
  const getTranslation = useCallback((placeId: string, fieldName: string, language: string): string | null => {
    const placeTranslations = translations.get(placeId);
    if (!placeTranslations) return null;

    const translation = placeTranslations.find(
      t => t.key === `place.${placeId}.${fieldName}` && t.language === language
    );

    return translation?.value || null;
  }, [translations]);

  // Limpiar traducciones del caché
  const clearTranslations = useCallback(() => {
    setTranslations(new Map());
  }, []);

  return {
    translations,
    loading,
    error,
    translatePlace,
    translatePlaces,
    getTranslation,
    loadTranslations,
    clearTranslations
  };
}

// Utilidades para manejar traducciones de lugares
import { supabase } from '../lib/supabase';

export interface PlaceTranslation {
  id: string;
  key: string;
  language: string;
  value: string;
}

export interface TranslatedPlace {
  id: string;
  name: string;
  description: string;
  title?: string;
  [key: string]: any;
}

// Cache de traducciones para evitar consultas repetidas
const translationCache = new Map<string, PlaceTranslation[]>();

// Función para limpiar el cache
export const clearTranslationCache = () => {
  translationCache.clear();
  console.log('🧹 Cache de traducciones limpiado');
};

// Función para obtener traducciones de un lugar específico
export const getPlaceTranslations = async (
  placeId: string, 
  language: string
): Promise<PlaceTranslation[]> => {
  const cacheKey = `${placeId}-${language}`;
  
  // Verificar cache primero
  if (translationCache.has(cacheKey)) {
    console.log(`📦 Traducciones de ${placeId} (${language}) obtenidas del cache`);
    return translationCache.get(cacheKey) || [];
  }

  try {
    console.log(`🌐 Obteniendo traducciones para ${placeId} en ${language}...`);
    
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .like('key', `place.${placeId}.%`)
      .eq('language', language);

    if (error) {
      console.error('Error getting place translations:', error);
      return [];
    }

    // Guardar en cache
    translationCache.set(cacheKey, data || []);
    
    console.log(`✅ ${data?.length || 0} traducciones obtenidas para ${placeId} (${language})`);
    return data || [];

  } catch (err) {
    console.error('Error in getPlaceTranslations:', err);
    return [];
  }
};

// Función para aplicar traducciones a un lugar
export const applyTranslationsToPlace = (
  place: any,
  translations: PlaceTranslation[]
): TranslatedPlace => {
  if (!translations || translations.length === 0) {
    return place;
  }

  // Organizar traducciones por campo
  const translatedData: any = {};
  translations.forEach(t => {
    const field = t.key.split('.').pop();
    if (field) {
      translatedData[field] = t.value;
    }
  });

  return {
    ...place,
    name: translatedData.name || place.name,
    description: translatedData.description || place.description,
    title: translatedData.title || place.title
  };
};

// Función para traducir múltiples lugares o excursiones
export const translatePlaces = async (
  places: any[],
  targetLanguage: string
): Promise<any[]> => {
  // console.log(`🌐 Traduciendo ${places.length} elementos a ${targetLanguage}...`);

  try {
    // Obtener todas las traducciones de una vez para mejor rendimiento
    // Buscar tanto place.* como excursion.*
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('language', targetLanguage)
      .or('key.like.place.%,key.like.excursion.%');

    if (error) {
      console.error('Error getting translations:', error);
      return places;
    }

    // Crear mapa de traducciones por ID
    const translationsMap = new Map<string, PlaceTranslation[]>();
    
    if (data) {
      data.forEach(t => {
        // Extraer ID y tipo (place.{id}.field o excursion.{id}.field)
        const parts = t.key.split('.');
        const type = parts[0]; // 'place' o 'excursion'
        const id = parts[1]; // el ID del elemento
        
        if (!translationsMap.has(id)) {
          translationsMap.set(id, []);
        }
        
        translationsMap.get(id)?.push(t);
      });
    }

    // Aplicar traducciones a cada elemento
    const translatedPlaces = places.map(place => {
      const translations = translationsMap.get(place.id);
      return applyTranslationsToPlace(place, translations || []);
    });

    // console.log(`✅ ${translatedPlaces.length} elementos traducidos a ${targetLanguage}`);
    return translatedPlaces;

  } catch (err) {
    console.error('Error translating places:', err);
    return places;
  }
};

// Función para detectar cambios de idioma y recargar traducciones
export const setupLanguageChangeListener = (
  callback: (language: string) => void
) => {
  // Escuchar cambios en localStorage
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'i18nextLng' && e.newValue) {
      console.log(`🌐 Idioma cambiado a: ${e.newValue}`);
      clearTranslationCache(); // Limpiar cache al cambiar idioma
      callback(e.newValue);
    }
  };

  // Escuchar cambios programáticos
  const handleLanguageChange = () => {
    const currentLanguage = localStorage.getItem('i18nextLng') || 'es';
    console.log(`🌐 Idioma detectado: ${currentLanguage}`);
    clearTranslationCache();
    callback(currentLanguage);
  };

  // Agregar listeners
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('languageChanged', handleLanguageChange);

  // Retornar función de limpieza
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('languageChanged', handleLanguageChange);
  };
};

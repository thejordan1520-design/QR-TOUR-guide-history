import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { DataSyncManager } from '../utils/dataSync';
import { translatePlaces, setupLanguageChangeListener } from '../utils/translationUtils';

interface AudioDestination {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  audios: {
    es: string;
    en: string;
    fr: string;
  };
}

// Función para crear datos de fallback con traducciones
const createFallbackDestinations = (t: any): AudioDestination[] => [
  {
    id: 'calle-de-las-chichiguas-cometas',
    name: t('locations.calle-de-las-chichiguas-cometas.name', 'Calle de las Chichigua (Cometas)'),
    slug: 'calle-de-las-chichiguas-cometas',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/calledelacometas.jpg',
    description: t('locations.calle-de-las-chichiguas-cometas.description', 'Una colorida calle llena de cometas tradicionales dominicanas'),
    latitude: 19.799827,
    longitude: -70.691930,
    category: 'cultural',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/calledelacometas.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/calledelacometasING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/calledelacometasFRC.mp3'
    }
  },
  {
    id: 'calle-de-las-sombrillas',
    name: t('locations.calle-de-las-sombrillas.name', 'Calle de las Sombrillas'),
    slug: 'calle-de-las-sombrillas',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/calledelasombrillas%20-%20copia.jpg',
    description: t('locations.calle-de-las-sombrillas.description', 'Una hermosa calle decorada con sombrillas coloridas'),
    latitude: 0,
    longitude: 0,
    category: 'cultural',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/callesombrillas.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/callesombrillaING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/callesombrillaFRC.mp3'
    }
  },
  {
    id: 'calle-rosada',
    name: t('locations.calle-rosada.name', 'Calle Rosada'),
    slug: 'calle-rosada',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/callerosada.jpg',
    description: t('locations.calle-rosada.description', 'Una calle pintada de rosa con encanto colonial'),
    latitude: 0,
    longitude: 0,
    category: 'cultural',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/callerosada.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/callerosadaING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/callerosadaFRC.mp3'
    }
  },
  {
    id: 'museo-del-ambar',
    name: t('locations.museo-del-ambar.name', 'Museo del Ámbar'),
    slug: 'museo-del-ambar',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/museoambar.jpg',
    description: t('locations.museo-del-ambar.description', 'Museo dedicado al ámbar dominicano y su historia'),
    latitude: 19.799827,
    longitude: -70.691930,
    category: 'cultural',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/museoambar.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/museoambarING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/museoambarFRC.mp3'
    }
  },
  {
    id: 'letrero-puerto-plata',
    name: t('locations.letrero-puerto-plata.name', 'Letrero Puerto Plata'),
    slug: 'letrero-puerto-plata',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/letreropuertoplata.jpg',
    description: t('locations.letrero-puerto-plata.description', 'El icónico letrero de bienvenida a Puerto Plata'),
    latitude: 19.799827,
    longitude: -70.691930,
    category: 'cultural',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/letreropuertoplata.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/letreropuertoplataING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/letreropuertoplataFRC.mp3'
    }
  },
  {
    id: 'teleferico',
    name: t('locations.teleferico.name', 'Teleférico'),
    slug: 'teleferico',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/teleferico.jpg',
    description: t('locations.teleferico.description', 'El teleférico que lleva al pico Isabel de Torres'),
    latitude: 19.799827,
    longitude: -70.691930,
    category: 'turismo',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/teleferico.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/telefericoING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/telefericoFRC.mp3'
    }
  },
  {
    id: 'fortaleza-san-felipe',
    name: t('locations.fortaleza-san-felipe.name', 'Fortaleza San Felipe'),
    slug: 'fortaleza-san-felipe',
    image: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/fortalezasanfelipe.jpg',
    description: t('locations.fortaleza-san-felipe.description', 'Fortaleza histórica del siglo XVI'),
    latitude: 19.799827,
    longitude: -70.691930,
    category: 'histórico',
    audios: {
      es: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/fortalezasanfelipe.mp3',
      en: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/fortalezasanfelipeING.mp3',
      fr: 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-audio/fortalezasanfelipeFRC.mp3'
    }
  }
];

export const useAudioDestinations = (refreshTrigger?: number) => {
  const { t, i18n } = useTranslation();
  const [destinations, setDestinations] = useState<AudioDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching destinations from database...');
      const { data, error } = await supabase
        .from('destinations')
        .select('*');
      
      console.log('🔍 Raw response:', { data: data?.length, error });

      // Si hay error o no hay datos, usar fallback con traducciones
      if (error || !data || data.length === 0) {
        console.log('⚠️ No data from DB. Error:', error);
        
        // Si el error es JWT expirado, limpiar sesión
        if (error?.message?.includes('JWT') || error?.message?.includes('expired')) {
          console.log('🔄 JWT expired, clearing session...');
          await supabase.auth.signOut();
        }
        
        console.log('🔄 Using fallback destinations with translations...');
        const fallbackDestinations = createFallbackDestinations(t);
        setDestinations(fallbackDestinations);
        setError(null); // No mostrar error si tenemos fallback
        return;
      }

      console.log(`📊 Raw data from DB: ${data.length} records`);

      // Validar que no haya duplicados antes de procesar
      const uniqueDestinations = data.filter((dest, index, self) => {
        const name = dest.name || dest.title;
        const firstIndex = self.findIndex(d => (d.name || d.title) === name);
        if (firstIndex !== index) {
          console.warn(`⚠️ DUPLICADO DETECTADO: "${name}" (ID: ${dest.id}) - Se omite el duplicado`);
          return false;
        }
        return true;
      });

      // Filtrar solo lugares que tienen audios (para la biblioteca de audio)
      const destinationsWithAudio = uniqueDestinations.filter(dest => {
        const hasAudio = dest.audios?.es || dest.audios?.en || dest.audios?.fr || 
                        dest.audio_es || dest.audio_en || dest.audio_fr;
        if (!hasAudio) {
          console.log(`🔇 Sin audio: ${dest.name} (ID: ${dest.id})`);
        }
        return hasAudio;
      });

      console.log(`🎵 Destinos con audio: ${destinationsWithAudio.length} de ${uniqueDestinations.length}`);

      console.log(`📊 Destinos únicos después de filtrado: ${uniqueDestinations.length} de ${data.length}`);

      // Procesar destinos y aplicar traducciones según el idioma actual
      let transformedDestinations: AudioDestination[] = destinationsWithAudio.map((dest: any) => {
        const id = String(dest.id || dest.slug || 'unknown');
        
        // Imagen: usar directamente de la BD o placeholder
        const image = dest.image_url || '/places/placeholder.jpg';
        
        // Audios: usar directamente de la BD
        const audios = {
          es: String(dest.audios?.es || dest.audio_es || ''),
          en: String(dest.audios?.en || dest.audio_en || ''),
          fr: String(dest.audios?.fr || dest.audio_fr || '')
        };

        // Debug: mostrar información de audios
        if (dest.audios) {
          console.log(`🎵 Audios para ${id}:`, dest.audios);
        }

        console.log(`📝 Processing destination: ${id} -> "${dest.name}"`);

        return {
          id,
          name: dest.name || dest.title || 'Sin nombre',
          slug: id,
          image: String(image),
          description: dest.description || 'Sin descripción',
          latitude: Number(dest.latitude ?? 0) || 0,
          longitude: Number(dest.longitude ?? 0) || 0,
          category: String(dest.category || 'turistico'),
          audios
        } as AudioDestination;
      });

      // Aplicar traducciones dinámicamente según el idioma seleccionado
      const currentLanguage = i18n.language;
      // console.log(`🌐 Idioma actual: ${currentLanguage}`);
      
      // SIEMPRE aplicar traducciones para todos los idiomas
      // console.log(`🌐 Aplicando traducciones para idioma: ${currentLanguage}`);
      try {
        const translatedDestinations = await translatePlaces(transformedDestinations, currentLanguage);
        transformedDestinations = translatedDestinations;
        // console.log(`✅ Traducciones aplicadas para ${currentLanguage}`);
      } catch (translationError) {
        console.error('❌ Error aplicando traducciones:', translationError);
        // Continuar con los datos originales si falla la traducción
      }

      console.log(`✅ Loaded ${transformedDestinations.length} destinations from database`);
      console.log('🔍 First few destinations:', transformedDestinations.slice(0, 3));
      setDestinations(transformedDestinations);
    } catch (err: unknown) {
      console.error('❌ Error fetching destinations:', err);
      
      // Si el error es JWT expirado, limpiar sesión
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('JWT') || errorMessage.includes('expired')) {
        console.log('🔄 JWT expired, clearing session...');
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.log('Error clearing session:', signOutError);
        }
      }
      
      // Usar fallback con traducciones en caso de error
      console.log('🔄 Using fallback destinations due to error...');
      const fallbackDestinations = createFallbackDestinations(t);
      setDestinations(fallbackDestinations);
      setError(null); // No mostrar error si tenemos fallback
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Usar el nuevo sistema de sincronización
  useEffect(() => {
    const manager = DataSyncManager.getInstance();
    const unsubscribe = manager.subscribe(() => {
      // Forzar recarga cuando hay cambios
      console.log('🔄 DataSync: Cambio detectado, recargando destinos...');
      fetchDestinations();
    });

    return unsubscribe;
  }, [fetchDestinations]);

  useEffect(() => {
    fetchDestinations();
  }, [refreshTrigger]);

  // Aplicar traducciones cuando cambie el idioma
  useEffect(() => {
    const applyTranslations = async () => {
      const currentLanguage = i18n.language;
      // console.log(`🌐 Idioma actual: ${currentLanguage}`);
      
      if (destinations.length > 0) {
        // console.log(`🌐 Aplicando traducciones para ${currentLanguage}...`);
        try {
          const translatedDestinations = await translatePlaces(destinations, currentLanguage);
          setDestinations(translatedDestinations);
          // console.log(`✅ Traducciones aplicadas para ${currentLanguage}`);
        } catch (err) {
          console.error('❌ Error aplicando traducciones:', err);
        }
      }
    };

    // Aplicar traducciones cuando cambie el idioma
    applyTranslations();
  }, [i18n.language, destinations]); // Depender del idioma y destinos

  return { destinations, loading, error };
};


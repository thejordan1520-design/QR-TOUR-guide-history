import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeOrderSync } from '../services/realtimeOrderSync';

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

export const useSafeAudioDestinations = (refreshTrigger?: number) => {
  const [destinations, setDestinations] = useState<AudioDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 [SafeAudio] Fetching destinations from database...');
      
      const { data, error: fetchError } = await supabase
        .from('destinations')
        .select('id, name, title, description, image_url, latitude, longitude, category, created_at, order_position, audio_es, audio_en, audio_fr, audios, is_active')
        .order('order_position', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      console.log('🔍 [SafeAudio] Raw response:', { data: data?.length, error: fetchError });

      if (!data || data.length === 0) {
        console.log('⚠️ [SafeAudio] No data from DB. Setting empty destinations.');
        setDestinations([]);
        setError(null);
        return;
      }

      console.log(`📊 [SafeAudio] Raw data from DB: ${data.length} records`);

      const destinationsWithAudio = data.filter((dest: any) => {
        if (dest.is_active !== undefined && !dest.is_active) {
          console.log(`🚫 [SafeAudio] Inactivo: ${dest.name} (ID: ${dest.id})`);
          return false;
        }

        const hasAudio = (dest.audios && (dest.audios.es || dest.audios.en || dest.audios.fr)) ||
                        dest.audio_es || dest.audio_en || dest.audio_fr;
        
        if (dest.audios) {
          console.log(`🎵 [SafeAudio] ${dest.name} tiene audios objeto:`, {
            es: !!dest.audios.es,
            en: !!dest.audios.en,
            fr: !!dest.audios.fr
          });
        } else if (dest.audio_es || dest.audio_en || dest.audio_fr) {
          console.log(`🎵 [SafeAudio] ${dest.name} tiene audios columnas:`, {
            es: !!dest.audio_es,
            en: !!dest.audio_en,
            fr: !!dest.audio_fr
          });
        }
        
        if (!hasAudio) {
          console.log(`🔇 [SafeAudio] Sin audio: ${dest.name} (ID: ${dest.id})`);
        } else {
          console.log(`🎵 [SafeAudio] Con audio: ${dest.name} (ID: ${dest.id})`);
        }
        
        return hasAudio;
      });

      console.log(`🎵 [SafeAudio] Destinos con audio: ${destinationsWithAudio.length} de ${data.length}`);

      const transformedDestinations: AudioDestination[] = destinationsWithAudio.map((dest: any) => {
        const id = String(dest.id || dest.slug || 'unknown');
        
        return {
          id,
          name: dest.name || dest.title || 'Sin nombre',
          slug: id,
          image: String(dest.image_url || '/places/placeholder.jpg'),
          description: dest.description || 'Sin descripción',
          latitude: Number(dest.latitude ?? 0) || 0,
          longitude: Number(dest.longitude ?? 0) || 0,
          category: String(dest.category || 'turistico'),
          audios: {
            es: String((dest.audios && dest.audios.es) || dest.audio_es || ''),
            en: String((dest.audios && dest.audios.en) || dest.audio_en || ''),
            fr: String((dest.audios && dest.audios.fr) || dest.audio_fr || '')
          }
        } as AudioDestination;
      });

      if (transformedDestinations.length === 0) {
        console.log('⚠️ [SafeAudio] No destinations with audio found. Setting empty destinations.');
        setDestinations([]);
      } else {
        setDestinations(transformedDestinations);
        console.log(`✅ [SafeAudio] ${transformedDestinations.length} destinations loaded successfully`);
      }

    } catch (error: any) {
      console.error('❌ [SafeAudio] Error loading destinations:', error);
      setError(error.message || 'Error cargando destinos');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isConnected } = useRealtimeOrderSync(['destinations'], () => {
    console.log('🔄 [SafeAudio] Realtime update detected -> refreshing destinations');
    fetchDestinations();
  });

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations, refreshTrigger]);

  return {
    destinations,
    loading,
    error,
    refetch: fetchDestinations,
    isRealtimeConnected: isConnected
  };
};

export default useSafeAudioDestinations;
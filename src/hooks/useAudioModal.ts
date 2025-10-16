import { useState, useEffect } from 'react';
import { destinationsService } from '../supabaseServices.js';

interface AudioConfig {
  spanish: string;
  english: string;
  french: string;
}

interface Location {
  id: string;
  name: string;
  image: string;
  audio: string;
  description: string;
  history: string;
  rating: number;
  duration: string;
  audioConfigs: AudioConfig;
}

// Fallback de configuraciones de audio
const fallbackAudioConfigs: Record<string, AudioConfig> = {
  'fortaleza-san-felipe': { 
    spanish: '/audio/audios/fortalezasanfelipe.mp3', 
    english: '/audio/audios/fortalezaING.mp3', 
    french: '/audio/audios/fortalezaFRC.mp3' 
  },
  'calle-sombrillas': { 
    spanish: '/audio/audios/callesombrillas.mp3', 
    english: '/audio/audios/callesombrillaING.mp3', 
    french: '/audio/audios/callesombrillaFRC.mp3' 
  },
  'calle-rosada': { 
    spanish: '/audio/audios/callerosada.mp3', 
    english: '/audio/audios/callerosadaING.mp3', 
    french: '/audio/audios/callerosadaFRC.mp3' 
  },
  'letrero-puerto-plata': { 
    spanish: '/audio/audios/letreropuertoplata.mp3', 
    english: '/audio/audios/letreroING.mp3', 
    french: '/audio/audios/letreroFRC.mp3' 
  },
  'museo-ambar': { 
    spanish: '/audio/audios/museodelambar.mp3', 
    english: '/audio/audios/museoambarING.mp3', 
    french: '/audio/audios/museoambarFRC.mp3' 
  },
  'ronfactory': { 
    spanish: '/audio/audios/ronfactory.mp3', 
    english: '/audio/audios/ronfactoryING.mp3', 
    french: '/audio/audios/ronfactoryFRC.mp3' 
  },
  'larimarr': { 
    spanish: '/audio/audios/larimarr.mp3', 
    english: '/audio/audios/larimarING.mp3', 
    french: '/audio/audios/larimarFRC.mp3' 
  },
  'hermanasmirabal': { 
    spanish: '/audio/audios/hermanasmirabal.mp3', 
    english: '/audio/audios/hermanasmirabalING.mp3', 
    french: '/audio/audios/hermanasmirabalFRC.mp3' 
  },
  'neptuno': { 
    spanish: '/audio/audios/neptuno.mp3', 
    english: '/audio/audios/neptuneiING.mp3', 
    french: '/audio/audios/nepturnoFRC.mp3' 
  },
  'catedralsanfelipe': { 
    spanish: '/audio/audios/catedralsanfelipe.mp3', 
    english: '/audio/audios/catedralING.mp3', 
    french: '/audio/audios/catedralsanfelipeFRC.mp3' 
  },
  'cristoredentor': { 
    spanish: '/audio/audios/cristoredentor.mp3', 
    english: '/audio/audios/cristoredentorING.mp3', 
    french: '/audio/audios/cristoredentorFRC.mp3' 
  },
  'calledelacometas': { 
    spanish: '/audio/audios/calledelacometas.mp3', 
    english: '/audio/audios/cometasING.mp3', 
    french: '/audio/audios/calledelacometasFRC.mp3' 
  },
  'teleferico-puerto-plata': { 
    spanish: '/audio/audios/telefericoESP.mp3', 
    english: '/audio/audios/telefericoING.mp3', 
    french: '/audio/audios/telefericoFRC.mp3' 
  },
  'parque-central': { 
    spanish: '/audio/audios/parquecentralESP.mp3', 
    english: '/audio/audios/paequecentralING.mp3', 
    french: '/audio/audios/parquecentralFRC.mp3' 
  },
  'museo-gregorio-luperon': { 
    spanish: '/audio/audios/museogregorioluperonESP.mp3', 
    english: '/audio/audios/museogregorioluperonING.mp3', 
    french: '/audio/audios/museogregorioluperonFRC.mp3' 
  },
  'ocean-world': { 
    spanish: '/audio/audios/oceaworldESP.mp3', 
    english: '/audio/audios/oceanworldING.mp3', 
    french: '/audio/audios/oceanworldFRC.mp3' 
  }
};

export const useAudioModal = (locationId: string | undefined) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await destinationsService.getDestinationById(locationId);

        if (error || !data) {
          setError('Location not found');
          setLocation(null);
        } else {
          // Usar imagen específica para Museo del Ámbar
          let imageUrl = data.images?.[0] || `/places/${data.id}.jpg`;
          if (data.id === 'museo-ambar') {
            imageUrl = '/places/museodelambar.jpg';
          }

          const locationData: Location = {
            id: data.id,
            name: data.name,
            image: imageUrl,
            audio: fallbackAudioConfigs[data.id]?.spanish || '',
            description: data.description || 'No description available',
            history: data.history || data.description || 'No history available',
            rating: data.rating || 4.7,
            duration: '10 min',
            audioConfigs: fallbackAudioConfigs[data.id] || {
              spanish: '',
              english: '',
              french: ''
            }
          };

          setLocation(locationData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  return { location, loading, error };
};

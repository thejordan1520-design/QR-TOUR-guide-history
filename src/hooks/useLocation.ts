import { useState, useEffect } from 'react';
import { destinationsService } from '../supabaseServices';

export interface LocationData {
  id: string;
  name: string;
  slug: string;
  image: string;
  descriptionShort: string;
  descriptionFull: string;
  gpsLat: number;
  gpsLng: number;
  rating: number;
  duration: number;
  audios: {
    es: string;
    en: string;
    fr: string;
    pt: string;
  };
  gallery: string[];
  curiosities: string[];
  address: string;
  directions: string;
}

export const useLocation = (slug: string) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await destinationsService.getDestinationById(slug);

        if (error) {
          console.error('Error fetching location from Supabase:', error);
          setError(error.message);
          setLocation(null);
        } else if (data) {
          console.log('✅ Location loaded from Supabase:', data);
          
          // Convertir datos de Supabase al formato esperado por LocationPage
          const locationData: LocationData = {
            id: data.id,
            name: data.name,
            slug: data.id,
            image: data.images && data.images.length > 0 ? data.images[0] : '/places/placeholder.jpg',
            descriptionShort: data.description ? data.description.substring(0, 100) + '...' : 'Descripción no disponible',
            descriptionFull: data.description || 'Descripción completa no disponible',
            gpsLat: data.latitude || 0,
            gpsLng: data.longitude || 0,
            rating: 4.5, // Rating por defecto
            duration: 15, // Duración por defecto
            audios: {
              es: `/audios/${data.id.toLowerCase().replace(/\s+/g, '')}.mp3`,
              en: `/audios/${data.id.toLowerCase().replace(/\s+/g, '')}ING.mp3`,
              fr: `/audios/${data.id.toLowerCase().replace(/\s+/g, '')}FRC.mp3`,
              pt: `/audios/${data.id.toLowerCase().replace(/\s+/g, '')}PT.mp3`
            },
            gallery: data.images || ['/places/placeholder.jpg'],
            curiosities: [
              'Dato curioso 1 sobre este lugar',
              'Dato curioso 2 sobre este lugar',
              'Dato curioso 3 sobre este lugar'
            ],
            address: 'Dirección no disponible',
            directions: 'Instrucciones de acceso no disponibles'
          };
          
          setLocation(locationData);
        } else {
          setLocation(null);
        }
      } catch (err) {
        console.error('Error in fetchLocation:', err);
        setError('Failed to fetch location');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [slug]);

  return { location, loading, error };
};

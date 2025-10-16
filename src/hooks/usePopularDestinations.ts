import { useState, useEffect } from 'react';
import { destinationsService } from '../supabaseServices';

interface Destination {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  images: string[];
}

export const usePopularDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeSlug = (s: string) => (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-');

  const fallbackImages: Record<string, string> = {
    'calle-de-las-chichiguas-cometas': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/calledelacometas.jpg',
    'calle-de-las-sombrillas': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/calledelasombrillas%20-%20copia.jpg',
    'catedral-san-felipe': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/catedralsanfelipe.jpg',
    'cristo-redentor': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/cristo%20redentor.jpg',
    'fortaleza-san-felipe': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/fortalezasanfelipe.jpg',
    'letrero-puerto-plata': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/letreropuertoplata.jpg',
    'monumento-hermanas-mirabal': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/hermanasmirabal.jpg',
    'museo-del-mbar': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/museodelambar%20-%20copia.jpg',
    'museo-del-ambar': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/museodelambar%20-%20copia.jpg',
    'museo-del-larimar': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/larimarr.jpg',
    'museo-general-gregorio-luper-n': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/MuseoGregorioLuperon.jpg',
    'museo-general-gregorio-luperon': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/MuseoGregorioLuperon.jpg',
    'neptuno-malec-n': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/neptuno.jpg',
    'ocean-world': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/oceanworld.jpg',
    'parque-central-de-puerto-plata': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/parque%20central.jpg',
    'calle-rosada': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/callerosada.jpg',
    'ron-factory': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/run%20factory.jpg',
    'telef-rico': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/teleferico.jpg',
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await destinationsService.getPopularDestinations(10);

        if (error) {
          console.error('Error fetching popular destinations from Supabase:', error);
          setError(error.message);
          setDestinations([]);
        } else {
          const cleaned = (data || []).map((d: any) => {
            const slug = normalizeSlug(String(d.slug || d.id || d.name || d.title || ''));
            const img = d.image_url || d.image || (Array.isArray(d.images) && d.images.length ? d.images[0] : undefined) || fallbackImages[slug];
            return {
              id: String(d.id || slug),
              name: String(d.name || d.title || slug),
              description: String(d.description || ''),
              latitude: Number(d.latitude ?? 0),
              longitude: Number(d.longitude ?? 0),
              category: String(d.category || 'cultural'),
              images: img ? [String(img)] : [],
            } as Destination;
          });
          setDestinations(cleaned);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching popular destinations:', err);
        setError(err.message);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return { destinations, loading, error };
};

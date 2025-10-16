import { useState, useEffect } from 'react';
import { advertisementsService } from '../supabaseServices';

interface Advertisement {
  id: string;
  title_es?: string;
  title_en?: string;
  title_fr?: string;
  content_es?: string;
  content_en?: string;
  content_fr?: string;
  cta_text_es?: string;
  cta_text_en?: string;
  cta_text_fr?: string;
  cta_url?: string;
  image_url?: string;
  audio_url?: string;
  type?: string;
  status?: string;
  priority?: number;
  is_premium_only?: boolean;
}

export const useAdvertisements = (language: string = 'es', section?: string) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      setLoading(true);
      setError(null);
      try {
        let { data, error } = await advertisementsService.getAdvertisementsByLanguage(language);
        
        if (error) {
          console.error('Error fetching advertisements from Supabase:', error);
          setError(error.message);
          setAdvertisements([]);
        } else {
          // Filtrar por sección si se especifica
          if (section && data) {
            data = data.filter(ad => 
              ad.target_sections && 
              Array.isArray(ad.target_sections) && 
              ad.target_sections.includes(section)
            );
          }
          setAdvertisements(data || []);
          console.log('✅ Advertisements loaded from Supabase:', data?.length || 0, 'ads');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching advertisements:', err);
        setError(err.message);
        setAdvertisements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [language, section]);

  return { advertisements, loading, error };
};

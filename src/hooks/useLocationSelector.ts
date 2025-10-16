import { useState, useEffect } from 'react';
import { destinationsService } from '../supabaseServices.js';

interface Hotel {
  name: string;
  coordinates: { lat: number; lng: number };
  area: string;
}

interface LocationSelectorData {
  hotels: Hotel[];
  attractions: any[];
  loading: boolean;
  error: string | null;
}

// Fallback de hoteles (manteniendo los datos originales)
const getFallbackHotels = (t: any): Hotel[] => [
  // Maimón
  { name: t('hotels.hotel_maimon_beach_resort'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.maimon') },
  { name: t('hotels.costa_dorada_resort'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.maimon') },
  
  // Playa Dorada
  { name: t('hotels.iberostar_costa_dorada'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.barcelo_puerto_plata'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.viva_wyndham_v_heavens'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.bluebay_villas_doradas'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.sunscape_puerto_plata'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.lifestyle_tropical_beach_resort'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.grand_paradise_playa_dorada'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  { name: t('hotels.playa_dorada_golf_club_resort'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.playa_dorada') },
  
  // Puerto Plata Centro
  { name: t('hotels.hotel_puerto_plata'), coordinates: { lat: 19.7939, lng: -70.6914 }, area: t('hotels.puerto_plata_centro') },
  { name: t('hotels.hotel_castilla'), coordinates: { lat: 19.7945, lng: -70.6918 }, area: t('hotels.puerto_plata_centro') },
  { name: t('hotels.hotel_marien'), coordinates: { lat: 19.7944, lng: -70.6916 }, area: t('hotels.puerto_plata_centro') },
  { name: t('hotels.hotel_victoria'), coordinates: { lat: 19.7942, lng: -70.6920 }, area: t('hotels.puerto_plata_centro') },
  { name: t('hotels.hotel_colonial'), coordinates: { lat: 19.7939, lng: -70.6914 }, area: t('hotels.puerto_plata_centro') },
  { name: t('hotels.hotel_europa'), coordinates: { lat: 19.7945, lng: -70.6918 }, area: t('hotels.puerto_plata_centro') },
  
  // Costambar
  { name: t('hotels.costambar_beach_resort'), coordinates: { lat: 19.7945, lng: -70.6918 }, area: t('hotels.costambar') },
  { name: t('hotels.hotel_costambar'), coordinates: { lat: 19.7945, lng: -70.6918 }, area: t('hotels.costambar') },
  { name: t('hotels.villas_costambar'), coordinates: { lat: 19.7945, lng: -70.6918 }, area: t('hotels.costambar') },
  
  // Sosúa
  { name: t('hotels.hotel_sosua'), coordinates: { lat: 19.7500, lng: -70.5167 }, area: t('hotels.sosua') },
  { name: t('hotels.hotel_el_morro'), coordinates: { lat: 19.7500, lng: -70.5167 }, area: t('hotels.sosua') },
  { name: t('hotels.hotel_la_puntilla'), coordinates: { lat: 19.7500, lng: -70.5167 }, area: t('hotels.sosua') },
  { name: t('hotels.hotel_el_batey'), coordinates: { lat: 19.7500, lng: -70.5167 }, area: t('hotels.sosua') },
  
  // Cabarete
  { name: t('hotels.hotel_cabarete'), coordinates: { lat: 19.7500, lng: -70.4000 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_kite_beach'), coordinates: { lat: 19.7500, lng: -70.4000 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_velero'), coordinates: { lat: 19.7500, lng: -70.4000 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_casa_linda'), coordinates: { lat: 19.7500, lng: -70.4000 }, area: t('hotels.cabarete') }
];

export const useLocationSelector = (t: any): LocationSelectorData => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar hoteles desde fallback (por ahora)
        setHotels(getFallbackHotels(t));

        // Cargar atracciones desde Supabase
        const { data, error } = await destinationsService.getAllDestinations();

        if (error || !data || data.length === 0) {
          setAttractions([]);
        } else {
          const transformedAttractions = data.map((dest: any) => ({
            id: dest.id,
            name: dest.name,
            description: dest.description || 'No description available',
            coordinates: { lat: dest.latitude || 0, lng: dest.longitude || 0 },
            category: dest.category || 'cultural',
            imageUrl: dest.images?.[0] || `/places/${dest.id}.jpg`,
            address: dest.address || '',
            rating: dest.rating || 4.5,
            reviews: dest.reviews || 0,
            isOpen: dest.isOpen !== undefined ? dest.isOpen : true
          }));
          
          setAttractions(transformedAttractions);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHotels(getFallbackHotels(t));
        setAttractions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  return { hotels, attractions, loading, error };
};

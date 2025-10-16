import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { destinationsService } from '../supabaseServices.js';
import { translatePlaces, setupLanguageChangeListener } from '../utils/translationUtils';

interface QRLocation {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  category: 'historico' | 'cultural' | 'recreativo' | 'religioso' | 'natural';
  qrCode: string;
  imageUrl?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  isOpen?: boolean;
  distance?: number;
}

// Fallback de ubicaciones QR (manteniendo los datos originales)
const fallbackQRLocations: QRLocation[] = [
  {
    id: 'parque-central',
    name: 'Parque Central',
    description: 'Corazón de la ciudad colonial',
    coordinates: { lat: 19.797645489933995, lng: -70.69338813105304 },
    category: 'historico',
    qrCode: 'QR001',
    imageUrl: '/places/ParqueCentraldePuertoPlata.jpg',
    address: 'Av. Duarte #1',
    rating: 4.6,
    reviews: 1988,
    isOpen: true,
  },
  {
    id: 'catedral',
    name: 'Catedral San Felipe',
    description: 'Arquitectura colonial religiosa',
    coordinates: { lat: 19.797469, lng: -70.693785 },
    category: 'religioso',
    qrCode: 'QR002',
    imageUrl: '/places/catedralsanfelipe.jpg',
    address: 'Calle San Felipe #1',
    rating: 4.8,
    reviews: 2500,
    isOpen: true,
  },
  {
    id: 'calle-sombrillas',
    name: 'Calle de las Sombrillas',
    description: 'Colorida calle peatonal',
    coordinates: { lat: 19.798463, lng: -70.694334 },
    category: 'cultural',
    qrCode: 'QR003',
    imageUrl: '/places/calledelasombrillas.jpg',
    address: 'Calle de las Sombrillas',
    rating: 4.5,
    reviews: 1200,
    isOpen: true,
  },
  {
    id: 'patio-dona-blanca',
    name: 'Patio de Doña Blanca (Calle Rosada)',
    description: 'Histórica calle colonial',
    coordinates: { lat: 19.798395370191646, lng: -70.69376707378993 },
    category: 'historico',
    qrCode: 'QR004',
    imageUrl: '/places/callerosada.jpg',
    address: 'Calle Rosada #123',
    rating: 4.7,
    reviews: 1800,
    isOpen: true,
  },
  {
    id: 'calle-cometas',
    name: 'Calle de las Cometas Voladoras',
    description: 'Arte urbano y tradición',
    coordinates: { lat: 19.799827, lng: -70.691930 },
    category: 'cultural',
    qrCode: 'QR005',
    imageUrl: '/places/calledelacometas.jpg',
    address: 'Calle de las Cometas Voladoras',
    rating: 4.6,
    reviews: 1500,
    isOpen: true,
  },
  {
    id: 'fortaleza-san-felipe',
    name: 'Fortaleza San Felipe',
    description: 'Histórica fortaleza del siglo XVI',
    coordinates: { lat: 19.804007, lng: -70.695785 },
    category: 'historico',
    qrCode: 'QR006',
    imageUrl: '/places/fortalezasanfelipe.jpg',
    address: 'Fortaleza San Felipe',
    rating: 4.9,
    reviews: 3000,
    isOpen: true,
  },
  {
    id: 'museo-ambar',
    name: 'Museo del Ámbar',
    description: 'Piedra preciosa dominicana',
    coordinates: { lat: 19.7944, lng: -70.6916 },
    category: 'cultural',
    qrCode: 'QR007',
    imageUrl: '/places/museodelambar.jpg',
    address: 'Museo del Ámbar',
    rating: 4.7,
    reviews: 2200,
    isOpen: true,
  },
  {
    id: 'letrero-puerto-plata',
    name: 'Letrero Puerto Plata',
    description: 'Símbolo de la ciudad',
    coordinates: { lat: 19.7975, lng: -70.6885 },
    category: 'cultural',
    qrCode: 'QR008',
    imageUrl: '/places/letreropuertoplata.jpg',
    address: 'Letrero Puerto Plata',
    rating: 4.5,
    reviews: 1800,
    isOpen: true,
  },
  {
    id: 'teleferico',
    name: 'Teleférico Puerto Plata',
    description: 'Vistas panorámicas de la ciudad',
    coordinates: { lat: 19.7833, lng: -70.6833 },
    category: 'recreativo',
    qrCode: 'QR009',
    imageUrl: '/places/teleferico.jpg',
    address: 'Teleférico Puerto Plata',
    rating: 4.8,
    reviews: 2800,
    isOpen: true,
  },
  {
    id: 'neptuno',
    name: 'Estatua Neptuno',
    description: 'Dios del mar en el malecón',
    coordinates: { lat: 19.7972, lng: -70.6889 },
    category: 'cultural',
    qrCode: 'QR010',
    imageUrl: '/places/neptuno.jpg',
    address: 'Estatua Neptuno',
    rating: 4.4,
    reviews: 1200,
    isOpen: true,
  }
];

export const useLocationMap = () => {
  const { i18n } = useTranslation();
  const [qrLocations, setQrLocations] = useState<QRLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await destinationsService.getAllDestinations();

        if (error || !data || data.length === 0) {
          setQrLocations(fallbackQRLocations);
        } else {
          let transformedLocations: QRLocation[] = data.map((dest: any) => ({
            id: dest.id,
            name: dest.name,
            description: dest.description || 'No description available',
            coordinates: { lat: dest.latitude || 0, lng: dest.longitude || 0 },
            category: dest.category || 'cultural',
            qrCode: dest.qrCode || `QR${dest.id}`,
            imageUrl: dest.image_url || `/places/${dest.id}.jpg`,
            address: dest.address || '',
            rating: dest.rating || 4.5,
            reviews: dest.reviews || 0,
            isOpen: dest.isOpen !== undefined ? dest.isOpen : true,
            distance: 0
          }));

          // Aplicar traducciones dinámicamente según el idioma seleccionado
          const currentLanguage = i18n.language;
          // console.log(`🌐 Idioma del mapa: ${currentLanguage}`);
          
          // SIEMPRE aplicar traducciones para todos los idiomas
          // console.log(`🌐 Aplicando traducciones para mapa - idioma: ${currentLanguage}`);
          try {
            const translatedLocations = await translatePlaces(transformedLocations, currentLanguage);
            transformedLocations = translatedLocations;
            // console.log(`✅ Traducciones del mapa aplicadas para ${currentLanguage}`);
          } catch (translationError) {
            console.error('❌ Error aplicando traducciones del mapa:', translationError);
            // Continuar con los datos originales si falla la traducción
          }
          
          setQrLocations(transformedLocations);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setQrLocations(fallbackQRLocations);
      } finally {
        setLoading(false);
      }
    };

    fetchQRLocations();
  }, []);

  // Aplicar traducciones cuando cambie el idioma
  useEffect(() => {
    const applyTranslations = async () => {
      const currentLanguage = i18n.language;
      // console.log(`🌐 Idioma del mapa: ${currentLanguage}`);
      
      if (qrLocations.length > 0) {
        // console.log(`🌐 Aplicando traducciones del mapa para ${currentLanguage}...`);
        try {
          const translatedLocations = await translatePlaces(qrLocations, currentLanguage);
          setQrLocations(translatedLocations);
          // console.log(`✅ Traducciones del mapa aplicadas para ${currentLanguage}`);
        } catch (err) {
          console.error('❌ Error aplicando traducciones del mapa:', err);
        }
      }
    };

    // Aplicar traducciones cuando cambie el idioma
    applyTranslations();
  }, [i18n.language, qrLocations]); // Depender del idioma y ubicaciones

  return { qrLocations, loading, error };
};

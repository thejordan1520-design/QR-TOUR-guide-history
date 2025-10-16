import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Star, MapPin } from 'lucide-react';
import LocationHistoryModal from '../components/ui/LocationHistoryModal';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../hooks/usePlaces';
import { useStorage } from '../hooks/useStorage';

// Función para obtener coordenadas por ID
const getLocationCoordinates = (locationId: string) => {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    'fortaleza-san-felipe': { lat: 19.8089, lng: -70.6947 },
    'teleferico-puerto-plata': { lat: 19.7833, lng: -70.6833 },
    'calle-sombrillas': { lat: 19.7942, lng: -70.6920 },
    'calle-rosada': { lat: 19.7940, lng: -70.6915 },
    'letrero-puerto-plata': { lat: 19.7975, lng: -70.6885 },
    'museo-ambar': { lat: 19.7944, lng: -70.6916 },
    'ronfactory': { lat: 19.7833, lng: -70.6944 },
    'larimarr': { lat: 19.7943, lng: -70.6917 },
    'hermanasmirabal': { lat: 19.7950, lng: -70.6925 },
    'neptuno': { lat: 19.7972, lng: -70.6889 },
    'catedralsanfelipe': { lat: 19.7945, lng: -70.6918 },
    'cristoredentor': { lat: 19.7667, lng: -70.6833 },
    'calledelacometas': { lat: 19.7938, lng: -70.6912 },
    'parque-central': { lat: 19.7939, lng: -70.6914 },
    'museo-gregorio-luperon': { lat: 19.7941, lng: -70.6913 }
  };
  return coordinates[locationId] || { lat: 19.7939, lng: -70.6914 }; // Default to Parque Central
};

// --- Card Component ---
const PopularLocationCard: React.FC<{ location: any, onClick: () => void, onStartTour: () => void }> = ({ location, onClick }) => {
  const navigate = useNavigate();
  
  // Navegar al mapa con la ubicación seleccionada
  const handleNavigateToMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/mapa', { 
      state: { 
        selectedLocation: {
          id: location.id,
          name: location.name,
          coordinates: getLocationCoordinates(location.id)
        },
        centerOnLocation: true 
      } 
    });
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-t-2xl">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            style={{ display: 'block', maxHeight: '100%', maxWidth: '100%' }}
            onError={e => { e.currentTarget.src = '/places/placeholder.jpg'; }}
          />
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{location.rating}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{location.name}</h3>
        <p className="text-gray-600 mb-4">{location.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{location.duration || '0 min'}</span>
          </div>
        </div>
        
        {/* Botones de navegación al mapa */}
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-1"
            onClick={handleNavigateToMap}
          >
            <MapPin className="h-4 w-4" />
            Ver en Mapa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
const AudioPremiumPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Usar hook de Supabase para cargar lugares
  const { places, loading: placesLoading, error: placesError } = usePlaces();

  // --- Popular Locations Data (dinámico desde Supabase) ---
  const popularLocations = React.useMemo(() => {
    if (placesLoading || placesError) {
      // Fallback a datos estáticos si Supabase no está disponible
      return [
    {
      id: 'fortaleza-san-felipe',
      name: t('locations.fortaleza-san-felipe.name'),
      image: '/places/fortalezasanfelipe.jpg',
      audio: '/audio/audios/fortalezasanfelipe.mp3',
      description: t('locations.fortaleza-san-felipe.description'),
      rating: 4.8,
      duration: '15 min',
      history: t('locations.fortaleza-san-felipe.history')
    },
    {
      id: 'teleferico-puerto-plata',
      name: t('locations.teleferico-puerto-plata.name'),
      image: '/places/teleferico.jpg',
      audio: '/audio/audios/telefericoESP.mp3',
      description: t('locations.teleferico-puerto-plata.description'),
      rating: 4.9,
      duration: '20 min',
      history: t('locations.teleferico-puerto-plata.history')
    },
    {
      id: 'calle-sombrillas',
      name: t('locations.calle-sombrillas.name'),
      image: '/places/calledelasombrillas.jpg',
      audio: '/audio/audios/callesombrillas.mp3',
      description: t('locations.calle-sombrillas.description'),
      rating: 4.7,
      duration: '8 min',
      history: t('locations.calle-sombrillas.history')
    },
    {
      id: 'calle-rosada',
      name: t('locations.calle-rosada.name'),
      image: '/places/callerosada.jpg',
      audio: '/audio/audios/callerosada.mp3',
      description: t('locations.calle-rosada.description'),
      rating: 4.9,
      duration: '10 min',
      history: t('locations.calle-rosada.history')
    },
    {
      id: 'letrero-puerto-plata',
      name: t('locations.letrero-puerto-plata.name'),
      image: '/places/letreropuertoplata.jpg',
      audio: '/audio/audios/letreropuertoplata.mp3',
      description: t('locations.letrero-puerto-plata.description'),
      rating: 4.6,
      duration: '5 min',
      history: t('locations.letrero-puerto-plata.history')
    },
    {
      id: 'museo-ambar',
      name: t('locations.museo-ambar.name'),
      image: '/places/museodelambar.jpg',
      audio: '/audio/audios/museodelambar.mp3',
      description: t('locations.museo-ambar.description'),
      rating: 4.8,
      duration: '20 min',
      history: t('locations.museo-ambar.history')
    },
    {
      id: 'ronfactory',
      name: t('locations.ronfactory.name'),
      image: '/places/macorix-house-of-rum.jpg',
      audio: '/audio/audios/ronfactory.mp3',
      description: t('locations.ronfactory.description'),
      rating: 4.7,
      duration: '15 min',
      history: t('locations.ronfactory.history')
    },
    {
      id: 'larimarr',
      name: t('locations.larimarr.name'),
      image: '/places/larimarr.jpg',
      audio: '/audio/audios/larimarr.mp3',
      description: t('locations.larimarr.description'),
      rating: 4.6,
      duration: '12 min',
      history: t('locations.larimarr.history')
    },
    {
      id: 'hermanasmirabal',
      name: t('locations.hermanasmirabal.name'),
      image: '/places/hermanasmirabal.jpg',
      audio: '/audio/audios/hermanasmirabal.mp3',
      description: t('locations.hermanasmirabal.description'),
      rating: 4.8,
      duration: '10 min',
      history: t('locations.hermanasmirabal.history')
    },
    {
      id: 'neptuno',
      name: t('locations.neptuno.name'),
      image: '/places/neptuno.jpg',
      audio: '/audio/audios/neptuno.mp3',
      description: t('locations.neptuno.description'),
      rating: 4.6,
      duration: '7 min',
      history: t('locations.neptuno.history')
    },
    {
      id: 'catedralsanfelipe',
      name: t('locations.catedralsanfelipe.name'),
      image: '/places/catedralsanfelipe.jpg',
      audio: '/audio/audios/catedralsanfelipe.mp3',
      description: t('locations.catedralsanfelipe.description'),
      rating: 4.7,
      duration: '10 min',
      history: t('locations.catedralsanfelipe.history')
    },
    {
      id: 'cristoredentor',
      name: t('locations.cristoredentor.name'),
      image: '/places/cristoredentor.jpg',
      audio: '/audio/audios/cristoredentor.mp3',
      description: t('locations.cristoredentor.description'),
      rating: 4.9,
      duration: '12 min',
      history: t('locations.cristoredentor.history')
    },
    {
      id: 'calledelacometas',
      name: t('locations.calledelacometas.name'),
      image: '/places/calledelacometas.jpg',
      audio: '/audio/audios/calledelacometas.mp3',
      description: t('locations.calledelacometas.description'),
      rating: 4.5,
      duration: '8 min',
      history: t('locations.calledelacometas.history')
    },
    {
      id: 'parque-central',
      name: t('locations.parque-central.name'),
      image: '/places/ParqueCentraldePuertoPlata.jpg',
      audio: '/audio/audios/parquecentralESP.mp3',
      description: t('locations.parque-central.description'),
      rating: 4.7,
      duration: '5 min',
      history: t('locations.parque-central.history')
    },
    {
      id: 'museo-gregorio-luperon',
      name: t('locations.museo-gregorio-luperon.name'),
      image: '/places/MuseoGregorioLuperon.jpg',
      audio: '/audio/audios/museogregorioluperonESP.mp3',
      description: t('locations.museo-gregorio-luperon.description'),
      rating: 4.8,
      duration: '8 min',
      history: t('locations.museo-gregorio-luperon.history')
    },
    {
      id: 'ocean-world',
      name: t('locations.ocean-world.name'),
      image: '/places/oceanworld.jpg',
      audio: '/audio/audios/oceaworldESP.mp3',
      description: t('locations.ocean-world.description'),
      rating: 4.6,
      duration: '12 min',
      history: t('locations.ocean-world.history')
    }
  ];
    } else {
      // Usar datos de Supabase
      return places.map(place => ({
        id: place.id,
        name: place.title,
        image: place.image,
        audio: place.audio,
        description: place.description,
        rating: place.rating || 4.5,
        duration: place.duration || '10 min',
        history: place.history || ''
      }));
    }
  }, [places, placesLoading, placesError, t]);

  // Compute subscription status
  const isLogged = !!user;
  const isSubscribed = !!user && !!user.isSubscribed;

  // Open modal if ?id=... in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      const loc = popularLocations.find(l => l.id === id);
      if (loc) setSelectedLocation(loc);
    }
  }, [location.search, popularLocations]);

  // Handle card click (open modal and update URL)
  const handleCardClick = (loc: any) => {
    setSelectedLocation(loc);
    navigate(`?id=${loc.id}`, { replace: false });
  };

  // Handle modal close (remove id from URL)
  const handleCloseModal = () => {
    setSelectedLocation(null);
    navigate('/biblioteca-audios', { replace: true });
  };

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLogged) {
      navigate('/subscribe?from=/biblioteca-audios' + location.search, { replace: true });
    }
  }, [isLogged, navigate, location.search]);

  return (
    <div className="min-h-screen bg-white">
      {/* Subscription Timer/Message */}
      <div className="w-full bg-gradient-to-r from-blue-100 to-teal-100 py-4 text-center text-lg font-semibold text-blue-900 shadow">
        {isSubscribed ? (
          <>{t('audio.premium_active')}</>
        ) : (
          <>{t('audio.limited_access')}</>
        )}
      </div>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('biblioteca_audios_title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('biblioteca_audios_description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularLocations.map((loc) => (
              <PopularLocationCard
                key={loc.id}
                location={loc}
                onClick={() => handleCardClick(loc)}
                onStartTour={() => navigate('/mapa', { 
                  state: { 
                    selectedLocation: {
                      id: loc.id,
                      name: loc.name,
                      coordinates: getLocationCoordinates(loc.id)
                    },
                    centerOnLocation: true 
                  } 
                })}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Modal for location details and audio */}
      <LocationHistoryModal
        isOpen={!!selectedLocation}
        onClose={handleCloseModal}
        location={selectedLocation}
      />
    </div>
  );
};

export default AudioPremiumPage; 
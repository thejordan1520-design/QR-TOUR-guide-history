
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Headphones, Star, QrCode, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import GoogleLocationMap from '../components/ui/GoogleLocationMap';
import QRInstructionModal from '../components/ui/QRInstructionModal';
import LocationHistoryModal from '../components/ui/LocationHistoryModal';
import AudioLibraryModal from '../components/ui/AudioLibraryModal';
import FlightSearchModal from '../components/ui/FlightSearchModal';
import { useAuth } from '../contexts/AuthContext';
import GoogleMapTour from '../components/ui/GoogleMapTour';
import QRScanner from '../components/QRScanner';
import { motion } from 'framer-motion';
import { useSafeAudioDestinations } from '../hooks/useSafeAudioDestinations';
import { supabase } from '../lib/supabase';

// Componente para mostrar la duración real del audio
const PopularLocationCard = ({ location, onClick, onStartTour }: { location: any, onClick: () => void, onStartTour: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // El botón de play solo detiene la propagación y abre el modal SIEMPRE
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(); // SIEMPRE abre el modal
  };

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

  // Navegar al tour con la ubicación seleccionada
  const handleNavigateToTour = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Llamar a la función onStartTour que se pasa como prop
    onStartTour();
  };

  // Función para obtener el nombre traducido
  const getTranslatedName = (locationId: string) => {
    const translationMap: { [key: string]: string } = {
      'calle-de-las-sombrillas': 'places_of_interest.calle_sombrillas.title',
      'calle-rosada': 'places_of_interest.calle_rosada.title',
      'museo-del-ambar': 'places_of_interest.museo_ambar.title',
      'letrero-puerto-plata': 'places_of_interest.letrero_puerto_plata.title',
      'teleferico': 'places_of_interest.teleferico.title',
      'fortaleza-san-felipe': 'places_of_interest.fortaleza_san_felipe.title'
    };
    
    const translationKey = translationMap[locationId];
    return translationKey ? t(translationKey) : location.name;
  };

  // Función para obtener la descripción traducida
  const getTranslatedDescription = (locationId: string) => {
    const translationMap: { [key: string]: string } = {
      'calle-de-las-sombrillas': 'places_of_interest.calle_sombrillas.description',
      'calle-rosada': 'places_of_interest.calle_rosada.description',
      'museo-del-ambar': 'places_of_interest.museo_ambar.description',
      'letrero-puerto-plata': 'places_of_interest.letrero_puerto_plata.description',
      'teleferico': 'places_of_interest.teleferico.description',
      'fortaleza-san-felipe': 'places_of_interest.fortaleza_san_felipe.description'
    };
    
    const translationKey = translationMap[locationId];
    return translationKey ? t(translationKey) : location.description;
  };

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

  return (
    <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer" onClick={onClick}>
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{getTranslatedName(location.id)}</h3>
        <p className="text-gray-600 mb-4">{getTranslatedDescription(location.id)}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{location.duration || '1-2 min'}</span>
            <button
              className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold hover:bg-orange-200 transition"
              onClick={handlePlay}
            >
              {t('home.audio_button')}
            </button>
          </div>
          <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            {t('home.see_more')} →
          </span>
        </div>
        
        {/* Botones: Escuchar audio + Ver en mapa */}
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 bg-green-400 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition flex items-center justify-center gap-1"
            onClick={handlePlay}
          >
            {/* ícono simple play con css */}
            <span className="inline-block w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            {t('home.listen_audio')}
          </button>
          <button
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-1"
            onClick={handleNavigateToMap}
          >
            <MapPin className="h-4 w-4" />
            {t('home.view_on_map')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [showMap, setShowMap] = React.useState(false);
  const [showQRInstructions, setShowQRInstructions] = React.useState(false);
  const [showAudioLibrary, setShowAudioLibrary] = React.useState(false);
  const [showAudioDenied, setShowAudioDenied] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [showServices, setShowServices] = React.useState(false);
  
  // Hook seguro para evitar que el frontend se rompa
  const { destinations, loading: destinationsLoading, error: destinationsError } = useSafeAudioDestinations();
  
  // Estados para la Alarma de Viaje
  const [showTravelAlarm, setShowTravelAlarm] = React.useState(false);
  const [alarmTime, setAlarmTime] = React.useState('');
  const [alarmDistance, setAlarmDistance] = React.useState(5);
  const [alarmReminders, setAlarmReminders] = React.useState({
    oneHour: false,
    thirtyMinutes: false,
    tenMinutes: false
  });
  const [isAlarmActive, setIsAlarmActive] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState('');
  const [alarmInterval, setAlarmInterval] = React.useState<NodeJS.Timeout | null>(null);
  
  // Estado para el modal de búsqueda de vuelos/cruceros
  const [showFlightSearch, setShowFlightSearch] = React.useState(false);
  
  const navigate = useNavigate();
  const [showGoogleMapTour, setShowGoogleMapTour] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { user } = useAuth();
  const isAuthenticated = !!user;
  // Por ahora, todos los usuarios autenticados tienen acceso
  const hasActivePlan = !!user;

  // Calcula el tiempo restante de acceso premium (simplificado)
  let timeLeft = '';
  let endTimeValue = '';
  if (hasActivePlan) {
    // En el futuro se puede implementar lógica de suscripción
    endTimeValue = 'indefinido';
  }
  if (hasActivePlan && endTimeValue) {
    const now = new Date();
    const end = new Date(endTimeValue);
    let diff = Math.max(0, end.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    timeLeft = `${days}d ${hours}h ${minutes}m`;
  }

  const features = [
    {
      icon: QrCode,
      title: t('home.easy_access'),
      description: t('home.easy_access_desc'),
      clickable: true
    },
    {
      icon: Headphones,
      title: t('home.premium_audio'),
      description: t('home.premium_audio_desc'),
      clickable: false
    },
    {
      icon: MapPin,
      title: t('home.map_locations'),
      description: t('home.map_locations_desc'),
      clickable: false
    },
    {
      icon: Clock,
      title: t('home.access_24h'),
      description: t('home.access_24h_desc'),
      clickable: false
    }
  ];

  // Cargar testimonios destacados desde Supabase
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false);
  const currentLanguage = i18n.language || 'es';
  
  useEffect(() => {
    // Prevenir loop infinito
    if (isLoadingTestimonials) return;
    
    const fetchTestimonials = async () => {
      setIsLoadingTestimonials(true);
      try {
        // Obtener testimonios destacados
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('id, rating, comment, comment_en, comment_fr, created_at, user_id, featured_order')
          .eq('is_featured', true)
          .eq('is_public', true)
          .order('featured_order', { ascending: true })
          .limit(3);

        // Siempre mostrar testimonios por defecto (eliminando los existentes de la DB)
        setTestimonials([
          {
            name: 'María González',
            location: currentLanguage === 'es' ? 'España' : currentLanguage === 'en' ? 'Spain' : 'Espagne',
            rating: 5,
            comment: currentLanguage === 'es' ? 'Increíble experiencia, la historia cobró vida con estos audios' :
                     currentLanguage === 'en' ? 'Incredible experience, history came alive with these audios' :
                     'Expérience incroyable, l\'histoire a pris vie avec ces audios'
          },
          {
            name: 'John Smith',
            location: currentLanguage === 'es' ? 'Estados Unidos' : currentLanguage === 'en' ? 'United States' : 'États-Unis',
            rating: 5,
            comment: currentLanguage === 'es' ? 'Perfecto para turistas, fácil de usar y muy informativo' :
                     currentLanguage === 'en' ? 'Perfect for tourists, easy to use and very informative' :
                     'Parfait pour les touristes, facile à utiliser et très informatif'
          },
          {
            name: 'Pierre Dubois',
            location: currentLanguage === 'es' ? 'Francia' : currentLanguage === 'en' ? 'France' : 'France',
            rating: 5,
            comment: currentLanguage === 'es' ? 'Una experiencia inmersiva fantástica, lo recomiendo ampliamente' :
                     currentLanguage === 'en' ? 'A fantastic immersive experience, I highly recommend it' :
                     'Une expérience immersive fantastique, je recommande vivement'
          }
        ]);
        return;
      } catch (err) {
        console.error('❌ Error cargando testimonios:', err);
        // En caso de error, también mostrar testimonios por defecto
        setTestimonials([
          {
            name: 'María González',
            location: currentLanguage === 'es' ? 'España' : currentLanguage === 'en' ? 'Spain' : 'Espagne',
            rating: 5,
            comment: currentLanguage === 'es' ? 'Increíble experiencia, la historia cobró vida con estos audios' :
                     currentLanguage === 'en' ? 'Incredible experience, history came alive with these audios' :
                     'Expérience incroyable, l\'histoire a pris vie avec ces audios'
          },
          {
            name: 'John Smith',
            location: currentLanguage === 'es' ? 'Estados Unidos' : currentLanguage === 'en' ? 'United States' : 'États-Unis',
            rating: 5,
            comment: currentLanguage === 'es' ? 'Perfecto para turistas, fácil de usar y muy informativo' :
                     currentLanguage === 'en' ? 'Perfect for tourists, easy to use and very informative' :
                     'Parfait pour les touristes, facile à utiliser et très informatif'
          },
          {
            name: 'Pierre Dubois',
            location: currentLanguage === 'es' ? 'Francia' : currentLanguage === 'en' ? 'France' : 'France',
            rating: 5,
            comment: currentLanguage === 'es' ? 'Una experiencia inmersiva fantástica, lo recomiendo ampliamente' :
                     currentLanguage === 'en' ? 'A fantastic immersive experience, I highly recommend it' :
                     'Une expérience immersive fantastique, je recommande vivement'
          }
        ]);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, [currentLanguage]);

  // Datos estáticos como fallback
  const fallbackLocations = React.useMemo(() => [
    {
      id: 'fortaleza-san-felipe',
      name: t('locations.fortaleza-san-felipe.name'),
      image: '/places/fortalezasanfelipe.jpg',
      audio: '/audios/fortalezaING.mp3',
      description: t('locations.fortaleza-san-felipe.description'),
      rating: 4.8,
      duration: '1-2 min',
      history: t('locations.fortaleza-san-felipe.history')
    },
    {
      id: 'teleferico',
      name: t('locations.teleferico.name'),
      image: '/places/teleferico.jpg',
      audio: '/audios/telefericoING.mp3',
      description: t('locations.teleferico.description'),
      rating: 4.9,
      duration: '1-2 min',
      history: t('locations.teleferico.history')
    },
    {
      id: 'calle-de-las-sombrillas',
      name: t('locations.calle-de-las-sombrillas.name'),
      image: '/places/calledelasombrillas.jpg',
      audio: '/audios/callesombrillaING.mp3',
      description: t('locations.calle-de-las-sombrillas.description'),
      rating: 4.7,
      duration: '1-2 min',
      history: t('locations.calle-de-las-sombrillas.history')
    },
    {
      id: 'calle-rosada',
      name: t('locations.calle-rosada.name'),
      image: '/places/callerosada.jpg',
      audio: '/audios/callerosadaING.mp3',
      description: t('locations.calle-rosada.description'),
      rating: 4.9,
      duration: '1-2 min',
      history: t('locations.calle-rosada.history')
    },
    {
      id: 'letrero-puerto-plata',
      name: t('locations.letrero-puerto-plata.name'),
      image: '/places/letreropuertoplata.jpg',
      audio: '/audios/letreroING.mp3',
      description: t('locations.letrero-puerto-plata.description'),
      rating: 4.6,
      duration: '1-2 min',
      history: t('locations.letrero-puerto-plata.history')
    },
    {
      id: 'museo-del-ambar',
      name: t('locations.museo-del-ambar.name'),
      image: '/places/museodelambar.jpg',
      audio: '/audios/museoambarING.mp3',
      description: t('locations.museo-del-ambar.description'),
      rating: 4.8,
      duration: '1-2 min',
      history: t('locations.museo-del-ambar.history')
    }
  ], [t]);

  // Convertir destinos al formato esperado por la Home, tomando imagen/audio del mismo origen que la Biblioteca
  const popularLocations = React.useMemo(() => {
    if (destinationsLoading || destinationsError || !destinations.length) {
      return fallbackLocations;
    }
    const order = [
      'sombrilla-001', // Calle de la Sombrilla
      'rosada-002', // Calle Rosada  
      'ambar-003', // Museo del Ámbar
      'letrero-004', // Letrero Puerto Plata
      'teleferico-005', // Teleférico
      'fortaleza-006', // Fortaleza San Felipe
    ];
    const aliases: Record<string, string> = {
      'calle-de-las-sombrillas': 'sombrilla-001',
      'calle-rosada': 'rosada-002',
      'museo-del-ambar': 'ambar-003',
      'letrero-puerto-plata': 'letrero-004',
      'teleferico': 'teleferico-005',
      'fortaleza-san-felipe': 'fortaleza-006',
    };
    const asCard = (d: any) => ({
      id: d.id,
      name: d.name || d.title,
      image: d.image_url || d.image || '/places/fortalezasanfelipe.jpg',
      audio: (d.audios && (d.audios.es || d.audios.en || d.audios.fr)) || '',
      audios: d.audios || undefined,
      description: d.description || '',
      rating: d.rating || 4.5,
      duration: '1-2 min',
      history: d.description || ''
    });
    const byKey = (d: any) => aliases[d.id] || d.id;
    const allowed = new Set(order);
    const filtered = destinations.filter((d: any) => allowed.has(byKey(d)));
    filtered.sort((a: any, b: any) => order.indexOf(byKey(a)) - order.indexOf(byKey(b)));
    return filtered.map(asCard);
  }, [destinations, destinationsLoading, destinationsError, fallbackLocations]);

  // Handler para el botón Comenzar Tour
  const handleStartTour = () => {
    setShowGoogleMapTour(true);
  };

  // Funciones para la Alarma de Viaje
  const handleSearchFlight = () => {
    setShowFlightSearch(true);
  };

  const handleFlightSearchConfirm = (time: string) => {
    setAlarmTime(time);
  };

  const handleActivateAlarm = () => {
    if (!alarmTime) return;
    
    setIsAlarmActive(true);
    setShowTravelAlarm(true);
    
    // Calcular tiempo restante
    const updateTimeRemaining = () => {
      const now = new Date();
      const [hours, minutes] = alarmTime.split(':');
      const alarmDate = new Date();
      alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1); // Si ya pasó, programar para mañana
      }
      
      const diff = alarmDate.getTime() - now.getTime();
      const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Actualizar cada minuto
    setAlarmInterval(interval);
  };

  const handleCancelAlarm = () => {
    setIsAlarmActive(false);
    setShowTravelAlarm(false);
    setTimeRemaining('');
    if (alarmInterval) {
      clearInterval(alarmInterval);
      setAlarmInterval(null);
    }
  };

  const handleEditAlarm = () => {
    setIsAlarmActive(false);
    setShowTravelAlarm(false);
    setTimeRemaining('');
    if (alarmInterval) {
      clearInterval(alarmInterval);
      setAlarmInterval(null);
    }
  };

  // Limpiar intervalo al desmontar el componente
  React.useEffect(() => {
    return () => {
      if (alarmInterval) {
        clearInterval(alarmInterval);
      }
    };
  }, [alarmInterval]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/15"></div>
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-50 sm:opacity-55 md:opacity-50 lg:opacity-55 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/places/fondonumero2.png')`,
            filter: 'blur(0.2px) brightness(1.05)',
            transform: 'scale(1.05)',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl text-center">
              {t('home.hero_title')} <br />
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-yellow-300 mt-2">{t('home.hero_subtitle')}</span>
            </h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            {t('home.hero_desc')}
          </p>
          {/* Botón Comenzar Tour centrado */}
          <div className="flex justify-center w-full">
            <button
              onClick={handleStartTour}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {t('home.start_tour')}
              <ArrowRight className="ml-2 h-6 w-6" />
            </button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {t('home.main_features')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.main_features_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {/* Acceso Fácil */}
                  <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="text-center group cursor-pointer bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-orange-200 hover:border-orange-300 min-h-80 w-full max-w-sm flex flex-col justify-between" onClick={() => setShowQRInstructions(true)}>
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-4 mx-auto mb-4 shadow-lg w-fit">
                <QrCode className="h-7 w-7 text-white" />
                      </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.easy_access')}</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{t('home.easy_access_desc')}</p>
              <span
                className="text-white hover:text-orange-100 text-xs font-semibold cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={e => { e.stopPropagation(); setShowQRInstructions(true); }}
              >
                {t('home.see_instructions')}
                        </span>
                      </motion.div>

                      {/* Audios Premium */}
          <Link
            to="/biblioteca-react"
            className="block group cursor-pointer bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-200 hover:border-purple-300 text-inherit no-underline text-center min-h-80 w-full max-w-sm flex flex-col justify-between"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
              <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 rounded-xl p-4 mx-auto mb-4 shadow-lg w-fit">
                <span
                  className="inline-block text-3xl"
                  role="img"
                  aria-label="audio"
                >
                  🎧
                </span>
                      </motion.div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{t('home.premium_audio')}</h3>
              <p className="text-gray-700 mb-3 text-sm">{t('home.premium_audio_desc')}</p>
              <span
                className="text-white text-sm font-bold cursor-pointer bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 px-3 py-1 rounded-full border border-white/70 shadow-lg hover:brightness-110 hover:shadow-xl transition-all duration-200 inline-block"
              >
                {t('home.see_audio_library')}
                        </span>
            </Link>

            {/* Mapa de Ubicaciones */}
            <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="text-center group cursor-pointer bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-emerald-200 hover:border-emerald-300 min-h-80 w-full max-w-sm flex flex-col justify-between" onClick={() => setShowMap(true)}>
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-4 mx-auto mb-4 shadow-lg w-fit">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.map_locations')}</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{t('home.map_locations_desc')}</p>
              <span
                className="text-white hover:text-emerald-100 text-xs font-semibold cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={e => { e.stopPropagation(); setShowMap(true); }}
              >
                {t('home.see_qr_map')}
              </span>
            </motion.div>
            
            {/* Services and Restaurants */}
            <Link
              to="/services"
              className="block group cursor-pointer bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-sky-200 hover:border-sky-300 text-inherit no-underline text-center min-h-80 w-full max-w-sm flex flex-col justify-between"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 rounded-xl p-4 mx-auto mb-4 shadow-lg w-fit">
                <span className="inline-block text-3xl" role="img" aria-label="services">🍽️</span>
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.services_restaurants')}</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{t('home.services_restaurants_desc')}</p>
              <span className="text-white hover:text-sky-100 text-xs font-semibold cursor-pointer bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 rounded-full hover:from-sky-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg">
                {t('home.see_services')}
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.popular_locations_title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.popular_locations_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularLocations.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Cargando destinos populares...</p>
              </div>
            ) : (
              popularLocations.map((location) => (
                <PopularLocationCard
                  key={location.id}
                  location={location}
                  onClick={() => setSelectedLocation(location)}
                  onStartTour={() => setShowGoogleMapTour(true)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Eliminar la sección de Biblioteca de Audios de la HomePage */}

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.testimonials_title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.testimonials_desc')}
            </p>
          </div>

          {/* Estadísticas públicas */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
            <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-2xl px-8 py-6 text-center shadow-lg">
              <div className="text-3xl font-bold mb-2">+5,247</div>
              <div className="text-lg">{t('home.audio_available')}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-8 py-6 text-center shadow-lg">
              <div className="text-3xl font-bold mb-2">356</div>
              <div className="text-lg">{t('home.countries_covered')}</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              // Truncar a 120 caracteres para mostrar ~2 líneas
              const isLongComment = testimonial.comment.length > 120;
              const truncatedComment = isLongComment 
                ? testimonial.comment.substring(0, 120) + '...' 
                : testimonial.comment;
              
              return (
                <motion.div 
                  key={index} 
                  whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} 
                  whileTap={{ scale: 0.98 }} 
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => isLongComment && setSelectedTestimonial(testimonial)}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  {/* line-clamp-2 = solo 2 líneas */}
                  <p className="text-gray-700 mb-2 italic line-clamp-2">
                    "{truncatedComment}"
                  </p>
                  {isLongComment && (
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTestimonial(testimonial);
                      }}
                    >
                      {t('home.read_more') || 'Ver más'}
                    </button>
                  )}
                  <div className="flex items-center space-x-3 mt-4">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-full p-2">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-500 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('home.join_community')}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            {t('home.discover_more_content')}
          </p>
          <Link
            to="/subscribe"
        // Redirigir a login si el usuario intenta acceder a /profile sin estar autenticado
        // (esto se puede mejorar con un ProtectedRoute, aquí es directo)
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-full text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            {t('home.subscribe_now')}
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </div>
      </section>
      

      {/* Audio Library Modal solo para suscriptores */}
      <AudioLibraryModal
        isOpen={showAudioLibrary}
        onClose={() => setShowAudioLibrary(false)}
        locations={React.useMemo(() => [
          ...popularLocations,
          {
            id: 'ron-brugal',
            name: t('locations.ronfactory.name'),
            image: '/places/macorix-house-of-rum.jpg',
            audio: '/audios/ronfactory.mp3'
          },
          {
            id: 'museo-larimar',
            name: 'Museo del Larimar',
            image: '/places/larimarr.jpg',
            audio: '/audios/larimarr.mp3'
          },
          {
            id: 'calle-cometas',
            name: 'Calle de las Cometas Voladoras',
            image: '/places/calledelacometas.jpg',
            audio: '/audios/calledelacometas.mp3'
          },
          {
            id: 'monumento-mirabal',
            name: 'Monumento Hermanas Mirabal',
            image: '/places/hermanasmirabal.jpg',
            audio: '/audios/hermanasmirabal.mp3'
          },
          {
            id: 'neptuno-malecon',
            name: 'Estatua Neptuno en el Malecón',
            image: '/places/neptuno.jpg',
            audio: '/audios/neptuno.mp3'
          },
          {
            id: 'catedral',
            name: 'Catedral San Felipe',
            image: '/places/catedralsanfelipe.jpg',
            audio: '/audios/catedral.mp3'
          },
          {
            id: 'cristo-redentor',
            name: 'Cristo Redentor',
            image: '/places/cristoredentor.jpg',
            audio: '/audios/cristoredentor.mp3'
          }
        ], [popularLocations])}
      />

      {/* Modal de acceso denegado para no suscriptores */}
      {showAudioDenied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div whileHover={{ scale: 1.06, y: -8, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative text-center">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAudioDenied(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Acceso Denegado</h2>
            <p className="mb-6 text-gray-700">{t('home.audio_denied_message')}</p>
            <Link
              to="/subscribe"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowAudioDenied(false)}
            >
              {t('home.subscribe_now')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      )}

      {/* Location Map Modal */}
      <GoogleLocationMap isOpen={showMap} onClose={() => setShowMap(false)} />

      {/* QR Instructions Modal */}
      <QRInstructionModal isOpen={showQRInstructions} onClose={() => setShowQRInstructions(false)} />

      {/* Location History Modal */}
      <LocationHistoryModal
        key={`${selectedLocation?.id}-${i18n.language}-${Date.now()}`}
        isOpen={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        location={selectedLocation}
      />

      {/* Flight Search Modal */}
      <FlightSearchModal
        isOpen={showFlightSearch}
        onClose={() => setShowFlightSearch(false)}
        onConfirm={handleFlightSearchConfirm}
      />

      {/* Google Map Tour */}
      {showGoogleMapTour && <GoogleMapTour onClose={() => setShowGoogleMapTour(false)} />}
      <QRScanner open={showQRScanner} onClose={() => setShowQRScanner(false)} />
      {/* Modal de Testimonio Completo */}
      {selectedTestimonial && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTestimonial(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {t('home.testimonial_title') || 'Testimonio'}
              </h3>
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center mb-4">
              {[...Array(selectedTestimonial.rating)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
              ))}
            </div>

            <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
              "{selectedTestimonial.fullComment}"
            </p>

            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-full p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{selectedTestimonial.name}</p>
                <p className="text-gray-500">{selectedTestimonial.location}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
    </div>
  );
};

export default HomePage;
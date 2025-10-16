import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MapPin, Clock, Camera, ChevronDown, Share2, Star, Navigation } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext'; // Removed - using react-i18next
import AudioPlayer from '../components/ui/AudioPlayer';
import LanguageSelector from '../components/ui/LanguageSelector';
// import { useTranslation } from 'react-i18next'; // No usado actualmente
import { useLocation } from '../hooks/useLocation';

// Mock data - in real app this would come from API
const locationData = {
  'fortaleza-san-felipe': {
    id: 'fortaleza-san-felipe',
    name: 'Fortaleza San Felipe',
    slug: 'fortaleza-san-felipe',
    image: 'https://images.pexels.com/photos/1574935/pexels-photo-1574935.jpeg?auto=compress&cs=tinysrgb&w=1200',
    descriptionShort: 'Histórica fortaleza del siglo XVI que protegía el puerto principal de la ciudad.',
    descriptionFull: `La Fortaleza San Felipe es una impresionante construcción militar del siglo XVI que se erige majestuosamente sobre la bahía. Construida por los españoles para proteger el puerto principal de los ataques piratas y de las flotas enemigas, esta fortaleza representa uno de los mejores ejemplos de arquitectura militar colonial en América.

    Sus gruesos muros de piedra coral, sus cañones estratégicamente ubicados y sus túneles subterráneos cuentan la historia de batallas épicas y de la vida cotidiana de los soldados que la defendieron durante más de tres siglos. Desde sus almenas se puede contemplar una vista panorámica espectacular del océano y la ciudad antigua.`,
    gpsLat: 10.4236,
    gpsLng: -75.5378,
    rating: 4.8,
    duration: 15,
    audios: {
      es: '/audio/fortaleza-san-felipe-es.mp3',
      en: '/audio/fortaleza-san-felipe-en.mp3',
      fr: '/audio/fortaleza-san-felipe-fr.mp3',
      pt: '/audio/fortaleza-san-felipe-pt.mp3'
    },
    gallery: [
      'https://images.pexels.com/photos/1574935/pexels-photo-1574935.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    curiosities: [
      'Los cañones originales siguen apuntando hacia el mar después de 400 años',
      'Existe un túnel secreto que conecta con la ciudad antigua',
      'Durante la época pirata, nunca fue conquistada por completo',
      'Se construyó utilizando coral del mismo arrecife que protegía'
    ],
    address: 'Av. Blas de Lezo, Centro Histórico',
    directions: 'Accesible en taxi, bus turístico o caminando desde la Plaza de Armas (15 minutos). Entrada principal por la Av. Blas de Lezo.'
  }
};

const LocationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, currentLanguage } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Hook para obtener datos del lugar desde Supabase
  const { location: supabaseLocation, loading: locationLoading, error: locationError } = useLocation(slug || '');

  // Usar datos de Supabase si están disponibles, sino usar datos estáticos como fallback
  const location = React.useMemo(() => {
    if (locationLoading || locationError || !supabaseLocation) {
      console.log('🔄 Using fallback location data due to:', { locationLoading, locationError, supabaseLocation: !!supabaseLocation });
      return slug ? locationData[slug as keyof typeof locationData] : null;
    }

    console.log('✅ Using Supabase location data:', supabaseLocation);
    return supabaseLocation;
  }, [supabaseLocation, locationLoading, locationError, slug]);

  useEffect(() => {
    if (!location) return;
    
    // Update page title
    document.title = `${location.name} - QR Tour`;
  }, [location]);

  // Mostrar loading mientras se cargan los datos
  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del lugar...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return <Navigate to="/404" replace />;
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: location.name,
          text: location.descriptionShort,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert(t('location.link_copied'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Header Controls */}
        <div className="absolute top-6 right-6 flex items-center space-x-3">
          <LanguageSelector />
          <button
            onClick={handleShare}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
          >
            <Share2 className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Title and Rating */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{location.name}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{location.descriptionShort}</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-yellow-700">{location.rating}</span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-blue-700">{location.duration} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Audio Player */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('location.audioGuide')}</h2>
              <AudioPlayer
                src={location.audios[currentLanguage as keyof typeof location.audios]}
                title={location.name}
                subtitle={`${t('location.narration')} ${currentLanguage.toUpperCase()} • ${location.duration} ${t('location.minutes')}`}
                autoPlay={true}
                audioId={`${location.id}-${currentLanguage}`}
              />
            </div>

            {/* Details Toggle */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
              >
                <span className="text-lg font-semibold">{t('location.viewMore')}</span>
                <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
              </button>

              {showDetails && (
                <div className="p-6 space-y-8 animate-in slide-in-from-top duration-300">
                  {/* History */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      {t('location.history')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{location.descriptionFull}</p>
                  </div>

                  {/* Curiosities */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <Star className="h-5 w-5 text-orange-600" />
                      </div>
                      {t('location.curiosities')}
                    </h3>
                    <ul className="space-y-3">
                      {location.curiosities.map((curiosity, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="bg-orange-500 rounded-full p-1 mt-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-gray-700">{curiosity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Directions */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <Navigation className="h-5 w-5 text-green-600" />
                      </div>
                      {t('location.directions')}
                    </h3>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <p className="text-green-800 font-medium mb-2">📍 {location.address}</p>
                      <p className="text-green-700">{location.directions}</p>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Camera className="h-5 w-5 text-purple-600" />
                      </div>
                      {t('location.gallery')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {location.gallery.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className="aspect-square rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200"
                        >
                          <img
                            src={image}
                            alt={`${location.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('location.locationInfo')}</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{location.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{t('location.duration_label')}: {location.duration} {t('location.minutes')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{t('location.rating_label')}: {location.rating}/5</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('location.quickActions')}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${location.gpsLat},${location.gpsLng}`, '_blank')}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                >
                  <Navigation className="h-5 w-5" />
                  <span>{t('location.viewOnMaps')}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors duration-200"
                >
                  <Share2 className="h-5 w-5" />
                  <span>{t('location.share')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(0)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 text-4xl"
          >
            ×
          </button>
          <img
            src={location.gallery[selectedImage]}
            alt={`${location.name} ${selectedImage + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default LocationPage;
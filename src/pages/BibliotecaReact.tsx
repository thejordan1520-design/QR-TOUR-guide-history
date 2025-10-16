import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAudioDestinations } from '../hooks/useSafeAudioDestinations';
import { X, Star, Clock, Headphones, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import LimitedAudioPlayer from '../components/ui/LimitedAudioPlayer';

// Interface removida ya que no se usa más

interface Location {
  id: string;
  name: string;
  image: string;
  audio: string;
  description: string;
  history: string;
  rating: number;
  duration: string;
}

const BibliotecaReact: React.FC = () => {
  const { t, i18n, ready } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Usar solo el hook seguro para evitar que se rompa el frontend
  const { destinations, loading: destinationsLoading, error: destinationsError } = useSafeAudioDestinations();
  
  console.log('🔍 BibliotecaReact - Ready:', ready, 'Destinations:', destinations.length, 'Loading:', destinationsLoading, 'Error:', destinationsError);

  // Convertir destinos de Supabase a formato de biblioteca
  const popularLocations: Location[] = useMemo(() => {
    console.log('🔄 BibliotecaReact: Processing destinations:', destinations.length);
    return destinations.map(destination => {
      // Usar traducciones si están disponibles, sino usar datos originales
      const translatedName = ready ? t(`locations.${destination.id}.name`, destination.name) : destination.name;
      const translatedDescription = ready ? t(`locations.${destination.id}.description`, destination.description) : destination.description;
      const translatedHistory = ready ? t(`locations.${destination.id}.history`, destination.description) : destination.description;
      
      return {
        id: destination.id,
        name: translatedName,
        image: destination.image,
        audio: destination.audios.es,
        description: translatedDescription,
        history: translatedHistory,
        rating: 4.7, // Rating por defecto
        duration: ready ? t('audioLibrary.defaultDuration') : '10 min'
      };
    });
  }, [destinations, t, i18n.language, ready]);

  // Removido useEffect innecesario que causaba re-renders constantes

  const hasFullAccess = () => {
    // Por ahora, todos los usuarios autenticados tienen acceso completo
    // En el futuro se puede implementar lógica de suscripción
    return !!user;
  };

  const openModal = (location: Location) => {
    setSelectedLocation(location);
    setShowModal(true);
    // Actualizar URL con el ID del modal
    setSearchParams({ modal: location.id });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLocation(null);
    // Limpiar URL al cerrar modal
    setSearchParams({});
  };

  // Función para compartir URL del modal
  const shareModalUrl = (locationId: string) => {
    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?modal=${locationId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Audio Tour - ${selectedLocation?.name}`,
        text: `Escucha la historia de ${selectedLocation?.name}`,
        url: shareUrl
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('URL copiada al portapapeles');
      });
    }
  };

  // Función removida ya que no se usa más

  // Detectar modal desde URL al cargar la página
  useEffect(() => {
    const modalId = searchParams.get('modal');
    if (modalId && destinations.length > 0) {
      const location = popularLocations.find(loc => loc.id === modalId);
      if (location) {
        console.log('🎯 Abriendo modal desde URL:', modalId);
        setSelectedLocation(location);
        setShowModal(true);
      } else {
        console.log('⚠️ Modal ID no encontrado:', modalId);
        // Limpiar URL si el ID no es válido
        setSearchParams({});
      }
    }
  }, [destinations, searchParams, popularLocations, setSearchParams]);

  // Control de audio - solo un audio a la vez
  useEffect(() => {
    const handlePlay = (e: Event) => {
      if (e.target instanceof HTMLAudioElement) {
        document.querySelectorAll('audio').forEach(audio => {
          if (audio !== e.target) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      }
    };

    document.addEventListener('play', handlePlay, true);
    return () => document.removeEventListener('play', handlePlay, true);
  }, []);

  // Mostrar loading solo si realmente está cargando y no hay datos
  if (destinationsLoading && destinations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audio library...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (destinationsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">❌ Error loading destinations</div>
            <p className="text-gray-600 mb-4">{destinationsError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={`biblioteca-${i18n.language}`} className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {t('audioLibrary.title')}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('audioLibrary.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de ubicaciones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularLocations.map((location) => (
            <motion.div
              key={location.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => openModal(location)}
            >
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/places/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{location.rating}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{location.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{location.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{location.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Headphones className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('audioLibrary.audio')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal (mantenido para compatibilidad) */}
      <AnimatePresence>
        {showModal && selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6">
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <button
                    onClick={() => shareModalUrl(selectedLocation.id)}
                    className="text-blue-500 hover:text-blue-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
                    title="Compartir URL"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedLocation.name}</h2>
                  <img
                    src={selectedLocation.image}
                    alt={selectedLocation.name}
                    className="w-full h-64 object-cover rounded-xl mb-4"
                    onError={(e) => {
                      e.currentTarget.src = '/places/placeholder.jpg';
                    }}
                  />
                  <p className="text-gray-700 mb-4">{selectedLocation.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{t('audioLibrary.history')}</h4>
                    <p className="text-gray-700 text-sm">{selectedLocation.history}</p>
                  </div>
                </div>

                {/* Sección de audios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('audioLibrary.narrations')}</h3>

                  {selectedLocation && (
                    <div className="space-y-4">
                      {/* Buscar el destino correspondiente en la lista de destinos */}
                      {destinations.find(dest => dest.id === selectedLocation.id) && (
                        <>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">🇪🇸 {t('audioLibrary.languages.spanish')}</h4>
                            <LimitedAudioPlayer
                              src={destinations.find(dest => dest.id === selectedLocation.id)?.audios.es || ''}
                              title={selectedLocation.name}
                              subtitle={t('audioLibrary.languages.spanish')}
                              language="Español"
                              audioId={`${selectedLocation.id}-spanish`}
                            />
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-2">🇬🇧 {t('audioLibrary.languages.english')}</h4>
                            <LimitedAudioPlayer
                              src={destinations.find(dest => dest.id === selectedLocation.id)?.audios.en || ''}
                              title={selectedLocation.name}
                              subtitle={t('audioLibrary.languages.english')}
                              language="English"
                              audioId={`${selectedLocation.id}-english`}
                            />
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-medium text-purple-900 mb-2">🇫🇷 {t('audioLibrary.languages.french')}</h4>
                            <LimitedAudioPlayer
                              src={destinations.find(dest => dest.id === selectedLocation.id)?.audios.fr || ''}
                              title={selectedLocation.name}
                              subtitle={t('audioLibrary.languages.french')}
                              language="Français"
                              audioId={`${selectedLocation.id}-french`}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!hasFullAccess() && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-center text-white">
                      <h4 className="text-lg font-semibold mb-2">{t('audioLibrary.premiumTitle')}</h4>
                      <p className="mb-4">{t('audioLibrary.premiumMsg')}</p>
                      <button
                        onClick={() => window.location.href = '/subscribe'}
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {t('audioLibrary.premiumBtn')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BibliotecaReact; 
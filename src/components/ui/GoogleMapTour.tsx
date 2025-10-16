import React, { useState, useCallback } from 'react';
import { X, Navigation, Play, Square, MapPin, Star, Clock, Menu, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GoogleMapWrapper from './GoogleMapWrapper';
import { Location } from '../../data/touristLocations';
import { useLocationMap } from '../../hooks/useLocationMap';

interface GoogleMapTourProps {
  onClose?: () => void;
}

const GoogleMapTour: React.FC<GoogleMapTourProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { qrLocations } = useLocationMap();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<{ from: { lat: number; lng: number }; to: { lat: number; lng: number } } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ duration: string; distance: string } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 19.797, lng: -70.688 });
  const [mapZoom, setMapZoom] = useState(13);
  const [tourMapLoaded, setTourMapLoaded] = useState(false);
  // Estados para controlar la vista móvil
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Manejar clic en ubicación
  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    // Centrar el mapa en la ubicación seleccionada
    setMapCenter(location.coordinates);
    setMapZoom(15);
  }, []);

  // Manejar inicio de ruta
  const handleRouteStart = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }, routeInfo?: { duration: string; distance: string }) => {
    setIsRouteActive(true);
    setCurrentRoute({ from, to });
    if (routeInfo) {
      setRouteInfo(routeInfo);
    }
    setSelectedLocation(null);
  }, []);

  // Manejar inicio de tour guiado
  const handleStartGuidedTour = useCallback(async () => {
    if (!selectedLocation) return;

    console.log('🚀 Iniciando tour guiado para:', selectedLocation.name);

    try {
      // Opción 1: Intentar usar Google Maps JavaScript API para navegación integrada
      if (window.google && window.google.maps) {
        console.log('📍 Usando Google Maps JavaScript API integrada');
        await startIntegratedNavigation(selectedLocation);
      } else {
        // Opción 2: Redireccionar a Google Maps con ruta pre-configurada
        console.log('🌐 Redirigiendo a Google Maps');
        await redirectToGoogleMaps(selectedLocation);
      }
    } catch (error) {
      console.error('❌ Error iniciando tour:', error);
      // Fallback: Redireccionar a Google Maps
      await redirectToGoogleMaps(selectedLocation);
    }
  }, [selectedLocation]);

  // Función para navegación integrada con Google Maps JavaScript API
  const startIntegratedNavigation = async (location: Location) => {
    try {
      // Crear una nueva ventana con Google Maps en modo navegación
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}&travelmode=walking&dir_action=navigate`;
      
      // Intentar abrir en la misma ventana para mejor experiencia móvil
      if (window.innerWidth <= 768) {
        window.location.href = mapsUrl;
      } else {
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error con navegación integrada:', error);
      throw error;
    }
  };

  // Función para redireccionar a Google Maps con ruta optimizada
  const redirectToGoogleMaps = async (location: Location, includeWaypoints: boolean = true) => {
    try {
      // Obtener ubicación actual del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            // Construir URL de Google Maps con nombre específico del destino
            let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodeURIComponent(location.name + ', Puerto Plata')}&travelmode=walking&dir_action=navigate`;
            
            // Solo agregar destinos del tour si se solicita
            if (includeWaypoints) {
              const tourDestinations = getTourDestinations(location.coordinates, userLat, userLng);
              if (tourDestinations.length > 0) {
                // Usar nombres específicos en lugar de solo coordenadas
                const waypointStr = tourDestinations.map(dest => `${dest.name}, Puerto Plata`).join('|');
                mapsUrl += `&waypoints=${encodeURIComponent(waypointStr)}`;
                console.log('🗺️ Tour guiado con destinos específicos:', tourDestinations.map(d => d.name));
              }
            } else {
              console.log('🎯 Ruta directa al destino seleccionado');
            }
            
            console.log('🗺️ Abriendo Google Maps con ruta:', mapsUrl);
            
            // Abrir en nueva ventana
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
          },
          (error) => {
            console.warn('No se pudo obtener ubicación del usuario:', error);
            // Fallback: Solo destino sin origen usando nombre específico
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.name + ', Puerto Plata')}&travelmode=walking&dir_action=navigate`;
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
          }
        );
      } else {
        // Fallback: Solo destino sin origen usando nombre específico
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.name + ', Puerto Plata')}&travelmode=walking&dir_action=navigate`;
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error redirigiendo a Google Maps:', error);
    }
  };

  // Función para obtener destinos específicos del tour guiado
  const getTourDestinations = (mainDestination: { lat: number; lng: number }, userLat: number, userLng: number) => {
    const tourDestinations: { lat: number; lng: number; name: string; id: string }[] = [];
    
    // Crear lista de destinos candidatos (excluyendo el destino principal)
    const candidateDestinations = qrLocations.filter(location => location.id !== selectedLocation?.id);
    
    // Crear un tour inteligente que incluya destinos cercanos al usuario y al destino final
    const tourPlan = createIntelligentTourPlan(candidateDestinations, userLat, userLng, mainDestination);
    
    // Agregar información completa de cada destino del tour
    tourPlan.forEach(destination => {
      tourDestinations.push({
        lat: destination.coordinates.lat,
        lng: destination.coordinates.lng,
        name: destination.name,
        id: destination.id
      });
    });
    
    console.log('🎯 Tour guiado creado con destinos:', tourDestinations.map(d => d.name));
    console.log('📍 Destino final:', selectedLocation?.name);
    
    return tourDestinations;
  };

  // Función para crear un plan de tour inteligente
  const createIntelligentTourPlan = (candidates: any[], userLat: number, userLng: number, finalDestination: { lat: number; lng: number }) => {
    const tourPlan: any[] = [];
    
    // Seleccionar 2-3 destinos que estén cerca del usuario (para empezar el tour)
    const nearbyDestinations = candidates
      .map(dest => ({
        ...dest,
        distanceFromUser: calculateDistance(userLat, userLng, dest.coordinates.lat, dest.coordinates.lng)
      }))
      .filter(dest => dest.distanceFromUser < 3) // Máximo 3km del usuario
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
      .slice(0, 2);
    
    // Seleccionar 1-2 destinos que estén cerca del destino final (para terminar cerca)
    const nearFinalDestinations = candidates
      .map(dest => ({
        ...dest,
        distanceFromFinal: calculateDistance(finalDestination.lat, finalDestination.lng, dest.coordinates.lat, dest.coordinates.lng)
      }))
      .filter(dest => dest.distanceFromFinal < 2) // Máximo 2km del destino final
      .sort((a, b) => a.distanceFromFinal - b.distanceFromFinal)
      .slice(0, 1);
    
    // Combinar los destinos seleccionados
    const selectedDestinations = [...nearbyDestinations, ...nearFinalDestinations];
    
    // Eliminar duplicados
    const uniqueDestinations = selectedDestinations.filter((dest, index, self) => 
      index === self.findIndex(d => d.id === dest.id)
    );
    
    // Limitar a máximo 3 destinos para el tour
    return uniqueDestinations.slice(0, 3);
  };

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Manejar detener ruta
  const handleRouteStop = useCallback(() => {
    setIsRouteActive(false);
    setCurrentRoute(null);
    setRouteInfo(null);
  }, []);

  // Obtener color por categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      historico: 'bg-blue-500',
      cultural: 'bg-purple-500',
      recreativo: 'bg-green-500',
      religioso: 'bg-orange-500',
      natural: 'bg-teal-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  // Obtener nombre de categoría
  const getCategoryName = (category: string) => {
    const names = {
      historico: 'Histórico',
      cultural: 'Cultural',
      recreativo: 'Recreativo',
      religioso: 'Religioso',
      natural: 'Natural'
    };
    return names[category as keyof typeof names] || 'Otro';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 p-0 relative flex flex-col items-center border border-gray-100 dark:border-gray-700 animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="w-full p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              {t('tour.start_tour')}
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Puerto Plata - Lugares Turísticos</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Controles móviles */}
        <div className="md:hidden w-full p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => setMobileView('map')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mobileView === 'map'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Map className="h-4 w-4" />
              Mapa
            </button>
            <button
              onClick={() => setMobileView('list')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mobileView === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Menu className="h-4 w-4" />
              Lista
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex w-full h-[500px] md:h-[600px]">
          {/* Mapa */}
          <div className={`${mobileView === 'map' ? 'flex' : 'hidden'} md:flex flex-1 relative`} style={{ minHeight: '500px', height: '100%' }} id="tour-map-container">
            <iframe 
              id="tour-google-map-iframe"
              src="https://www.google.com/maps/d/u/0/embed?mid=169mW6cXdqt3zYAd9r68P5Uue6X6VG1c&ehbc=2E312F&noprof=1" 
              width="100%" 
              height="100%" 
              style={{ 
                border: 0,
                minHeight: '500px',
                height: '100%',
                display: 'block'
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Puerto Plata - Comenzar Tour"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => setTourMapLoaded(true)}
              onError={() => console.error('Error al cargar el mapa de tour')}
            />
            
            {/* Indicador de carga independiente para el mapa de tour */}
            {!tourMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10" id="tour-map-loading">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando mapa de tour...</p>
                </div>
              </div>
            )}
            
            {/* Información de ruta activa */}
            {isRouteActive && routeInfo && (
              <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Ruta activa
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      ⏱️ {routeInfo.duration} • 📏 {routeInfo.distance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón flotante para mostrar lista en móvil */}
            {mobileView === 'map' && (
              <button
                onClick={() => setMobileView('list')}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors z-20"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Panel lateral - Desktop siempre visible, móvil solo cuando se selecciona lista */}
          <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900`}>
            <div className="p-3 md:p-4 w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('tour.available_locations')}
                </h3>
                <button
                  onClick={() => setMobileView('map')}
                  className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Lista de ubicaciones */}
              <div className="space-y-3">
                {qrLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedLocation?.id === location.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleLocationClick(location)}
                  >
                    {selectedLocation?.id === location.id && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Seleccionado
                        </span>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <div 
                        className="flex-shrink-0"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f3f4f6'
                        }}
                      >
                        <img
                          src={location.imageUrl || '/places/default.jpg'}
                          alt={location.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/places/default.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                            {location.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(location.category)}`}>
                            {getCategoryName(location.category)}
                          </span>
                        </div>
                        
                        {location.address && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location.address}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {location.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          {location.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 text-xs">{'★'.repeat(Math.round(location.rating))}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {location.rating} ({location.reviews})
                              </span>
                            </div>
                          )}
                          
                          {location.isOpen !== undefined && (
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                              location.isOpen 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              <Clock className="h-3 w-3" />
                              {location.isOpen ? t('tour.open') : t('tour.closed')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con controles */}
        <div className="w-full p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {qrLocations.length} {t('tour.locations_available')}
              </span>
              {isRouteActive && (
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  🗺️ {t('tour.route_active')}
                </span>
              )}
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              {isRouteActive ? (
                <button
                  onClick={handleRouteStop}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
                >
                  <Square className="h-4 w-4" />
                  {t('tour.stop_route')}
                </button>
              ) : (
                <div className="flex flex-col md:flex-row gap-2 flex-1">
                  <button
                    onClick={() => handleStartGuidedTour()}
                    disabled={!selectedLocation}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors ${
                      selectedLocation 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Navigation className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {selectedLocation ? 'Tour Completo' : 'Selecciona un lugar'}
                    </span>
                    <span className="md:hidden">
                      {selectedLocation ? 'Tour' : 'Selecciona'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedLocation) {
                        redirectToGoogleMaps(selectedLocation, false);
                      }
                    }}
                    disabled={!selectedLocation}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors ${
                      selectedLocation 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {selectedLocation ? 'Ir Directo' : 'Selecciona un lugar'}
                    </span>
                    <span className="md:hidden">
                      {selectedLocation ? 'Directo' : 'Selecciona'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de detalles */}
        {selectedLocation && showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLocation.name}
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                  <img
                    src={selectedLocation.imageUrl || '/places/default.jpg'}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/places/default.jpg';
                    }}
                  />
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {selectedLocation.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Dirección:</strong> {selectedLocation.address}</p>
                  <p><strong>Categoría:</strong> {getCategoryName(selectedLocation.category)}</p>
                  <p><strong>Código QR:</strong> {selectedLocation.qrCode}</p>
                  {selectedLocation.rating && (
                    <p><strong>Calificación:</strong> {selectedLocation.rating} ({selectedLocation.reviews} reseñas)</p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      const url = `https://maps.google.com/?q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    {t('tour.open_in_maps')}
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('tour.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapTour; 
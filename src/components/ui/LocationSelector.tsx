import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, X, Check, Hotel, Anchor, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocationSelector } from '../../hooks/useLocationSelector';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface LocationSelectorProps {
  mode: 'origin' | 'destination';
  originType?: 'hotel' | 'airbnb' | 'cruise';
  origin?: any;
  onLocationSelected: (coordinates: { lat: number; lng: number }, name: string) => void;
  onCancel: () => void;
}

// Hoteles reales de Puerto Plata (desde Maimón hasta Cabarete)
const getPuertoPlataHotels = (t: any) => [
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
  
  // Cofresí
  { name: t('hotels.ocean_world_adventure_park_hotel'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cofresi') },
  { name: t('hotels.hotel_cofresi'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cofresi') },
  { name: t('hotels.cofresi_beach_resort'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cofresi') },
  
  // Sosúa
  { name: t('hotels.hotel_sosua_bay'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.sosua') },
  { name: t('hotels.hotel_sosua_by_the_sea'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.sosua') },
  { name: t('hotels.hotel_sosua_ocean_village'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.sosua') },
  { name: t('hotels.hotel_sosua_tropical'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.sosua') },
  
  // Cabarete
  { name: t('hotels.hotel_cabarete_palm_beach'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_cabarete_east'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_cabarete_surf_camp'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_cabarete_ocean_view'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cabarete') },
  { name: t('hotels.hotel_cabarete_beach_resort'), coordinates: { lat: 19.7833, lng: -70.6833 }, area: t('hotels.cabarete') },
];

// Terminales de crucero reales
const getCruiseTerminals = (t: any) => [
  { 
    name: t('regresoSeguro.amber-cove'), 
    coordinates: { lat: 19.7833, lng: -70.6833 },
    location: t('hotels.maimon'),
    description: t('regresoSeguro.cruiseTerminal')
  },
  { 
    name: t('regresoSeguro.taino-bay'), 
    coordinates: { lat: 19.7942, lng: -70.6920 },
    location: t('regresoSeguro.cruiseTerminal'),
    description: t('regresoSeguro.cruiseTerminal')
  },
];

// Lugares populares para destinos
const getPopularDestinations = (t: any) => [
  { name: t('destinations.parque_central'), coordinates: { lat: 19.797645489933995, lng: -70.69338813105304 }, category: t('destinations.categories.centro') },
  { name: t('destinations.catedral_san_felipe'), coordinates: { lat: 19.797469, lng: -70.693785 }, category: t('destinations.categories.historico') },
  { name: t('destinations.fortaleza_san_felipe'), coordinates: { lat: 19.804007, lng: -70.695785 }, category: t('destinations.categories.historico') },
  { name: t('destinations.calle_de_las_sombrillas'), coordinates: { lat: 19.798463, lng: -70.694334 }, category: t('destinations.categories.turistico') },
  { name: t('destinations.museo_del_ambar'), coordinates: { lat: 19.7964711, lng: -70.6947493 }, category: t('destinations.categories.cultural') },
  { name: t('destinations.teleferico_puerto_plata'), coordinates: { lat: 19.78816006748995, lng: -70.71003687720058 }, category: t('destinations.categories.turistico') },
  { name: t('destinations.playa_dorada'), coordinates: { lat: 19.7833, lng: -70.6833 }, category: t('destinations.categories.playa') },
  { name: t('destinations.centro_comercial'), coordinates: { lat: 19.797645489933995, lng: -70.69338813105304 }, category: t('destinations.categories.comercial') },
  { name: t('destinations.mercado_modelo'), coordinates: { lat: 19.797645489933995, lng: -70.69338813105304 }, category: t('destinations.categories.comercial') },
  { name: t('destinations.malecon_de_puerto_plata'), coordinates: { lat: 19.794593135681072, lng: -70.67277435916677 }, category: t('destinations.categories.turistico') },
];

const LocationSelector: React.FC<LocationSelectorProps> = ({
  mode,
  originType,
  origin,
  onLocationSelected,
  onCancel
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Usar el hook optimizado para cargar datos de ubicaciones
  const { hotels: puertoPlataHotels, attractions, loading: dataLoading, error: dataError } = useLocationSelector(t);

  // Filtrar hoteles por búsqueda
  const filteredHotels = getPuertoPlataHotels(t).filter((hotel: any) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar hoteles por área
  const hotelsByArea = filteredHotels.reduce((acc: any, hotel: any) => {
    if (!acc[hotel.area]) {
      acc[hotel.area] = [];
    }
    acc[hotel.area].push(hotel);
    return acc;
  }, {} as Record<string, any>);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('API Key de Google Maps no encontrada');
        }

        // Función de inicialización global
        window.initMap = () => {
          if (!isMounted || !mapRef.current) return;

          try {
            const map = new window.google.maps.Map(mapRef.current, {
              center: { lat: 19.797, lng: -70.688 }, // Puerto Plata
              zoom: 11, // Zoom más amplio para ver toda la región
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              gestureHandling: 'cooperative'
            });

            mapInstanceRef.current = map;

            // Agregar marcadores según el tipo de origen
            if (mode === 'origin' && originType) {
              if (originType === 'hotel') {
                // Agregar marcadores de hoteles
                getPuertoPlataHotels(t).forEach((hotel: any) => {
                  new window.google.maps.Marker({
                    position: hotel.coordinates,
                    map: map,
                    title: hotel.name,
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#4285F4',
                      fillOpacity: 0.8,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2
                    },
                    label: {
                      text: '🏨',
                      fontSize: '16px'
                    }
                  });
                });
              } else if (originType === 'cruise') {
                // Agregar marcadores de terminales de crucero
                getCruiseTerminals(t).forEach((terminal: any) => {
                  new window.google.maps.Marker({
                    position: terminal.coordinates,
                    map: map,
                    title: terminal.name,
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#FF6B35',
                      fillOpacity: 0.8,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2
                    },
                    label: {
                      text: '🚢',
                      fontSize: '18px'
                    }
                  });
                });
              }
            } else if (mode === 'destination') {
              // Agregar marcadores de destinos populares
              getPopularDestinations(t).forEach((destination: any) => {
                new window.google.maps.Marker({
                  position: destination.coordinates,
                  map: map,
                  title: destination.name,
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#34A853',
                    fillOpacity: 0.8,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                  },
                  label: {
                    text: '📍',
                    fontSize: '16px'
                  }
                });
              });
            }

            // Agregar evento de clic en el mapa
            map.addListener('click', (event: any) => {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              
              setSelectedLocation({ lat, lng });
              
              // Geocodificar para obtener el nombre del lugar
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                  setLocationName(results[0].formatted_address);
                } else {
                  setLocationName(`Ubicación seleccionada (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                }
              });

              // Actualizar marcador de selección
              if (markerRef.current) {
                markerRef.current.setMap(null);
              }
              
              markerRef.current = new window.google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: 'Ubicación seleccionada',
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#EA4335',
                  fillOpacity: 0.9,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 3
                }
              });
            });

            if (isMounted) {
              setIsLoading(false);
            }
          } catch (error) {
            if (isMounted) {
              console.error('Error creating map:', error);
              setError('Error al crear el mapa');
              setIsLoading(false);
            }
          }
        };

        // Crear script de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) {
            setError('Error al cargar Google Maps API');
            setIsLoading(false);
          }
        };

        document.head.appendChild(script);

      } catch (error) {
        if (isMounted) {
          console.error('Error initializing map:', error);
          setError('Error al cargar el mapa');
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // Limpiar script si existe
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(script => script.remove());
    };
  }, [mode, originType]);

  // Función para seleccionar lugar
  const handlePlaceSelect = (place: { name: string; coordinates: { lat: number; lng: number } }) => {
    setSelectedLocation(place.coordinates);
    setLocationName(place.name);
    
    // Actualizar marcador en el mapa
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setMap(null);
      
      markerRef.current = new window.google.maps.Marker({
        position: place.coordinates,
        map: mapInstanceRef.current,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#EA4335',
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      });
      
      mapInstanceRef.current.setCenter(place.coordinates);
      mapInstanceRef.current.setZoom(15);
    }
  };

  // Función para confirmar selección
  const handleConfirmSelection = () => {
    if (selectedLocation && locationName) {
      onLocationSelected(selectedLocation, locationName);
    }
  };

  // Función para buscar ubicación
  const handleSearchLocation = () => {
    if (!mapInstanceRef.current) return;

    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('location-search') as HTMLInputElement
    );

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      setSelectedLocation({ lat, lng });
      setLocationName(place.formatted_address || place.name || 'Ubicación encontrada');

      // Actualizar marcador
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: place.name || 'Ubicación encontrada',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#EA4335',
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      });

      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(15);
    });
  };

  const renderSidebarContent = () => {
    if (mode === 'origin' && originType === 'hotel') {
      return (
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar hoteles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Hoteles agrupados por área */}
          <div className="space-y-4">
            {Object.entries(hotelsByArea).map(([area, hotels]) => (
              <div key={area} className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-1">
                  {area} ({hotels.length})
                </h4>
                <div className="space-y-1">
                  {hotels.map((hotel, index) => (
                    <button
                      key={index}
                      onClick={() => handlePlaceSelect(hotel)}
                      className={`w-full p-2 text-left rounded-lg border transition-colors ${
                        selectedLocation?.lat === hotel.coordinates.lat && selectedLocation?.lng === hotel.coordinates.lng
                          ? 'bg-blue-100 border-blue-400'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hotel className="w-4 h-4 text-blue-500" />
                        <div className="flex-1">
                          <span className="font-medium text-sm">{hotel.name}</span>
                          <div className="text-xs text-gray-500">{hotel.area}</div>
                        </div>
                        {selectedLocation?.lat === hotel.coordinates.lat && selectedLocation?.lng === hotel.coordinates.lng && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'origin' && originType === 'cruise') {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-3">Terminales de Crucero</h4>
          <div className="space-y-2">
                            {getCruiseTerminals(t).map((terminal: any, index: number) => (
              <button
                key={index}
                onClick={() => handlePlaceSelect(terminal)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  selectedLocation?.lat === terminal.coordinates.lat && selectedLocation?.lng === terminal.coordinates.lng
                    ? 'bg-orange-100 border-orange-400'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-orange-500" />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{terminal.name}</span>
                    <div className="text-xs text-gray-500">{terminal.location}</div>
                    <div className="text-xs text-gray-400">{terminal.description}</div>
                  </div>
                  {selectedLocation?.lat === terminal.coordinates.lat && selectedLocation?.lng === terminal.coordinates.lng && (
                    <Check className="w-4 h-4 text-orange-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'origin' && originType === 'airbnb') {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Selecciona tu Airbnb</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Haz clic en el mapa para seleccionar la ubicación exacta de tu Airbnb.
            </p>
            <div className="text-xs text-blue-600">
              💡 Tip: Puedes usar la barra de búsqueda para encontrar tu dirección específica.
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <input
                id="location-search"
                type="text"
                placeholder="Buscar dirección de tu Airbnb..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                onClick={handleSearchLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'destination') {
      return (
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <input
                id="location-search"
                type="text"
                placeholder="Buscar destino..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                onClick={handleSearchLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Destinos populares */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">Destinos Populares</h4>
            <div className="space-y-2">
                              {getPopularDestinations(t).map((destination: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handlePlaceSelect(destination)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedLocation?.lat === destination.coordinates.lat && selectedLocation?.lng === destination.coordinates.lng
                      ? 'bg-green-100 border-green-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{destination.name}</span>
                      <div className="text-xs text-gray-500">{destination.category}</div>
                    </div>
                    {selectedLocation?.lat === destination.coordinates.lat && selectedLocation?.lng === destination.coordinates.lng && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {mode === 'origin' ? 'Seleccionar Punto de Origen' : 'Seleccionar Destino'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'origin' 
                ? originType === 'hotel' 
                  ? 'Selecciona tu hotel en Puerto Plata'
                  : originType === 'airbnb'
                  ? 'Selecciona la ubicación de tu Airbnb'
                  : 'Selecciona tu terminal de crucero'
                : 'Selecciona tu destino'
              }
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4">
              {renderSidebarContent()}

              {/* Ubicación seleccionada */}
              {selectedLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Ubicación Seleccionada</h4>
                  <p className="text-sm text-blue-800 mb-2">{locationName}</p>
                  <p className="text-xs text-blue-600">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Área del mapa */}
          <div className="flex-1 relative">
            {error ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <p className="text-red-600 mb-2">{error}</p>
                  <button
                    onClick={onCancel}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Cargando mapa...</p>
                    </div>
                  </div>
                )}
                <div ref={mapRef} className="w-full h-full" />
              </>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedLocation 
                ? `Ubicación seleccionada: ${locationName}`
                : mode === 'origin' && originType === 'airbnb'
                ? 'Haz clic en el mapa para seleccionar tu Airbnb'
                : 'Haz clic en el mapa o selecciona una opción de la lista'
              }
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedLocation}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LocationSelector; 
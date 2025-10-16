import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Location {
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
}

interface GoogleMapWrapperProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationClick?: (location: Location) => void;
  onRouteStart?: (from: { lat: number; lng: number }, to: { lat: number; lng: number }, routeInfo?: { duration: string; distance: string }) => void;
  onRouteStop?: () => void;
  showUserLocation?: boolean;
  showDirections?: boolean;
  selectedLocation?: Location | null;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({
  locations,
  center = { lat: 19.797, lng: -70.688 },
  zoom = 13,
  onLocationClick,
  onRouteStart,
  onRouteStop,
  showUserLocation = false,
  showDirections = true,
  selectedLocation,
  className = '',
  style = {}
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  // Estilos de mapa para modo oscuro
  const darkMapStyle: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ];

  // Función para obtener color de categoría
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      historico: '#3B82F6',
      cultural: '#8B5CF6',
      recreativo: '#10B981',
      religioso: '#F59E0B',
      natural: '#14B8A6'
    };
    return colors[category] || '#6B7280';
  };

  // Función para crear contenido del InfoWindow
  const createInfoWindowContent = (location: Location) => {
    return `
      <div class="info-window-content p-3 max-w-xs">
        <div class="flex items-start space-x-3">
          <img src="${location.imageUrl || '/places/default.jpg'}" alt="${location.name}" class="w-16 h-16 object-cover rounded-lg">
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 text-sm mb-1">${location.name}</h3>
            <p class="text-gray-600 text-xs mb-2">${location.description}</p>
            ${location.address ? `<p class="text-gray-500 text-xs mb-2">📍 ${location.address}</p>` : ''}
            ${location.rating ? `<p class="text-yellow-500 text-xs mb-2">★ ${location.rating} (${location.reviews} reseñas)</p>` : ''}
            <div class="flex gap-2">
              ${showDirections ? `<button onclick="window.startRoute('${location.id}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors">Iniciar Ruta</button>` : ''}
              <button onclick="window.stopRoute()" class="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors">Detener Ruta</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Función para crear marcadores
  const createMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getCategoryColor(location.category),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          const content = createInfoWindowContent(location);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);

          // Configurar funciones globales para los botones
          (window as any).startRoute = (locationId: string) => {
            if (userLocation && directionsServiceRef.current && directionsRendererRef.current) {
              const targetLocation = locations.find(loc => loc.id === locationId);
              if (targetLocation) {
                directionsServiceRef.current.route({
                  origin: userLocation,
                  destination: targetLocation.coordinates,
                  travelMode: window.google.maps.TravelMode.DRIVING,
                  unitSystem: window.google.maps.UnitSystem.METRIC
                }, (result, status) => {
                  if (status === 'OK' && result && directionsRendererRef.current) {
                    directionsRendererRef.current.setDirections(result);
                    setIsRouteActive(true);
                    
                    if (onRouteStart && result.routes && result.routes.length > 0) {
                      const route = result.routes[0];
                      const leg = route.legs[0];
                      onRouteStart(userLocation, targetLocation.coordinates, {
                        duration: leg.duration?.text || 'N/A',
                        distance: leg.distance?.text || 'N/A'
                      });
                    }
                  }
                });
              }
            }
          };

          (window as any).stopRoute = () => {
            if (directionsRendererRef.current) {
              directionsRendererRef.current.setDirections({
                routes: [],
                request: {} as any,
                geocoded_waypoints: []
              });
              setIsRouteActive(false);
              if (onRouteStop) {
                onRouteStop();
              }
            }
          };

          if (onLocationClick) {
            onLocationClick(location);
          }
        }
      });

      markersRef.current.push(marker);
    });
  };

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Inicializando mapa...');
        console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Presente' : 'Faltante');

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('API Key de Google Maps no encontrada');
        }

        // Función de inicialización global
        window.initMap = () => {
          if (!isMounted || !mapRef.current) return;

          try {
            const map = new window.google.maps.Map(mapRef.current, {
              center: center,
              zoom: zoom,
              styles: darkMode ? darkMapStyle : [],
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              gestureHandling: 'cooperative'
            });

            mapInstanceRef.current = map;
            console.log('Mapa creado exitosamente');

            // Crear InfoWindow
            infoWindowRef.current = new window.google.maps.InfoWindow();

            // Configurar servicios de direcciones
            if (showDirections) {
              directionsServiceRef.current = new window.google.maps.DirectionsService();
              directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#3B82F6',
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                }
              });
              directionsRendererRef.current.setMap(map);
            }

            // Obtener ubicación del usuario
            if (showUserLocation && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  if (!isMounted) return;
                  
                  const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  setUserLocation(userPos);

                  // Crear marcador de ubicación del usuario
                  userLocationMarkerRef.current = new window.google.maps.Marker({
                    position: userPos,
                    map: map,
                    title: 'Mi ubicación',
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#10B981',
                      fillOpacity: 0.8,
                      strokeColor: '#ffffff',
                      strokeWeight: 2
                    }
                  });

                  // Centrar mapa en ubicación del usuario si no hay ubicación seleccionada
                  if (!selectedLocation) {
                    map.setCenter(userPos);
                    map.setZoom(15);
                  }
                },
                (error) => {
                  console.log('Error getting location:', error);
                }
              );
            }

            if (isMounted) {
              setIsLoading(false);
              console.log('Mapa inicializado completamente');
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
  }, [center, zoom, darkMode, showDirections, showUserLocation, selectedLocation]);

  // Efecto para crear marcadores cuando el mapa esté listo
  useEffect(() => {
    if (mapInstanceRef.current && locations.length > 0 && window.google) {
      console.log('Creando marcadores...');
      createMarkers();
    }
  }, [mapInstanceRef.current, locations]);

  // Efecto para manejar ubicación seleccionada
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      const position = selectedLocation.coordinates;
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(16);

      // Abrir InfoWindow para la ubicación seleccionada
      if (infoWindowRef.current) {
        const content = createInfoWindowContent(selectedLocation);
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.setPosition(position);
        infoWindowRef.current.open(mapInstanceRef.current);
      }
    }
  }, [selectedLocation]);

  // Efecto para limpiar marcadores al desmontar
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
      }
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Barra de búsqueda */}
      <div className="absolute top-4 left-4 z-20 w-80">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar hoteles, restaurantes, lugares..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Botones de navegación rápida */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            if (userLocation && mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(userLocation);
              mapInstanceRef.current.setZoom(15);
            }
          }}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Ir a mi ubicación"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              const currentZoom = mapInstanceRef.current.getZoom() || 13;
              mapInstanceRef.current.setZoom(currentZoom + 1);
            }
          }}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Acercar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              const currentZoom = mapInstanceRef.current.getZoom() || 13;
              mapInstanceRef.current.setZoom(Math.max(1, currentZoom - 1));
            }
          }}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Alejar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">{t('map.loading')}</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {isRouteActive && (
        <button
          onClick={() => {
            if (directionsRendererRef.current) {
              directionsRendererRef.current.setDirections({
                routes: [],
                request: {} as any,
                geocoded_waypoints: []
              });
              setIsRouteActive(false);
              if (onRouteStop) {
                onRouteStop();
              }
            }
          }}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-20"
        >
          {t('map.stop_route')}
        </button>
      )}
    </div>
  );
};

export default GoogleMapWrapper; 
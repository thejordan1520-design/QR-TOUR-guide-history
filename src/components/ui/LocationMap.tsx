import React, { useState, useEffect } from 'react';
import { X, Search, Heart, Filter, MapPin, Clock, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getOfflineUrl } from '../../utils/offlineStorage';
import { useLocationMap } from '../../hooks/useLocationMap';
import QrMap from './QrMap';

interface QRLocation {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  category: 'historico' | 'cultural' | 'recreativo' | 'religioso' | 'natural';
  qrCode: string;
  imageUrl?: string; // Added for imageUrl
  address?: string; // Added for address
  rating?: number; // Added for rating
  reviews?: number; // Added for reviews
  isOpen?: boolean; // Added for isOpen
  distance?: number; // Nueva propiedad para distancia
}

// Array hardcodeado removido - ahora se usa useLocationMap hook
const LocationMap: React.FC<LocationMapProps> = ({ isOpen, onClose, offlineMode = false }) => {
  const { t } = useTranslation();
  
  // Usar el hook optimizado para cargar datos de ubicaciones QR
  const { qrLocations, loading, error } = useLocationMap();



interface LocationMapProps {
  isOpen: boolean;
  onClose: () => void;
  offlineMode?: boolean;
}



  const [showSidebar, setShowSidebar] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [openFilter, setOpenFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'distance'>('name');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const pageSize = 8;



  // Estado para URLs resueltas de imágenes
  const [imageUrls, setImageUrls] = useState<{[id: string]: string}>({});
  useEffect(() => {
    let isMounted = true;
    Promise.all(qrLocations.map(async loc => {
      const url = await getOfflineUrl(loc.imageUrl || '/places/default.jpg', offlineMode);
      return { id: loc.id, url };
    })).then(results => {
      if (isMounted) {
        const map: {[id: string]: string} = {};
        results.forEach(r => { map[r.id] = r.url; });
        setImageUrls(map);
      }
    });
    return () => { isMounted = false; };
  }, [offlineMode]);



  const categoryNames = {
    historico: 'Histórico',
    cultural: 'Cultural',
    recreativo: 'Recreativo',
    religioso: 'Religioso',
    natural: 'Natural'
  };

  // Función para calcular distancia (movida antes de su uso)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  // Función para obtener el nombre traducido de una ubicación
  const getTranslatedLocation = (location: QRLocation) => {
    const translationMap: { [key: string]: { name: string; description: string } } = {
      'ron-brugal': {
        name: t('locations.ronfactory.name'),
        description: t('locations.ronfactory.description')
      }
    };
    
    const translation = translationMap[location.id];
    if (translation) {
      return {
        ...location,
        name: translation.name,
        description: translation.description,
        address: translation.name
      };
    }
    return location;
  };

  // Calcular distancias si tenemos ubicación del usuario y aplicar traducciones
  const locationsWithDistance = qrLocations.map(loc => {
    const translatedLoc = getTranslatedLocation(loc);
    
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        translatedLoc.coordinates.lat,
        translatedLoc.coordinates.lng
      );
      return { ...translatedLoc, distance };
    }
    return translatedLoc;
  });

  // Función para alternar favoritos
  const toggleFavorite = (locationId: string) => {
    setFavorites(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  if (!isOpen) return null;

  // Filtro avanzado con búsqueda
  const filteredLocations = locationsWithDistance.filter(loc => {
    const matchesSearch = searchQuery === '' || 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRating = ratingFilter === 0 || (loc.rating && loc.rating >= ratingFilter);
    const matchesOpen = openFilter === 'all' || (openFilter === 'open' ? loc.isOpen : !loc.isOpen);
    const matchesCategory = categoryFilter === 'all' || loc.category === categoryFilter;
    const matchesFavorites = !showFavoritesOnly || favorites.includes(loc.id);

    return matchesSearch && matchesRating && matchesOpen && matchesCategory && matchesFavorites;
  });

  // Ordenar resultados
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const paginatedLocations = sortedLocations.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.ceil(sortedLocations.length / pageSize);



  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 map-modal">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl map-modal-content">
        {/* Header mejorado */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between map-header">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              Mapa de Códigos QR
            </h2>
            <p className="text-gray-600">Puerto Plata - Lugares Turísticos</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar mejorado */}
          <div className={`w-1/3 border-r border-gray-200 overflow-y-auto bg-white z-20 transition-all duration-300 sidebar custom-scrollbar ${showSidebar ? '' : 'hidden md:block'}`}
            style={{ minWidth: showSidebar ? 320 : 0 }}>
            <div className="p-4">
              {/* Botón móvil para ocultar */}
              <button className="md:hidden mb-3 text-blue-600 flex items-center gap-2" onClick={() => setShowSidebar(false)}>
                <X className="h-4 w-4" />
                Ocultar lista
              </button>

              {/* Búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar lugares..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Filtros avanzados */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtros</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={ratingFilter} 
                    onChange={e => setRatingFilter(Number(e.target.value))} 
                    className="select-styled"
                  >
                    <option value={0}>Todas las calificaciones</option>
                    <option value={4}>4★ o más</option>
                    <option value={4.5}>4.5★ o más</option>
                    <option value={5}>5★</option>
                  </select>
                  
                  <select 
                    value={openFilter} 
                    onChange={e => setOpenFilter(e.target.value as 'all' | 'open' | 'closed')} 
                    className="select-styled"
                  >
                    <option value="all">Todos</option>
                    <option value="open">Abiertos</option>
                    <option value="closed">Cerrados</option>
                  </select>
                </div>

                <select 
                  value={categoryFilter} 
                  onChange={e => setCategoryFilter(e.target.value)} 
                  className="select-styled w-full"
                >
                  <option value="all">Todas las categorías</option>
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>

                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value as 'name' | 'rating' | 'distance')} 
                  className="select-styled w-full"
                >
                  <option value="name">Ordenar por nombre</option>
                  <option value="rating">Ordenar por calificación</option>
                  <option value="distance">Ordenar por distancia</option>
                </select>

                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors favorite-button ${
                    showFavoritesOnly 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  {showFavoritesOnly ? 'Mostrar todos' : 'Solo favoritos'}
                </button>
              </div>

              {/* Contador de resultados */}
              <div className="results-counter mb-3">
                {sortedLocations.length} lugar{sortedLocations.length !== 1 ? 'es' : ''} encontrado{sortedLocations.length !== 1 ? 's' : ''}
            </div>

              {/* Lista de lugares */}
                <div className="space-y-3">
                {paginatedLocations.map((location, index) => (
                  <div 
                    key={location.id} 
                    className="location-card hover-lift animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => {
                      setShowSidebar(false);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="flex-shrink-0"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f3f4f6'
                        }}
                      >
                        <img
                          src={imageUrls[location.id] || '/places/default.jpg'}
                          alt={location.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          onError={e => {
                            e.currentTarget.src = '/places/default.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">{location.name}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(location.id);
                            }}
                            className={`favorite-button ${favorites.includes(location.id) ? 'active' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${favorites.includes(location.id) ? 'fill-current text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                          </button>
                    </div>
                        
                        {location.address && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location.address}
                          </p>
                        )}
                        
                        {location.distance && (
                          <p className="distance-badge mt-1 inline-block">
                            📍 {location.distance.toFixed(1)} km
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{location.description}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          {location.rating && (
                            <div className="rating-stars">
                              <span className="text-yellow-500 text-xs">{'★'.repeat(Math.round(location.rating))}</span>
                              <span className="text-xs text-gray-500 ml-1">{location.rating} ({location.reviews})</span>
                </div>
              )}
                          
                          {location.isOpen !== undefined && (
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                              location.isOpen ? 'status-open' : 'status-closed'
                            }`}>
                              <Clock className="h-3 w-3" />
                              {location.isOpen ? 'Abierto' : 'Cerrado'}
                            </span>
              )}
            </div>

                                          <button
                          className="nav-button mt-2 w-full text-xs font-medium flex items-center justify-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSidebar(false);
                          }}
                        >
                          <Navigation className="h-3 w-3" />
                          Ver en mapa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación mejorada */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page-1)} 
                    className="pagination-button"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600 px-3 py-2">
                    Página {page} de {totalPages}
                  </span>
                  <button 
                    disabled={page === totalPages} 
                    onClick={() => setPage(page+1)} 
                    className="pagination-button"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botón flotante para mostrar sidebar en móvil */}
          {!showSidebar && (
            <button 
              className="floating-button md:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <MapPin className="h-4 w-4" />
            </button>
          )}

                    {/* Mapa Personalizado */}
          <div className="flex-1">
            <QrMap 
              className="w-full h-full"
              style={{ minHeight: '600px', height: '100%' }}
              isVisible={isOpen}
            />
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="map-footer p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                {sortedLocations.length} lugares disponibles
              </p>
              {userLocation && (
                <p className="flex items-center gap-1">
                  <Navigation className="h-4 w-4 text-green-600" />
                  Ubicación detectada
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                {favorites.length} favoritos
              </span>
              <span>•</span>
              <span>Puerto Plata, RD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
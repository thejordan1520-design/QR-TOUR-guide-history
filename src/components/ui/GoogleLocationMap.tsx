import React, { useState, useEffect } from 'react';
import { X, Search, Star, Menu, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocationMap } from '../../hooks/useLocationMap';

interface GoogleLocationMapProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation?: {
    id: string;
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  centerOnLocation?: boolean;
}

const GoogleLocationMap: React.FC<GoogleLocationMapProps> = ({ isOpen, onClose, selectedLocation: propSelectedLocation, centerOnLocation }) => {
  const { t } = useTranslation();
  
  // Usar el hook optimizado para cargar datos de ubicaciones QR
  const { qrLocations: touristLocations } = useLocationMap();
  
  const categoryNames = {
    historico: t('qrMap.categories.historico'),
    cultural: t('qrMap.categories.cultural'),
    recreativo: t('qrMap.categories.recreativo'),
    religioso: t('qrMap.categories.religioso'),
    natural: t('qrMap.categories.natural')
  };

  // Fallback de imágenes reales en Supabase Storage por id/slug
  const fallbackImages: Record<string, string> = {
    'calle-de-las-chichiguas-cometas': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/calledelacometas.jpg',
    'calle-de-las-sombrillas': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/calledelasombrillas%20-%20copia.jpg',
    'catedral-san-felipe': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/catedralsanfelipe.jpg',
    'cristo-redentor': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/cristo%20redentor.jpg',
    'fortaleza-san-felipe': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/fortalezasanfelipe.jpg',
    'letrero-puerto-plata': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/letreropuertoplata.jpg',
    'monumento-hermanas-mirabal': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/hermanasmirabal.jpg',
    'museo-del-mbar': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/museodelambar%20-%20copia.jpg',
    'museo-del-ambar': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/museodelambar%20-%20copia.jpg',
    'museo-del-larimar': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/larimarr.jpg',
    'museo-general-gregorio-luper-n': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/MuseoGregorioLuperon.jpg',
    'museo-general-gregorio-luperon': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/MuseoGregorioLuperon.jpg',
    'neptuno-malec-n': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/neptuno.jpg',
    'ocean-world': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/oceanworld.jpg',
    'parque-central-de-puerto-plata': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/parque%20central.jpg',
    'calle-rosada': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/callerosada.jpg',
    'ron-factory': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/run%20factory.jpg',
    'telef-rico': 'https://nhegdlprktbtriwwhoms.supabase.co/storage/v1/object/public/destination-images/teleferico.jpg'
  };

  const normalize = (s: string) => (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-');

  const getThumb = (loc: any) => {
    const img = loc.imageUrl || (loc.images && loc.images[0]);
    if (typeof img === 'string' && img.startsWith('http')) return img;
    const key = normalize(loc.id || loc.slug || '');
    return fallbackImages[key] || '/places/placeholder.jpg';
  };
  
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Manejar ubicación seleccionada desde props
  useEffect(() => {
    if (propSelectedLocation && centerOnLocation) {
      setSelectedLocation(propSelectedLocation);
      setShowDetails(true);
      console.log('📍 Ubicación seleccionada desde props:', propSelectedLocation);
    }
  }, [propSelectedLocation, centerOnLocation]);
  // Estados para controlar la vista móvil
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Cargar el iframe de Google Maps después de un pequeño delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShouldRenderIframe(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderIframe(false);
    }
  }, [isOpen]);

  // Filtrar ubicaciones
  const filteredLocations = touristLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = (location.rating ?? 0) >= ratingFilter;
    const matchesCategory = categoryFilter === 'all' || location.category === categoryFilter;
    
    return matchesSearch && matchesRating && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] md:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('qrMap.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Controles móviles */}
        <div className="md:hidden w-full p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setMobileView('map')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mobileView === 'map'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
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
                  : 'bg-white text-gray-700'
              }`}
            >
              <Menu className="h-4 w-4" />
              Lista
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 flex overflow-hidden">
          {/* Mapa (a la izquierda) */}
          <div className={`${mobileView === 'map' ? 'flex' : 'hidden'} md:flex flex-1 relative border-r border-gray-200`}>
            {shouldRenderIframe ? (
              <iframe
                src={(import.meta as any).env?.VITE_MY_MAPS_URL || 'https://www.google.com/maps/d/u/0/embed?mid=168x7ai6t7Z7uG08kZIfAPtlkoYU6DGQ&ehbc=2E312F&noprof=1'}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google My Maps"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('common.loading')}</p>
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

          {/* Sidebar (a la derecha) con filtros y lista */}
          <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 flex-col`}>
            {/* Filtros */}
            <div className="p-3 md:p-4 border-b border-gray-200">
              <div className="space-y-3 md:space-y-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={t('qrMap.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                {/* Filtro de categoría */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    {t('qrMap.categoryFilter')}
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="all">{t('qrMap.allCategories')}</option>
                    <option value="historico">{categoryNames.historico}</option>
                    <option value="cultural">{categoryNames.cultural}</option>
                    <option value="recreativo">{categoryNames.recreativo}</option>
                    <option value="religioso">{categoryNames.religioso}</option>
                    <option value="natural">{categoryNames.natural}</option>
                  </select>
                </div>

                {/* Filtro de rating */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    {t('qrMap.ratingFilter')}: {ratingFilter}+ ⭐
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Lista de ubicaciones */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm md:text-base font-semibold text-gray-700">{t('qrMap.availableLocations') || 'Available Locations'}</h3>
                <button
                  onClick={() => setMobileView('map')}
                  className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 md:space-y-3">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => {
                      setSelectedLocation(location);
                      setShowDetails(true);
                    }}
                    className={`p-3 md:p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedLocation?.id === location.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
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
                          src={getThumb(location)}
                          alt={location.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/places/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate text-sm md:text-base">{location.name}</h4>
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white bg-gray-500">
                            {categoryNames[location.category as keyof typeof categoryNames] || location.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center text-yellow-600 text-xs">
                            <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span>{(location.rating ?? 4.5).toFixed(1)} {(location.reviews ? `(${location.reviews})` : '')}</span>
                          </div>
                          <span className="text-green-600 text-xs font-medium">● Open</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Modal de detalle */}
        {showDetails && selectedLocation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2 md:p-4" onClick={() => setShowDetails(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 md:p-4 border-b flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{selectedLocation.name}</h3>
                <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={getThumb(selectedLocation)}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = '/places/placeholder.jpg';
                  }}
                />
              </div>
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                {selectedLocation.address && (
                  <p className="text-xs md:text-sm text-gray-600">{selectedLocation.address}</p>
                )}
                {selectedLocation.description && (
                  <p className="text-xs md:text-sm text-gray-700">{selectedLocation.description}</p>
                )}
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <div className="flex items-center text-yellow-600">
                    <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>{(selectedLocation.rating ?? 4.5).toFixed(1)} {selectedLocation.reviews ? `(${selectedLocation.reviews})` : ''}</span>
                  </div>
                  <span className="text-green-600 font-medium">{selectedLocation.isOpen ? '● Open' : ''}</span>
                </div>
                {selectedLocation.coordinates && (
                  <a
                    href={`https://maps.google.com/?q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold text-sm md:text-base"
                  >
                    Abrir en Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleLocationMap;
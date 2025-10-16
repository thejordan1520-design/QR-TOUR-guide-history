import { destinationsService } from '../supabaseServices';

export interface Location {
  id: string;
  name: string;
  description: string;
  history: string;
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

// Función para cargar lugares desde Supabase
export const loadTouristLocations = async (): Promise<Location[]> => {
  try {
    const { data, error } = await destinationsService.getAllDestinations();
    
    if (error) {
      console.error('Error loading places from Supabase:', error);
      return getFallbackLocations();
    }
    
    // Convertir datos de Supabase al formato esperado
    return (data || []).map(place => ({
      id: place.id,
      name: place.title,
      description: place.description,
      history: place.history || '',
      coordinates: { lat: place.lat, lng: place.lng },
      category: (place.type as any) || 'cultural',
      qrCode: place.qrCode || `QR${place.id}`,
      imageUrl: place.image,
      address: place.address || '',
      rating: place.rating || 4.5,
      reviews: place.reviews || 0,
      isOpen: place.isOpen !== undefined ? place.isOpen : true,
      distance: 0
    }));
  } catch (err) {
    console.error('Error in loadTouristLocations:', err);
    return getFallbackLocations();
  }
};

// Datos de fallback en caso de que Supabase no esté disponible
const getFallbackLocations = (): Location[] => [
  { 
    id: 'parque-central', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.797645489933995, lng: -70.69338813105304 }, 
    category: 'historico', 
    qrCode: 'QR001', 
    imageUrl: '/places/ParqueCentraldePuertoPlata.jpg', 
    address: 'Av. Duarte #1', 
    rating: 4.6, 
    reviews: 1988, 
    isOpen: true 
  },
  { 
    id: 'catedralsanfelipe', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.797469, lng: -70.693785 }, 
    category: 'religioso', 
    qrCode: 'QR002', 
    imageUrl: '/places/catedralsanfelipe.jpg', 
    address: 'Calle San Felipe #1', 
    rating: 4.8, 
    reviews: 2500, 
    isOpen: true 
  },
  { 
    id: 'calle-sombrillas', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.798463, lng: -70.694334 }, 
    category: 'cultural', 
    qrCode: 'QR003', 
    imageUrl: '/places/calledelasombrillas.jpg', 
    address: 'Calle de las Sombrillas', 
    rating: 4.5, 
    reviews: 1200, 
    isOpen: true 
  },
  { 
    id: 'calle-rosada', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.798395370191646, lng: -70.69376707378993 }, 
    category: 'historico', 
    qrCode: 'QR004', 
    imageUrl: '/places/callerosada.jpg', 
    address: 'Calle Rosada #123', 
    rating: 4.7, 
    reviews: 1800, 
    isOpen: true 
  },
  { 
    id: 'calledelacometas', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.799827, lng: -70.691930 }, 
    category: 'cultural', 
    qrCode: 'QR005', 
    imageUrl: '/places/calledelacometas.jpg', 
    address: 'Calle de las Cometas Voladoras', 
    rating: 4.6, 
    reviews: 1500, 
    isOpen: true 
  },
  { 
    id: 'fortaleza-san-felipe', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.804007, lng: -70.695785 }, 
    category: 'historico', 
    qrCode: 'QR006', 
    imageUrl: '/places/fortalezasanfelipe.jpg', 
    address: 'Fortaleza San Felipe', 
    rating: 4.9, 
    reviews: 3000, 
    isOpen: true 
  },
  { 
    id: 'teleferico-puerto-plata', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.78816006748995, lng: -70.71003687720058 }, 
    category: 'recreativo', 
    qrCode: 'QR007', 
    imageUrl: '/places/teleferico.jpg', 
    address: 'Teleférico Puerto Plata', 
    rating: 4.8, 
    reviews: 2800, 
    isOpen: true 
  },
  { 
    id: 'letrero-puerto-plata', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.801396, lng: -70.692968 }, 
    category: 'cultural', 
    qrCode: 'QR008', 
    imageUrl: '/places/letreropuertoplata.jpg', 
    address: 'Malecón de Puerto Plata', 
    rating: 4.7, 
    reviews: 2200, 
    isOpen: true 
  },
  { 
    id: 'museo-ambar', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.7964711, lng: -70.6947493 }, 
    category: 'cultural', 
    qrCode: 'QR009', 
    imageUrl: '/places/museoambar.jpg', 
    address: 'Calle Duarte #61', 
    rating: 4.6, 
    reviews: 1600, 
    isOpen: true 
  },
  { 
    id: 'ronfactory', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.79450074869496, lng: -70.69874051243916 }, 
    category: 'cultural', 
    qrCode: 'QR010', 
    imageUrl: '/places/runfactory.jpg', 
    address: 'Fábrica de Ron Macorix', 
    rating: 4.5, 
    reviews: 1400, 
    isOpen: true 
  },
  { 
    id: 'larimarr', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.798900, lng: -70.694742 }, 
    category: 'cultural', 
    qrCode: 'QR011', 
    imageUrl: '/places/larimarr.jpg', 
    address: 'Calle Duarte #45', 
    rating: 4.4, 
    reviews: 1200, 
    isOpen: true 
  },
  { 
    id: 'hermanasmirabal', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.776959247040466, lng: -70.66244410798636 }, 
    category: 'historico', 
    qrCode: 'QR012', 
    imageUrl: '/places/hermanasmirabal.jpg', 
    address: 'Plaza Hermanas Mirabal', 
    rating: 4.8, 
    reviews: 1900, 
    isOpen: true 
  },
  { 
    id: 'neptuno', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.794593135681072, lng: -70.67277435916677 }, 
    category: 'cultural', 
    qrCode: 'QR013', 
    imageUrl: '/places/neptuno.jpg', 
    address: 'Malecón de Puerto Plata', 
    rating: 4.3, 
    reviews: 1100, 
    isOpen: true 
  },
  { 
    id: 'cristoredentor', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.764198, lng: -70.710392 }, 
    category: 'religioso', 
    qrCode: 'QR014', 
    imageUrl: '/places/cristoredentor.jpg', 
    address: 'Pico Isabel de Torres', 
    rating: 4.9, 
    reviews: 3200, 
    isOpen: true 
  },
  { 
    id: 'museo-gregorio-luperon', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.798172, lng: -70.691325 }, 
    category: 'historico', 
    qrCode: 'QR015', 
    imageUrl: '/places/MuseoGregorioLuperon.jpg', 
    address: 'Calle Gregorio Luperón', 
    rating: 4.5, 
    reviews: 1300, 
    isOpen: true 
  },
  { 
    id: 'ocean-world', 
    name: '', // Se maneja desde las traducciones
    description: '', // Se maneja desde las traducciones
    history: '', // Se maneja desde las traducciones
    coordinates: { lat: 19.826242818762164, lng: -70.73132746368317 }, 
    category: 'recreativo', 
    qrCode: 'QR016', 
    imageUrl: '/places/oceanworld.jpg', 
    address: 'Ocean World', 
    rating: 4.6, 
    reviews: 2100, 
    isOpen: true 
  }
];

// Mantener compatibilidad con código existente
export const touristLocations = getFallbackLocations();

// Función helper para obtener coordenadas por ID
export const getLocationCoordinates = (locationId: string) => {
  const location = touristLocations.find(loc => loc.id === locationId);
  return location ? location.coordinates : null;
};

// Función helper para obtener ubicación por ID
export const getLocationById = (locationId: string) => {
  return touristLocations.find(loc => loc.id === locationId) || null;
}; 
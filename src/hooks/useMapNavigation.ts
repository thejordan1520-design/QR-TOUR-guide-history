import { useNavigate } from 'react-router-dom';

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface LocationData {
  id: string;
  name: string;
  coordinates: LocationCoordinates;
}

// Datos de los puntos turísticos con sus coordenadas
export const touristLocations: { [key: string]: LocationData } = {
  'fortaleza-san-felipe': {
    id: 'fortaleza-san-felipe',
    name: 'Fortaleza San Felipe',
    coordinates: { lat: 19.8089, lng: -70.6947 }
  },
  'teleferico-puerto-plata': {
    id: 'teleferico',
    name: 'Teleférico Puerto Plata',
    coordinates: { lat: 19.7833, lng: -70.6833 }
  },
  'calle-sombrillas': {
    id: 'calle-sombrillas',
    name: 'Calle de las Sombrillas',
    coordinates: { lat: 19.7942, lng: -70.6920 }
  },
  'calle-rosada': {
    id: 'patio-dona-blanca',
    name: 'Patio de Doña Blanca (Calle Rosada)',
    coordinates: { lat: 19.7940, lng: -70.6915 }
  },
  'letrero-puerto-plata': {
    id: 'letrero-puerto-plata',
    name: 'Letrero Puerto Plata',
    coordinates: { lat: 19.7975, lng: -70.6885 }
  },
  'museo-ambar': {
    id: 'museo-ambar',
    name: 'Museo del Ámbar',
    coordinates: { lat: 19.7944, lng: -70.6916 }
  },
  'ronfactory': {
    id: 'ron-brugal',
    name: 'Ron Brugal',
    coordinates: { lat: 19.7833, lng: -70.6944 }
  },
  'larimarr': {
    id: 'museo-larimar',
    name: 'Museo del Larimar',
    coordinates: { lat: 19.7943, lng: -70.6917 }
  },
  'hermanasmirabal': {
    id: 'monumento-mirabal',
    name: 'Monumento Hermanas Mirabal',
    coordinates: { lat: 19.7950, lng: -70.6925 }
  },
  'neptuno': {
    id: 'neptuno-malecon',
    name: 'Neptuno en el Malecón',
    coordinates: { lat: 19.7972, lng: -70.6889 }
  },
  'catedralsanfelipe': {
    id: 'catedral',
    name: 'Catedral San Felipe',
    coordinates: { lat: 19.7945, lng: -70.6918 }
  },
  'cristoredentor': {
    id: 'cristo-redentor',
    name: 'Cristo Redentor',
    coordinates: { lat: 19.7667, lng: -70.6833 }
  },
  'calledelacometas': {
    id: 'calle-cometas',
    name: 'Calle de las Cometas Voladoras',
    coordinates: { lat: 19.7938, lng: -70.6912 }
  },
  'parque-central': {
    id: 'parque-central',
    name: 'Parque Central',
    coordinates: { lat: 19.7939, lng: -70.6914 }
  },
  'museo-gregorio-luperon': {
    id: 'museo-gregorio-luperon',
    name: 'Museo Gregorio Luperón',
    coordinates: { lat: 19.7941, lng: -70.6913 }
  }
};

export const useMapNavigation = () => {
  const navigate = useNavigate();

  const navigateToMap = (locationId: string) => {
    const location = touristLocations[locationId];
    if (location) {
      // Navegar al mapa con el punto específico seleccionado
      navigate('/mapa', { 
        state: { 
          selectedLocation: location,
          centerOnLocation: true 
        } 
      });
    }
  };

  const navigateToTour = (locationId: string) => {
    const location = touristLocations[locationId];
    if (location) {
      // Navegar al tour con el punto específico seleccionado
      navigate('/', { 
        state: { 
          showTour: true,
          selectedLocation: location,
          centerOnLocation: true 
        } 
      });
    }
  };

  return {
    navigateToMap,
    navigateToTour,
    touristLocations
  };
}; 
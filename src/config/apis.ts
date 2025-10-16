// Configuración de APIs para búsqueda de vuelos y cruceros

// AviationStack API (Vuelos)
export const AVIATION_API_CONFIG = {
  baseUrl: 'http://api.aviationstack.com/v1',
  apiKey: import.meta.env.VITE_AVIATION_API_KEY || '',
  endpoints: {
    flights: '/flights'
  }
};

// VesselFinder API (Cruceros)
export const VESSEL_API_CONFIG = {
  baseUrl: 'https://api.vesselfinder.com',
  apiKey: import.meta.env.VITE_VESSEL_API_KEY || '',
  endpoints: {
    vessels: '/vessels'
  }
};

// Tipos de datos
export interface FlightData {
  flight: {
    iata: string;
    icao: string;
  };
  departure: {
    airport: string;
    scheduled: string;
    estimated: string;
    actual: string;
    delay: number;
  };
  arrival: {
    airport: string;
    scheduled: string;
    estimated: string;
    actual: string;
    delay: number;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight_status: string;
}

export interface VesselData {
  AIS: {
    MMSI: number;
    SHIP_ID: number;
    LAT: number;
    LON: number;
    SPEED: number;
    HEADING: number;
    COURSE: number;
    STATUS: number;
    TIMESTAMP: string;
    DSRC: string;
    UTC_SECONDS: number;
  };
  LAST_PORT: {
    ID: string;
    NAME: string;
    COUNTRY: string;
    ARRIVAL: string;
    DEPARTURE: string;
  };
  NEXT_PORT: {
    ID: string;
    NAME: string;
    COUNTRY: string;
    ARRIVAL: string;
    DEPARTURE: string;
  };
  SHIPNAME: string;
  SHIPTYPE: number;
  CALLSIGN: string;
  FLAG: string;
  LENGTH: number;
  WIDTH: number;
  GRT: number;
  DWT: number;
  YEAR_BUILT: number;
}

// Funciones de utilidad para las APIs
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

export const getFlightStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'active': 'En Vuelo',
    'landed': 'Aterrizado',
    'cancelled': 'Cancelado',
    'incident': 'Incidente',
    'diverted': 'Desviado',
    'scheduled': 'Programado'
  };
  
  return statusMap[status] || status;
}; 
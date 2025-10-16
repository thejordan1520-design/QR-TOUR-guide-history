import { AVIATION_API_CONFIG, VESSEL_API_CONFIG, FlightData, VesselData, formatTime, getFlightStatus } from '../config/apis';

// Interfaz para el resultado de búsqueda
export interface SearchResult {
  type: 'flight' | 'cruise';
  identifier: string;
  departureTime: string;
  status: string;
  additionalInfo?: {
    airline?: string;
    destination?: string;
    shipName?: string;
    port?: string;
  };
}

// Servicio para búsqueda de vuelos
export const searchFlight = async (flightNumber: string): Promise<SearchResult | null> => {
  try {
    // Verificar si tenemos API key
    if (!AVIATION_API_CONFIG.apiKey || AVIATION_API_CONFIG.apiKey === 'tu_api_key_de_aviationstack_aquí') {
      console.warn('No AviationStack API key configured, using mock data');
      return searchFlightMock(flightNumber);
    }

    // Limpiar el número de vuelo (remover espacios y convertir a mayúsculas)
    const cleanFlightNumber = flightNumber.trim().toUpperCase();
    
    const url = `${AVIATION_API_CONFIG.baseUrl}${AVIATION_API_CONFIG.endpoints.flights}?access_key=${AVIATION_API_CONFIG.apiKey}&flight_iata=${cleanFlightNumber}`;
    
    console.log('🔍 Buscando vuelo:', cleanFlightNumber);
    console.log('🌐 URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📡 Respuesta de API:', data);
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }
    
    if (data.data && data.data.length > 0) {
      const flight: FlightData = data.data[0];
      
      const result = {
        type: 'flight' as const,
        identifier: flight.flight.iata || flight.flight.icao,
        departureTime: formatTime(flight.departure.scheduled),
        status: getFlightStatus(flight.flight_status),
        additionalInfo: {
          airline: flight.airline.name,
          destination: flight.arrival.airport
        }
      };
      
      console.log('✅ Vuelo encontrado:', result);
      return result;
    }
    
    console.log('❌ No se encontró el vuelo');
    return null;
    
  } catch (error) {
    console.error('❌ Error searching flight:', error);
    // Fallback a datos simulados
    return searchFlightMock(flightNumber);
  }
};

// Servicio para búsqueda de cruceros
export const searchCruise = async (shipName: string): Promise<SearchResult | null> => {
  try {
    // Verificar si tenemos API key
    if (!VESSEL_API_CONFIG.apiKey || VESSEL_API_CONFIG.apiKey === 'tu_api_key_de_vesselfinder_aquí') {
      console.warn('No VesselFinder API key configured, using mock data');
      return searchCruiseMock(shipName);
    }

    // Limpiar el nombre del barco
    const cleanShipName = shipName.trim();
    
    const url = `${VESSEL_API_CONFIG.baseUrl}${VESSEL_API_CONFIG.endpoints.vessels}?api_key=${VESSEL_API_CONFIG.apiKey}&name=${encodeURIComponent(cleanShipName)}`;
    
    console.log('🛳️ Buscando crucero:', cleanShipName);
    console.log('🌐 URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📡 Respuesta de API:', data);
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }
    
    if (data.vessels && data.vessels.length > 0) {
      const vessel: VesselData = data.vessels[0];
      
      const result = {
        type: 'cruise' as const,
        identifier: vessel.SHIPNAME,
        departureTime: formatTime(vessel.LAST_PORT.DEPARTURE),
        status: 'En Puerto',
        additionalInfo: {
          shipName: vessel.SHIPNAME,
          port: vessel.LAST_PORT.NAME
        }
      };
      
      console.log('✅ Crucero encontrado:', result);
      return result;
    }
    
    console.log('❌ No se encontró el crucero');
    return null;
    
  } catch (error) {
    console.error('❌ Error searching cruise:', error);
    // Fallback a datos simulados
    return searchCruiseMock(shipName);
  }
};

// Datos simulados para vuelos (fallback)
const searchFlightMock = (flightNumber: string): SearchResult | null => {
  const mockDatabase = {
    'AA1234': { departureTime: '17:30', status: 'Programado', airline: 'American Airlines', destination: 'Miami' },
    'DL5678': { departureTime: '19:45', status: 'Programado', airline: 'Delta Airlines', destination: 'Atlanta' },
    'UA9012': { departureTime: '16:20', status: 'Retrasado', airline: 'United Airlines', destination: 'Chicago' },
    'BA3456': { departureTime: '20:15', status: 'Programado', airline: 'British Airways', destination: 'London' },
    'IB7890': { departureTime: '18:30', status: 'Programado', airline: 'Iberia', destination: 'Madrid' }
  };

  const result = mockDatabase[flightNumber.toUpperCase() as keyof typeof mockDatabase];
  
  if (result) {
    return {
      type: 'flight',
      identifier: flightNumber.toUpperCase(),
      departureTime: result.departureTime,
      status: result.status,
      additionalInfo: {
        airline: result.airline,
        destination: result.destination
      }
    };
  }
  
  return null;
};

// Datos simulados para cruceros (fallback)
const searchCruiseMock = (shipName: string): SearchResult | null => {
  const mockDatabase = {
    'Norwegian Sky': { departureTime: '18:15', status: 'En Puerto', port: 'Puerto Plata' },
    'Royal Caribbean': { departureTime: '17:00', status: 'En Puerto', port: 'Puerto Plata' },
    'Carnival Magic': { departureTime: '19:30', status: 'En Puerto', port: 'Puerto Plata' },
    'MSC Divina': { departureTime: '16:45', status: 'En Puerto', port: 'Puerto Plata' },
    'Celebrity Edge': { departureTime: '20:00', status: 'En Puerto', port: 'Puerto Plata' }
  };

  const result = mockDatabase[shipName as keyof typeof mockDatabase];
  
  if (result) {
    return {
      type: 'cruise',
      identifier: shipName,
      departureTime: result.departureTime,
      status: result.status,
      additionalInfo: {
        shipName: shipName,
        port: result.port
      }
    };
  }
  
  return null;
};

// Función para verificar si las APIs están disponibles
export const checkAPIAvailability = () => {
  const aviationKey = AVIATION_API_CONFIG.apiKey && AVIATION_API_CONFIG.apiKey !== 'tu_api_key_de_aviationstack_aquí';
  const vesselKey = VESSEL_API_CONFIG.apiKey && VESSEL_API_CONFIG.apiKey !== 'tu_api_key_de_vesselfinder_aquí';
  
  return {
    aviation: aviationKey,
    vessel: vesselKey
  };
};

// Función para mostrar el estado de las APIs en la consola
export const logAPIStatus = () => {
  const status = checkAPIAvailability();
  
  console.log('🔧 Estado de las APIs:');
  console.log('✈️ AviationStack (Vuelos):', status.aviation ? '✅ Configurada' : '❌ No configurada');
  console.log('🛳️ VesselFinder (Cruceros):', status.vessel ? '✅ Configurada' : '❌ No configurada');
  
  if (!status.aviation) {
    console.log('💡 Para configurar AviationStack:');
    console.log('   1. Ve a: https://aviationstack.com/');
    console.log('   2. Registra cuenta gratuita');
    console.log('   3. Obtén API key');
    console.log('   4. Agrega VITE_AVIATION_API_KEY=tu_key en .env');
  }
  
  if (!status.vessel) {
    console.log('💡 Para configurar VesselFinder:');
    console.log('   1. Ve a: https://www.vesselfinder.com/api');
    console.log('   2. Registra cuenta gratuita');
    console.log('   3. Obtén API key');
    console.log('   4. Agrega VITE_VESSEL_API_KEY=tu_key en .env');
  }
}; 
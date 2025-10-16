import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapTest: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const testMap = async () => {
      try {
        if (!isMounted) return;
        
        setIsLoading(true);
        setError(null);

        console.log('🔍 Iniciando prueba de Google Maps...');
        console.log('🔑 API Key presente:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
        console.log('🔑 API Key valor:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...');

        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        console.log('📦 Cargando Google Maps...');
        const google = await loader.load();
        console.log('✅ Google Maps cargado exitosamente');

        if (!isMounted || !mapRef.current) {
          throw new Error('Elemento del mapa no encontrado');
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 19.797, lng: -70.688 }, // Puerto Plata
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        console.log('🗺️ Mapa creado exitosamente');
        
        if (isMounted) {
          setMapLoaded(true);
        }

        // Agregar un marcador de prueba
        new google.maps.Marker({
          position: { lat: 19.797, lng: -70.688 },
          map: map,
          title: 'Puerto Plata - Prueba'
        });

        console.log('📍 Marcador de prueba agregado');

      } catch (err) {
        console.error('❌ Error en prueba de mapa:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    testMap();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Prueba de Google Maps</h2>
      
      <div className="mb-4">
        <p><strong>Estado:</strong> {isLoading ? '🔄 Cargando...' : mapLoaded ? '✅ Cargado' : '❌ Error'}</p>
        <p><strong>API Key:</strong> {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Presente' : '❌ Faltante'}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>

      <div 
        ref={mapRef} 
        className="w-full h-96 border-2 border-gray-300 rounded-lg"
        style={{ minHeight: '400px' }}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando mapa...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p>❌ Error al cargar el mapa</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Información de depuración:</h3>
        <ul className="text-sm space-y-1">
          <li>• API Key configurada: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Sí' : 'No'}</li>
          <li>• Elemento del mapa: {mapRef.current ? 'Encontrado' : 'No encontrado'}</li>
          <li>• Estado de carga: {isLoading ? 'Cargando' : mapLoaded ? 'Completado' : 'Error'}</li>
          <li>• Error: {error || 'Ninguno'}</li>
        </ul>
      </div>
    </div>
  );
};

export default MapTest; 
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const WorkingMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Iniciando mapa...');

  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      try {
        setStatus('loading');
        setMessage('Verificando API Key...');

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('API Key de Google Maps no encontrada');
        }

        setMessage('Cargando Google Maps...');

        // Función de inicialización global
        window.initMap = () => {
          if (!isMounted || !mapRef.current) return;

          try {
            const map = new window.google.maps.Map(mapRef.current, {
              center: { lat: 19.797, lng: -70.688 }, // Puerto Plata
              zoom: 13,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true
            });

            // Agregar marcador
            new window.google.maps.Marker({
              position: { lat: 19.797, lng: -70.688 },
              map: map,
              title: 'Puerto Plata'
            });

            if (isMounted) {
              setStatus('success');
              setMessage('¡Mapa cargado exitosamente!');
            }
          } catch (error) {
            if (isMounted) {
              setStatus('error');
              setMessage('Error al crear el mapa: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            }
          }
        };

        // Crear script de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) {
            setStatus('error');
            setMessage('Error al cargar Google Maps API');
          }
        };

        document.head.appendChild(script);

      } catch (error) {
        if (isMounted) {
          console.error('Error en WorkingMap:', error);
          setStatus('error');
          setMessage(error instanceof Error ? error.message : 'Error desconocido');
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      // Limpiar script si existe
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🗺️ Mapa Funcional de Google Maps</h1>
      
      <div className="mb-6">
        <div className={`p-4 rounded-lg border-2 ${
          status === 'loading' ? 'border-yellow-500 bg-yellow-50' :
          status === 'success' ? 'border-green-500 bg-green-50' :
          'border-red-500 bg-red-50'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'loading' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>}
            {status === 'success' && <span className="text-green-600">✅</span>}
            {status === 'error' && <span className="text-red-600">❌</span>}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Información de Configuración:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm"><strong>API Key:</strong> {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada'}</p>
            <p className="text-xs text-gray-600">
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
                `Valor: ${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 
                'No encontrada en variables de entorno'
              }
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm"><strong>Método:</strong> ✅ API Directa</p>
            <p className="text-xs text-gray-600">Sin dependencias externas</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Mapa de Puerto Plata:</h2>
        <div 
          ref={mapRef} 
          className="w-full h-96 border-2 border-gray-300 rounded-lg"
          style={{ minHeight: '400px' }}
        >
          {status === 'loading' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mapa de Puerto Plata...</p>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium mb-2">❌ Error al cargar el mapa</p>
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Recargar
        </button>
        <button
          onClick={() => window.open('/', '_blank')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🏠 Ir al Inicio
        </button>
      </div>
    </div>
  );
};

export default WorkingMap; 
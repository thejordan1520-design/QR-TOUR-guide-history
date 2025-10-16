import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useLocation } from 'react-router-dom';

mapboxgl.accessToken = 'TU_MAPBOX_ACCESS_TOKEN'; // Reemplaza por el real en producción

const DESTINATIONS = {
  hotel: { lat: 19.7939, lng: -70.6914, label: 'Hotel' },
  airbnb: { lat: 19.795, lng: -70.690, label: 'Airbnb' },
  'amber-cove': { lat: 19.822, lng: -70.687, label: 'Carnival Amber Cove' },
  'taino-bay': { lat: 19.802, lng: -70.703, label: 'Taino Bay Puerto Plata' },
};

const NavigationPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Obtener destino de la query
  const params = new URLSearchParams(location.search);
  const destinationKey = params.get('destination') || 'hotel';
  const destination = DESTINATIONS[destinationKey as keyof typeof DESTINATIONS];

  useEffect(() => {
    if (!mapContainer.current || !destination) return;
    if (map.current) return;
    // Obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(userLoc);
          // Inicializar mapa
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [userLoc.lng, userLoc.lat],
            zoom: 13,
          });
          // Marker usuario
          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([userLoc.lng, userLoc.lat])
            .setPopup(new mapboxgl.Popup().setText('Tu ubicación actual'))
            .addTo(map.current);
          // Marker destino
          new mapboxgl.Marker({ color: 'red' })
            .setLngLat([destination.lng, destination.lat])
            .setPopup(new mapboxgl.Popup().setText(destination.label))
            .addTo(map.current);
          // Dibujar ruta (línea recta por ahora)
          map.current.on('load', () => {
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [userLoc.lng, userLoc.lat],
                    [destination.lng, destination.lat],
                  ],
                },
              },
            });
            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#3b82f6', 'line-width': 5 },
            });
          });
        },
        () => setError('No se pudo obtener tu ubicación actual.')
      );
    } else {
      setError('Geolocalización no soportada.');
    }
  }, [destination]);

  // Construir enlaces para Google Maps y Apple Maps
  let googleMapsUrl = '';
  let appleMapsUrl = '';
  if (userLocation && destination) {
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    appleMapsUrl = `http://maps.apple.com/?saddr=${userLocation.lat},${userLocation.lng}&daddr=${destination.lat},${destination.lng}`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Navegación hacia: {destination?.label || 'Destino'}</h1>
      {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
      <div ref={mapContainer} className="w-full max-w-2xl h-[60vh] rounded-2xl shadow-xl border-2 border-blue-200" />
      <div className="mt-4 text-gray-700 text-sm">La ruta es una referencia visual. Para navegación paso a paso, abre Google Maps o Apple Maps.</div>
      {userLocation && destination && (
        <div className="flex gap-4 mt-4">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition"
          >
            Abrir en Google Maps
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold shadow transition"
          >
            Abrir en Apple Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default NavigationPage; 
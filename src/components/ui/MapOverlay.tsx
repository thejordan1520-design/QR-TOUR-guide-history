import React, { useRef, useEffect, useState } from 'react';
import { useLocationMap } from '../../hooks/useLocationMap';

const MapOverlay: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [tourActive, setTourActive] = useState(false);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const animationRef = useRef<number | null>(null);
  
  // Usar el hook optimizado para cargar datos de ubicaciones QR
  const { qrLocations } = useLocationMap();

  useEffect(() => {
    let map: any;
    let maplibregl: any;
    const markers: any[] = [];

    import('maplibre-gl').then((lib) => {
      maplibregl = lib.default;
      map = new maplibregl.Map({
        container: mapContainer.current!,
        style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
        center: [-70.69, 19.79],
        zoom: 10.5,
        pitch: 60,
        bearing: -20,
        antialias: true,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl());
      // Agregar marcadores
      qrLocations.forEach((loc) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.background = 'red';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.title = loc.name;
        el.onclick = () => setPopupInfo(loc);
        const marker = new maplibregl.Marker(el)
          .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
          .addTo(map);
        markers.push(marker);
      });
    });
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mapRef.current) mapRef.current.remove();
    };
     
  }, []);

  useEffect(() => {
    if (tourActive && mapRef.current) {
      animationRef.current = requestAnimationFrame(function animate() {
        if (!tourActive) return;
        const map = mapRef.current;
        const center = map.getCenter();
        const bearing = map.getBearing() + 0.2;
        const lng = center.lng + 0.0005 * Math.cos(bearing / 50);
        const lat = center.lat + 0.0002 * Math.sin(bearing / 80);
        map.flyTo({ center: [lng, lat], bearing, pitch: 60, speed: 0.5, essential: true });
        animationRef.current = requestAnimationFrame(animate);
      });
    } else if (!tourActive && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [tourActive]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-0 relative flex flex-col items-center border border-gray-100 animate-fade-in overflow-hidden">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={onClose} aria-label="Cerrar">×</button>
        <div ref={mapContainer} className="w-full h-[500px]" style={{ minHeight: 400 }} />
        {popupInfo && (
          <div className="fixed left-1/2 top-1/2 z-50" style={{ transform: 'translate(-50%, -60%)' }}>
            <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-sm w-full border border-gray-200 flex flex-col items-center overflow-hidden">
              <img src={popupInfo.imageUrl} alt={popupInfo.name} className="w-full h-40 object-cover" />
              <div className="p-4 w-full flex flex-col items-center">
                <h3 className="text-xl font-bold mb-1 text-center">{popupInfo.name}</h3>
                <p className="text-gray-500 text-sm mb-1 text-center">{popupInfo.address}</p>
                <div className="flex items-center gap-2 mb-1">
                  {popupInfo.rating && (
                    <span className="text-yellow-500 font-bold">★ {popupInfo.rating}</span>
                  )}
                  {popupInfo.reviews && (
                    <span className="text-gray-500 text-xs">({popupInfo.reviews} reseñas)</span>
                  )}
                  {popupInfo.isOpen !== undefined && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${popupInfo.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{popupInfo.isOpen ? 'Abierto' : 'Cerrado'}</span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-3 text-center">{popupInfo.description}</p>
                <div className="flex gap-2 w-full justify-center">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
                    onClick={() => {
                      setPopupInfo(null);
                      if (mapRef.current) {
                        mapRef.current.flyTo({
                          center: [popupInfo.coordinates.lng, popupInfo.coordinates.lat],
                          zoom: 16,
                          pitch: 60,
                          bearing: -20,
                          speed: 0.8,
                          essential: true
                        });
                        setTourActive(true);
                      }
                    }}
                  >
                    Iniciar recorrido
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold shadow hover:bg-gray-300 transition"
                    onClick={() => setShowDetails(true)}
                  >
                    Detalles
                  </button>
                </div>
              </div>
            </div>
            {showDetails && (
              <div className="fixed left-1/2 top-1/2 z-50" style={{ transform: 'translate(-50%, -60%)' }}>
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-2 text-center">Detalles de {popupInfo.name}</h2>
                  <img src={popupInfo.imageUrl} alt={popupInfo.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                  <p className="text-gray-700 text-base mb-2 text-center">{popupInfo.description}</p>
                  <p className="text-gray-500 text-sm mb-2 text-center">Dirección: {popupInfo.address}</p>
                  <p className="text-gray-500 text-sm mb-2 text-center">Categoría: {popupInfo.category}</p>
                  <p className="text-gray-500 text-sm mb-2 text-center">Código QR: {popupInfo.qrCode}</p>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition" onClick={() => setShowDetails(false)}>Cerrar detalles</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 my-6">
          <button
            className={`px-6 py-2 rounded-full font-bold text-white ${tourActive ? 'bg-red-600' : 'bg-green-600'} shadow-lg hover:brightness-110 transition`}
            onClick={() => setTourActive(!tourActive)}
          >
            {tourActive ? 'Detener tour' : 'Iniciar tour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapOverlay; 
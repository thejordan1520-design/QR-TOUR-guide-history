
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import GoogleMapWrapper from '../../components/ui/GoogleMapWrapper';

interface HistoryLocation {
  place: string;
  datetime: string;
  lat: number;
  lon: number;
}

const ProfileMap: React.FC = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        
        // Intentar cargar desde Supabase primero
        const { scansService } = await import('../../supabaseServices');
        const { data: scans, error } = await scansService.getAllScans();
        
        if (!error && scans) {
          // Convertir escaneos a formato de historial
          const historyData = scans.map(scan => ({
            place: `Lugar ${scan.qr_code_id}`,
            datetime: new Date(scan.scan_date).toISOString().replace('T', ' ').substring(0, 16),
            lat: scan.location_lat || 19.7939,
            lon: scan.location_lng || -70.6914
          }));
          setHistory(historyData);
          setIsLoading(false);
          return;
        }
        
        // Fallback a API local
        const response = await axios.get<HistoryLocation[]>('/api/user/qr-history', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching QR history:', error);
        // Datos de ejemplo para demostración
        setHistory([
          { place: 'Parque Central', datetime: '2024-01-15 10:30', lat: 19.7939, lon: -70.6914 },
          { place: 'Catedral San Felipe', datetime: '2024-01-15 11:15', lat: 19.7945, lon: -70.6918 },
          { place: 'Fortaleza San Felipe', datetime: '2024-01-15 14:20', lat: 19.8089, lon: -70.6947 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  // Convertir historial a formato de ubicaciones para Google Maps
  const historyLocations = history.map((item, index) => ({
    id: `history-${index}`,
    name: item.place,
    description: `Visitado el ${new Date(item.datetime).toLocaleDateString()} a las ${new Date(item.datetime).toLocaleTimeString()}`,
    coordinates: { lat: item.lat, lng: item.lon },
    category: 'historico' as const,
    qrCode: `QR-${index + 1}`,
    imageUrl: '/places/default.jpg',
    address: item.place,
    rating: 5,
    reviews: 1,
    isOpen: true,
  }));

  // Centrar el mapa en el primer lugar escaneado o en una ubicación por defecto
  const center = history.length > 0 
    ? { lat: history[0].lat, lng: history[0].lon }
    : { lat: 19.797, lng: -70.688 };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Mapa de Lugares Escaneados</h2>
        <div className="w-full h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Mapa de Lugares Escaneados</h2>
      <div className="w-full h-96 rounded-xl overflow-hidden">
        <GoogleMapWrapper
          locations={historyLocations}
          center={center}
          zoom={13}
          showUserLocation={false}
          showDirections={false}
          className="w-full h-full"
        />
      </div>
      
      {history.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Historial de Visitas</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.place}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item.datetime).toLocaleDateString()} - {new Date(item.datetime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
          <p>No hay lugares escaneados aún.</p>
          <p className="text-sm">¡Comienza a explorar Puerto Plata!</p>
        </div>
      )}
    </div>
  );
};

export default ProfileMap;

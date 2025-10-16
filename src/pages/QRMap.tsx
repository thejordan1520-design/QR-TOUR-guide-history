import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GoogleLocationMap from '../components/ui/GoogleLocationMap';

interface LocationState {
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

const QRMap: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [centerOnLocation, setCenterOnLocation] = useState(false);

  // Obtener la ubicación seleccionada desde el estado de navegación
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.selectedLocation) {
      setSelectedLocation(state.selectedLocation);
      setCenterOnLocation(state.centerOnLocation || false);
    }
  }, [location.state]);

  // Al cerrar el mapa, redirige a la página principal
  const handleClose = () => navigate('/');

  return (
    <div className="min-h-screen bg-white">
      <GoogleLocationMap 
        isOpen={true} 
        onClose={handleClose}
        selectedLocation={selectedLocation}
        centerOnLocation={centerOnLocation}
      />
    </div>
  );
};

export default QRMap;

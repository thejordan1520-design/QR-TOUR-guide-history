import React, { useState, useEffect } from 'react';

interface QrMapProps {
  className?: string;
  style?: React.CSSProperties;
  isVisible?: boolean;
}

const QrMap: React.FC<QrMapProps> = ({ className = '', style = {}, isVisible = true }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);

  // Solo renderizar el iframe cuando el modal esté visible
  useEffect(() => {
    if (isVisible) {
      setShouldRenderIframe(true);
      setIsLoaded(false); // Resetear estado de carga
    } else {
      setShouldRenderIframe(false);
      setIsLoaded(false);
    }
  }, [isVisible]);

  const handleMapLoad = () => {
    setIsLoaded(true);
  };

  const handleMapError = () => {
    console.error('Error al cargar el mapa de códigos QR');
    setIsLoaded(true); // Ocultar loading en caso de error
  };

  return (
    <div 
      className={`relative ${className}`} 
      style={{ minHeight: '600px', height: '100%', ...style }}
      id="qr-map-container"
    >
      {/* Renderizar iframe solo cuando el modal esté abierto */}
      {shouldRenderIframe && (
        <iframe 
          id="qr-google-map-iframe"
          src="https://www.google.com/maps/d/u/0/embed?mid=168x7ai6t7Z7uG08kZIfAPtlkoYU6DGQ&ehbc=2E312F&noprof=1" 
          width="100%" 
          height="100%" 
          style={{ 
            border: 0,
            minHeight: '600px',
            height: '100%',
            display: 'block'
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa de Puerto Plata - Lugares Turísticos"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={handleMapLoad}
          onError={handleMapError}
        />
      )}
      
      {/* Indicador de carga independiente */}
      {shouldRenderIframe && !isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10" 
          id="qr-map-loading"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando mapa…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrMap;

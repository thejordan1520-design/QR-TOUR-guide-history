import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Advertisement } from '../hooks/useAdvertising';

interface AdvertisementBannerProps {
  advertisement: Advertisement;
  isVisible: boolean;
  onClose: () => void;
  onClick: () => void;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  advertisement,
  isVisible,
  onClose,
  onClick
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4">
          {/* Contenido del anuncio */}
          <div 
            className="flex items-start sm:items-center space-x-2 sm:space-x-4 flex-1 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              console.log('🖱️ Click en anuncio detectado:', advertisement.title);
              e.preventDefault();
              e.stopPropagation();
              onClick();
            }}
            onMouseDown={(e) => {
              console.log('🖱️ MouseDown en anuncio:', advertisement.title);
            }}
            onMouseUp={(e) => {
              console.log('🖱️ MouseUp en anuncio:', advertisement.title);
            }}
          >
            {/* Imagen del anuncio */}
            {advertisement.image_url && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={advertisement.image_url} 
                  alt={advertisement.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Texto del anuncio */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="font-black text-sm sm:text-lg md:text-xl leading-tight sm:leading-normal text-white drop-shadow-sm">
                <span className="block sm:truncate">
                  {advertisement.title}
                </span>
              </h3>
              {advertisement.description && (
                <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-tight sm:leading-normal opacity-90">
                  <span className="block sm:truncate">
                    {advertisement.description}
                  </span>
                </p>
              )}
            </div>
            
            {/* Indicador de enlace externo */}
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 opacity-70 mt-0.5 sm:mt-0" />
          </div>
          
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors flex-shrink-0"
            aria-label="Cerrar anuncio"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="h-1 bg-white bg-opacity-20">
        <div 
          className="h-full bg-white bg-opacity-60 transition-all duration-1000 ease-linear"
          style={{
            width: '100%',
            animation: `shrink ${advertisement.display_duration}s linear forwards`
          }}
        />
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default AdvertisementBanner;




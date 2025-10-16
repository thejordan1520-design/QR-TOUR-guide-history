import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { setCookie, getCookie } from '../../utils/cookies';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Mostrar solo si no se ha dado consentimiento
    const consent = getCookie('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie('cookie_consent', 'accepted', { expires: 365 }); // 1 año
    setCookie('analytics_cookies', 'true', { expires: 365 });
    setCookie('preference_cookies', 'true', { expires: 365 });
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    setCookie('cookie_consent', 'declined', { expires: 365 });
    setCookie('analytics_cookies', 'false', { expires: 365 });
    setCookie('preference_cookies', 'false', { expires: 365 });
    setIsVisible(false);
    onDecline?.();
  };

  const handleAcceptEssential = () => {
    setCookie('cookie_consent', 'essential_only', { expires: 365 });
    setCookie('analytics_cookies', 'false', { expires: 365 });
    setCookie('preference_cookies', 'false', { expires: 365 });
    setIsVisible(false);
    onAccept?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🍪 Usamos cookies para mejorar tu experiencia
              </h3>
              
              <p className="text-gray-600 mb-4">
                Utilizamos cookies para recordar tus preferencias, analizar el tráfico del sitio 
                y personalizar el contenido. Puedes elegir qué tipos de cookies aceptar.
              </p>

              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-gray-50 rounded-lg p-4 mb-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Tipos de cookies que utilizamos:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Esenciales:</strong> Necesarias para el funcionamiento básico del sitio
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Preferencias:</strong> Recuerdan tu idioma, tema y configuraciones
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Cookie className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Analíticas:</strong> Nos ayudan a mejorar el sitio (anónimas)
                      </div>
                    </li>
                  </ul>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Aceptar todas
                </button>
                
                <button
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Solo esenciales
                </button>
                

                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                >
                  {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>
            </div>


          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent; 
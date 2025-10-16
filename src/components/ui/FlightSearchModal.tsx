import React, { useState, useEffect } from 'react';
import { X, Search, Plane, Ship } from 'lucide-react';
import { searchFlight, searchCruise, SearchResult, logAPIStatus } from '../../services/flightService';

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
}



const FlightSearchModal: React.FC<FlightSearchModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [searchType, setSearchType] = useState<'flight' | 'cruise'>('flight');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');

  // Verificar estado de APIs al abrir el modal
  useEffect(() => {
    if (isOpen) {
      logAPIStatus();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Por favor ingresa un número de vuelo o nombre de crucero');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      const query = searchQuery.trim();
      let result: SearchResult | null = null;

      if (searchType === 'flight') {
        result = await searchFlight(query);
      } else {
        result = await searchCruise(query);
      }

      if (result) {
        setSearchResult(result);
      } else {
        setError(`No se encontró ${searchType === 'flight' ? 'el vuelo' : 'el crucero'} "${query}". Verifica el número o nombre.`);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setError('Error al buscar. Por favor intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (searchResult) {
      onConfirm(searchResult.departureTime);
      onClose();
      // Resetear el estado
      setSearchQuery('');
      setSearchResult(null);
      setError('');
    }
  };

  const handleClose = () => {
    onClose();
    // Resetear el estado
    setSearchQuery('');
    setSearchResult(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            🔍 Buscar mi vuelo o crucero
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo de búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de transporte
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setSearchType('flight')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  searchType === 'flight'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Plane className="h-5 w-5" />
                <span className="font-medium">✈️ Vuelo</span>
              </button>
              <button
                onClick={() => setSearchType('cruise')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  searchType === 'cruise'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Ship className="h-5 w-5" />
                <span className="font-medium">🛳️ Crucero</span>
              </button>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {searchType === 'flight' ? 'Número de vuelo' : 'Nombre del crucero'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchType === 'flight' 
                    ? 'Ej: AA1234, DL5678' 
                    : 'Ej: Norwegian Sky, Royal Caribbean'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Estado de búsqueda */}
          {isSearching && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">
                Buscando {searchType === 'flight' ? 'el vuelo' : 'el crucero'}...
              </p>
            </div>
          )}

          {/* Resultado de búsqueda */}
          {searchResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {searchResult.type === 'flight' ? (
                  <Plane className="h-6 w-6 text-green-600" />
                ) : (
                  <Ship className="h-6 w-6 text-green-600" />
                )}
                <div>
                  <h3 className="font-semibold text-green-800">
                    {searchResult.identifier}
                  </h3>
                  <p className="text-sm text-green-600">
                    {searchResult.type === 'flight' ? 'Vuelo encontrado' : 'Crucero encontrado'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hora de partida:</span>
                  <span className="font-semibold text-green-800">
                    {searchResult.departureTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className={`text-sm font-medium ${
                    searchResult.status === 'Programado' || searchResult.status === 'En Puerto' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {searchResult.status}
                  </span>
                </div>
                {searchResult.additionalInfo?.airline && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Aerolínea:</span>
                    <span className="text-sm font-medium text-green-800">
                      {searchResult.additionalInfo.airline}
                    </span>
                  </div>
                )}
                {searchResult.additionalInfo?.destination && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Destino:</span>
                    <span className="text-sm font-medium text-green-800">
                      {searchResult.additionalInfo.destination}
                    </span>
                  </div>
                )}
                {searchResult.additionalInfo?.port && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Puerto:</span>
                    <span className="text-sm font-medium text-green-800">
                      {searchResult.additionalInfo.port}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Confirmar y configurar alarma
              </button>
            </div>
          )}

          {/* Ejemplos de búsqueda */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Ejemplos para probar:
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {searchType === 'flight' ? (
                <>
                  <p>• <strong>AA1234</strong> → 17:30</p>
                  <p>• <strong>DL5678</strong> → 19:45</p>
                  <p>• <strong>UA9012</strong> → 16:20</p>
                </>
              ) : (
                <>
                  <p>• <strong>Norwegian Sky</strong> → 18:15</p>
                  <p>• <strong>Royal Caribbean</strong> → 17:00</p>
                  <p>• <strong>Carnival Magic</strong> → 19:30</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchModal; 
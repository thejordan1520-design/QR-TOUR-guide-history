import React, { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<{
    apiKeyPresent: boolean;
    apiKeyValue: string;
    loaderAvailable: boolean;
    googleAvailable: boolean;
    mapCreated: boolean;
    errors: string[];
  }>({
    apiKeyPresent: false,
    apiKeyValue: '',
    loaderAvailable: false,
    googleAvailable: false,
    mapCreated: false,
    errors: []
  });

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      const newDiagnostics = {
        apiKeyPresent: false,
        apiKeyValue: '',
        loaderAvailable: false,
        googleAvailable: false,
        mapCreated: false,
        errors: [] as string[]
      };

      try {
        // Test 1: Verificar API Key
        addTestResult('🔍 Verificando API Key...');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        newDiagnostics.apiKeyPresent = !!apiKey;
        newDiagnostics.apiKeyValue = apiKey ? `${apiKey.substring(0, 10)}...` : 'No encontrada';
        addTestResult(`API Key: ${newDiagnostics.apiKeyPresent ? '✅ Presente' : '❌ Faltante'}`);

        // Test 2: Verificar Loader
        addTestResult('📦 Verificando Google Maps Loader...');
        newDiagnostics.loaderAvailable = typeof Loader !== 'undefined';
        addTestResult(`Loader: ${newDiagnostics.loaderAvailable ? '✅ Disponible' : '❌ No disponible'}`);

        if (!newDiagnostics.loaderAvailable) {
          throw new Error('Google Maps Loader no está disponible');
        }

        // Test 3: Intentar cargar Google Maps
        addTestResult('🌐 Intentando cargar Google Maps...');
        const loader = new Loader({
          apiKey: apiKey || '',
          version: 'weekly',
          libraries: ['places']
        });

        try {
          const google = await loader.load();
          newDiagnostics.googleAvailable = !!google;
          addTestResult(`Google Maps: ${newDiagnostics.googleAvailable ? '✅ Cargado' : '❌ Error al cargar'}`);

          if (newDiagnostics.googleAvailable) {
            // Test 4: Intentar crear un mapa
            addTestResult('🗺️ Intentando crear mapa...');
            const testDiv = document.createElement('div');
            testDiv.style.width = '100px';
            testDiv.style.height = '100px';
            testDiv.style.position = 'absolute';
            testDiv.style.left = '-9999px';
            document.body.appendChild(testDiv);

            const map = new google.maps.Map(testDiv, {
              center: { lat: 19.797, lng: -70.688 },
              zoom: 13
            });

            newDiagnostics.mapCreated = !!map;
            addTestResult(`Mapa creado: ${newDiagnostics.mapCreated ? '✅ Exitoso' : '❌ Falló'}`);

                         // Limpiar de forma segura
             if (document.body.contains(testDiv)) {
               document.body.removeChild(testDiv);
             }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
          newDiagnostics.errors.push(`Error al cargar Google Maps: ${errorMsg}`);
          addTestResult(`❌ Error: ${errorMsg}`);
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        newDiagnostics.errors.push(errorMsg);
        addTestResult(`❌ Error general: ${errorMsg}`);
      }

      setDiagnostics(newDiagnostics);
      addTestResult('🏁 Diagnóstico completado');
    };

    runDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Diagnóstico de Google Maps</h1>
      
      {/* Resumen de estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border-2 ${diagnostics.apiKeyPresent ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <h3 className="font-bold mb-2">API Key</h3>
          <p className="text-sm">{diagnostics.apiKeyPresent ? '✅ Presente' : '❌ Faltante'}</p>
          <p className="text-xs text-gray-600">{diagnostics.apiKeyValue}</p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${diagnostics.loaderAvailable ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <h3 className="font-bold mb-2">Loader</h3>
          <p className="text-sm">{diagnostics.loaderAvailable ? '✅ Disponible' : '❌ No disponible'}</p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${diagnostics.googleAvailable ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <h3 className="font-bold mb-2">Google Maps</h3>
          <p className="text-sm">{diagnostics.googleAvailable ? '✅ Cargado' : '❌ Error'}</p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${diagnostics.mapCreated ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <h3 className="font-bold mb-2">Mapa</h3>
          <p className="text-sm">{diagnostics.mapCreated ? '✅ Creado' : '❌ Falló'}</p>
        </div>
      </div>

      {/* Errores */}
      {diagnostics.errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">❌ Errores Encontrados:</h3>
          <ul className="list-disc list-inside space-y-1">
            {diagnostics.errors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Log de pruebas */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">📋 Log de Pruebas:</h3>
        <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono mb-1">{result}</div>
          ))}
        </div>
      </div>

      {/* Información del entorno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">🌍 Información del Entorno:</h3>
          <ul className="text-sm space-y-1">
            <li>• Navegador: {navigator.userAgent}</li>
            <li>• Geolocalización: {navigator.geolocation ? '✅ Disponible' : '❌ No disponible'}</li>
            <li>• Conexión: {navigator.onLine ? '✅ En línea' : '❌ Sin conexión'}</li>
            <li>• URL: {window.location.href}</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">🔧 Variables de Entorno:</h3>
          <ul className="text-sm space-y-1">
            <li>• VITE_GOOGLE_MAPS_API_KEY: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada'}</li>
            <li>• NODE_ENV: {import.meta.env.NODE_ENV}</li>
            <li>• BASE_URL: {import.meta.env.BASE_URL}</li>
          </ul>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">💡 Recomendaciones:</h3>
        <ul className="text-sm space-y-1">
          {!diagnostics.apiKeyPresent && (
            <li>• Verificar que VITE_GOOGLE_MAPS_API_KEY esté configurada en el archivo .env</li>
          )}
          {!diagnostics.loaderAvailable && (
            <li>• Instalar @googlemaps/js-api-loader: npm install @googlemaps/js-api-loader</li>
          )}
          {diagnostics.apiKeyPresent && !diagnostics.googleAvailable && (
            <li>• Verificar que la API Key sea válida y tenga permisos para Maps JavaScript API</li>
          )}
          {diagnostics.googleAvailable && !diagnostics.mapCreated && (
            <li>• Verificar que el elemento del mapa tenga dimensiones válidas</li>
          )}
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Recargar Página
        </button>
        <button
          onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🔑 Google Cloud Console
        </button>
        <button
          onClick={() => window.open('/map-test', '_blank')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🗺️ Probar Mapa Simple
        </button>
      </div>
    </div>
  );
};

export default MapDiagnostic; 
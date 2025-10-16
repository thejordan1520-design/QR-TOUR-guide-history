import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const SupabaseTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('--- Iniciando prueba de Supabase ---');
    
    // Verificar variables de entorno
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addResult(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Cargada' : '❌ No cargada'}`);
    addResult(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Cargada' : '❌ No cargada'}`);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      addResult('❌ Error: Variables de entorno no cargadas correctamente');
      setIsRunning(false);
      return;
    }
    
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      addResult('✅ Cliente Supabase creado correctamente');
      
      // Test de conexión
      addResult('--- Probando conexión con destinations ---');
      const { data, error } = await supabase.from('destinations').select('*');
      
      if (error) {
        addResult(`❌ Error en consulta: ${error.message}`);
      } else if (!data || data.length === 0) {
        addResult('⚠️ No hay filas visibles en destinations');
      } else {
        addResult(`✅ Destinations accesibles: ${data.length} registros encontrados`);
        
        // Mostrar algunos ejemplos
        data.slice(0, 3).forEach((dest, index) => {
          addResult(`📍 Destino ${index + 1}: ${dest.name} (activo: ${dest.is_active})`);
        });
        
        // Verificar audios
        const withAudios = data.filter(dest => 
          (dest.audios && (dest.audios.es || dest.audios.en || dest.audios.fr)) ||
          dest.audio_es || dest.audio_en || dest.audio_fr
        );
        addResult(`🎵 Destinos con audio: ${withAudios.length} de ${data.length}`);
      }
      
      // Test de Realtime
      addResult('--- Probando Realtime ---');
      const subscription = supabase
        .from('destinations')
        .on('INSERT', payload => addResult(`🔄 Nuevo registro detectado: ${payload.new?.name}`))
        .subscribe();
      
      addResult('✅ Suscripción Realtime iniciada');
      
      // Limpiar suscripción después de 5 segundos
      setTimeout(() => {
        supabase.removeSubscription(subscription);
        addResult('🔄 Suscripción Realtime eliminada');
        setIsRunning(false);
      }, 5000);
      
    } catch (err: any) {
      addResult(`❌ Error inesperado: ${err.message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Test de Conexión Supabase</h2>
      
      <div className="mb-4 flex gap-2">
        <button
          onClick={runTest}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Ejecutando...' : 'Ejecutar Test'}
        </button>
        
        <button
          onClick={() => {
            addResult('🧹 Limpiando cache manualmente...');
            localStorage.clear();
            sessionStorage.clear();
            addResult('✅ Cache limpiado. Recarga la página para aplicar cambios.');
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:opacity-90"
        >
          Limpiar Cache
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Resultados:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Haz clic en "Ejecutar Test" para comenzar</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Variables de entorno actuales:</strong></p>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</p>
        <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</p>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p><strong>⚠️ Información:</strong></p>
          <p>Si el frontend funciona bien solo, pero se rompe cuando abres el panel admin en otra pestaña, puede ser un problema de cache.</p>
          <p><strong>Solución:</strong> Haz clic en "Limpiar Cache" y recarga la página.</p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTestComponent;

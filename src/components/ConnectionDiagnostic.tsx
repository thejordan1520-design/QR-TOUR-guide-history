import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ENV_CONFIG } from '../config/environment';

const ConnectionDiagnostic: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostic = async () => {
    setLoading(true);
    setResults([]);
    
    addResult('🔍 Iniciando diagnóstico de conexiones...');
    
    // Verificar variables de entorno
    addResult(`📋 Variables de entorno:`);
    addResult(`- SUPABASE_URL: ${ENV_CONFIG.supabase.url ? '✅' : '❌'}`);
    addResult(`- SUPABASE_ANON_KEY: ${ENV_CONFIG.supabase.anonKey ? '✅' : '❌'}`);
    addResult(`- SUPABASE_SERVICE_KEY: ${ENV_CONFIG.supabase.serviceRoleKey ? '✅' : '❌'}`);
    
    // Test cliente público
    addResult('🌐 Probando cliente público...');
    try {
      const { data, error } = await supabasePublic.from('destinations').select('count').limit(1);
      if (error) {
        addResult(`❌ Cliente público: ${error.message}`);
      } else {
        addResult(`✅ Cliente público: Conexión exitosa`);
      }
    } catch (e: any) {
      addResult(`❌ Cliente público: ${e.message}`);
    }
    
    // Test cliente admin
    addResult('🔐 Probando cliente admin...');
    try {
      const { data, error } = await supabase.from('destinations').select('count').limit(1);
      if (error) {
        addResult(`❌ Cliente admin: ${error.message}`);
      } else {
        addResult(`✅ Cliente admin: Conexión exitosa`);
      }
    } catch (e: any) {
      addResult(`❌ Cliente admin: ${e.message}`);
    }
    
    // Test tabla específica del admin
    addResult('📊 Probando tabla destinations...');
    try {
      const { data, error } = await supabase.from('destinations').select('*').limit(5);
      if (error) {
        addResult(`❌ Destinations: ${error.message}`);
      } else {
        addResult(`✅ Destinations: ${data?.length || 0} registros encontrados`);
      }
    } catch (e: any) {
      addResult(`❌ Destinations: ${e.message}`);
    }
    
    addResult('🏁 Diagnóstico completado');
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico de Conexiones</h2>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
      </button>
      
      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Resultados:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500">Haz clic en "Ejecutar Diagnóstico" para comenzar</p>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <p key={index} className="text-sm font-mono">{result}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionDiagnostic;

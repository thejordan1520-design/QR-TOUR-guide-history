import { useState, useEffect, useCallback } from 'react';
import { plansTableSetup, PlanTableSetupResult } from '../services/plansTableSetup';

export interface UsePlansTableSetupReturn {
  isConfigured: boolean;
  isConfiguring: boolean;
  setupResult: PlanTableSetupResult | null;
  setupError: string | null;
  configureTable: () => Promise<void>;
  verifySetup: () => Promise<void>;
}

export const usePlansTableSetup = (): UsePlansTableSetupReturn => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [setupResult, setSetupResult] = useState<PlanTableSetupResult | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const configureTable = useCallback(async () => {
    try {
      setIsConfiguring(true);
      setSetupError(null);
      console.log('🔧 [usePlansTableSetup] Iniciando configuración automática...');

      const result = await plansTableSetup.setupPlansTable();
      setSetupResult(result);

      if (result.success) {
        setIsConfigured(true);
        console.log('✅ [usePlansTableSetup] Configuración exitosa:', result.message);
      } else {
        setSetupError(result.message);
        console.error('❌ [usePlansTableSetup] Error en configuración:', result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSetupError(errorMessage);
      console.error('❌ [usePlansTableSetup] Error general:', error);
    } finally {
      setIsConfiguring(false);
    }
  }, []);

  const verifySetup = useCallback(async () => {
    try {
      console.log('🔍 [usePlansTableSetup] Verificando configuración...');
      const isReady = await plansTableSetup.verifyTableSetup();
      setIsConfigured(isReady);
      
      if (!isReady) {
        console.log('⚠️ [usePlansTableSetup] Tabla no configurada, iniciando configuración automática...');
        await configureTable();
      }
    } catch (error) {
      console.error('❌ [usePlansTableSetup] Error verificando configuración:', error);
      setSetupError(error instanceof Error ? error.message : 'Error verificando configuración');
    }
  }, [configureTable]);

  // Verificar configuración al montar el hook
  useEffect(() => {
    verifySetup();
  }, [verifySetup]);

  return {
    isConfigured,
    isConfiguring,
    setupResult,
    setupError,
    configureTable,
    verifySetup
  };
};


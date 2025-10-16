// Hook para monitorear la salud de la conexión del panel admin con Supabase
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface HealthStatus {
  isHealthy: boolean;
  lastCheck: Date | null;
  consecutiveFailures: number;
  error: string | null;
}

export const useAdminHealthCheck = (intervalMs: number = 60000) => { // Cambiado de 30s a 60s
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isHealthy: true,
    lastCheck: null,
    consecutiveFailures: 0,
    error: null
  });

  const performHealthCheck = useCallback(async () => {
    try {
      console.log('🏥 Realizando health check del panel admin...');
      
      // Evitar crash si el cliente es un alias del público y aún no hay sesión
      if (!supabase) {
        throw new Error('Cliente admin no disponible');
      }

      // Hacer una query simple para verificar conectividad
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Health check falló: ${error.message}`);
      }

      // Si llegamos aquí, la conexión está bien
      setHealthStatus(prev => ({
        isHealthy: true,
        lastCheck: new Date(),
        consecutiveFailures: 0,
        error: null
      }));

      console.log('✅ Health check exitoso');
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Health check falló:', errorMsg);
      
      setHealthStatus(prev => ({
        isHealthy: prev.consecutiveFailures >= 2 ? false : true,
        lastCheck: new Date(),
        consecutiveFailures: prev.consecutiveFailures + 1,
        error: errorMsg
      }));

      return false;
    }
  }, []);

  const attemptRecovery = useCallback(async () => {
    console.log('🔄 Intentando recuperar conexión...');
    
    // Estrategia de recuperación:
    // 1. Limpiar cualquier cache corrupto
    try {
      // Verificar localStorage
      const adminKeys = Object.keys(localStorage).filter(k => 
        k.includes('admin') || k.includes('dashboard')
      );
      
      if (adminKeys.length > 0) {
        console.log('🧹 Limpiando cache del admin:', adminKeys);
        // No eliminar, solo loguear para diagnóstico
      }
    } catch (cleanupErr) {
      console.warn('⚠️ Error al intentar limpiar cache:', cleanupErr);
    }

    // 2. Reintentar health check
    const success = await performHealthCheck();
    
    if (success) {
      console.log('✅ Recuperación exitosa');
      return true;
    } else {
      console.log('❌ Recuperación falló, se necesita recarga manual');
      return false;
    }
  }, [performHealthCheck]);

  // Ejecutar health check periódicamente
  useEffect(() => {
    // Health check inicial
    performHealthCheck();

    // Health checks periódicos
    const intervalId = setInterval(() => {
      performHealthCheck();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [performHealthCheck, intervalMs]);

  // Auto-recuperación si se detectan fallos
  useEffect(() => {
    if (healthStatus.consecutiveFailures >= 2 && !healthStatus.isHealthy) {
      console.warn('⚠️ Detectados múltiples fallos, intentando recuperación automática...');
      attemptRecovery();
    }
  }, [healthStatus.consecutiveFailures, healthStatus.isHealthy, attemptRecovery]);

  return {
    healthStatus,
    performHealthCheck,
    attemptRecovery,
    isHealthy: healthStatus.isHealthy,
    consecutiveFailures: healthStatus.consecutiveFailures
  };
};





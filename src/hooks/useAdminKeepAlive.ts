// ✅ Hook DESHABILITADO - Causaba corrupción de localStorage
// El auto-reload y el heartbeat estaban generando loops infinitos
// y corrompiendo el localStorage de Supabase

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAdminKeepAlive = () => {
  const navigate = useNavigate();
  const heartbeatFailures = useRef(0);

  useEffect(() => {
    console.log('💓 Keep-Alive DESHABILITADO (prevenía corrupción de localStorage)');
    
    // ✅ TODAS LAS FUNCIONES DESHABILITADAS:
    // - Heartbeat (causaba saturación)
    // - Visibility change reload (causaba loops)
    // - Activity tracker (innecesario)
    
    return () => {
      // No cleanup necesario
    };
  }, [navigate]);

  return {
    isAlive: true // Siempre true ya que no hay heartbeat
  };
};


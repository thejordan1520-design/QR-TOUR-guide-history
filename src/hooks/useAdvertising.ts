import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseAds } from '../lib/supabaseAds';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  target_url?: string;
  display_duration: number;
  priority: number;
}

export interface AdvertisementView {
  id: string;
  advertisement_id: string;
  user_id?: string;
  session_id?: string;
  viewed_at: string;
  duration_viewed: number;
  clicked: boolean;
  clicked_at?: string;
}

export const useAdvertising = () => {
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adsCacheRef = useRef<Advertisement[] | null>(null);
  const sessionIdRef = useRef<string>(((typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`));

  // Obtener el siguiente anuncio (public frontend) - usa RPC para evitar RLS
  const getNextAdvertisement = useCallback(async (userId?: string, adIndex?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const sessionId = sessionIdRef.current;
      
      console.log('🎯 Obteniendo anuncio...', { userId, sessionId });
      
      // Cargar (una sola vez) la lista completa de anuncios activos desde la tabla
      if (!adsCacheRef.current) {
        console.log('🔍 Cargando lista de anuncios activos...');
        const { data: activeAds, error: loadError } = await supabaseAds
          .from('advertisements')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true })
          .order('created_at', { ascending: false });

        if (loadError) {
          console.error('❌ Error cargando anuncios:', loadError);
          throw new Error(loadError.message);
        }

        adsCacheRef.current = activeAds || [];
      }

      const adsArray = adsCacheRef.current || [];
      if (!adsArray.length) {
        console.log('ℹ️ No hay anuncios activos');
        setCurrentAd(null);
        return null;
      }

      // Selección determinista por índice para rotación
      const index = adIndex || 0;
      const ad = adsArray[index % adsArray.length];
      console.log(`✅ Anuncio obtenido (índice ${index}):`, ad.title);
      setCurrentAd(ad);
        
        // Intentar registrar la visualización directamente en la tabla (sin RPC problemática)
        try {
          const { data: viewData, error: viewError } = await supabaseAds
            .from('advertisement_views')
            .insert({
              advertisement_id: ad.id,
              user_id: userId || null,
              session_id: sessionId,
              duration_viewed: 0,
              viewed_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (viewError) {
            // Registrar error como no crítico para no bloquear la UI
            console.warn('⚠️ Error registrando visualización (no crítico):', viewError);
            console.log('🔍 Datos que se intentaron insertar:', {
              advertisement_id: ad.id,
              user_id: userId || null,
              session_id: sessionId,
              duration_viewed: 0,
              viewed_at: new Date().toISOString()
            });
          } else {
            setViewId(viewData?.id);
            console.log('✅ Visualización registrada con viewId:', viewData?.id);
          }
        } catch (viewErr) {
          console.warn('⚠️ Error registrando visualización (no crítico):', viewErr);
        }

        return ad;
    } catch (err) {
      console.error('❌ Error obteniendo anuncio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setCurrentAd(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mostrar anuncio por un tiempo determinado
  const showAdvertisement = useCallback((ad: Advertisement) => {
    console.log('🎬 Mostrando anuncio:', ad.title);
    setIsVisible(true);
    
    // Limpiar timer anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Ocultar anuncio después del tiempo especificado
    timerRef.current = setTimeout(() => {
      console.log('⏰ Anuncio ocultado por tiempo');
      setIsVisible(false);
      setCurrentAd(null);
      setViewId(null);
    }, ad.display_duration * 1000);
  }, []);

  // Manejar clic en anuncio
  const handleAdClick = useCallback(async () => {
    console.log('🖱️ handleAdClick llamado - viewId:', viewId, 'currentAd:', currentAd?.title);
    
    if (!currentAd) {
      console.log('❌ No se puede procesar click - no hay anuncio actual');
      return;
    }

    try {
      console.log('🖱️ Clic en anuncio:', currentAd.title);
      
      // Intentar registrar el clic solo si tenemos viewId
      if (viewId) {
        try {
          const { error } = await supabaseAds
            .from('advertisement_views')
            .update({ 
              clicked_at: new Date().toISOString(),
              click_count: 1
            })
            .eq('id', viewId);

          if (error) {
            console.warn('⚠️ Error registrando clic (no crítico):', error);
          } else {
            console.log('✅ Clic registrado');
          }
        } catch (clickErr) {
          console.warn('⚠️ Error registrando clic (no crítico):', clickErr);
        }
      } else {
        console.log('⚠️ No hay viewId, pero procesando click de todas formas');
      }

      // Abrir enlace en nueva pestaña (esto siempre debe funcionar)
      console.log('🔗 URLs disponibles - target_url:', currentAd.target_url, 'link_url:', currentAd.link_url);
      
      if (currentAd.target_url) {
        console.log('🌐 Abriendo target_url:', currentAd.target_url);
        window.open(currentAd.target_url, '_blank', 'noopener,noreferrer');
      } else if (currentAd.link_url) {
        console.log('🌐 Abriendo link_url:', currentAd.link_url);
        window.open(currentAd.link_url, '_blank', 'noopener,noreferrer');
      } else {
        console.log('❌ No hay URL de destino configurada');
      }
    } catch (err) {
      console.error('❌ Error manejando clic:', err);
    }
  }, [viewId, currentAd]);

  // Cerrar anuncio manualmente
  const closeAdvertisement = useCallback(() => {
    console.log('❌ Anuncio cerrado manualmente');
    setIsVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (visibilityTimerRef.current) {
      clearTimeout(visibilityTimerRef.current);
      visibilityTimerRef.current = null;
    }
  }, []);

  // Iniciar el sistema de publicidad
  const startAdvertising = useCallback(async (userId?: string, isPremium: boolean = false, adIndex?: number) => {
    // Solo mostrar anuncios a usuarios no premium
    if (isPremium) {
      console.log('👑 Usuario premium, no se muestran anuncios');
      return;
    }

    try {
      console.log('🚀 Iniciando sistema de publicidad...');
      const ad = await getNextAdvertisement(userId, adIndex);
      if (ad) {
        showAdvertisement(ad);
      } else {
        console.log('ℹ️ No hay anuncios para mostrar');
      }
    } catch (err) {
      console.error('❌ Error iniciando publicidad:', err);
    }
  }, [getNextAdvertisement, showAdvertisement]);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }
    };
  }, []);

  return {
    currentAd,
    isLoading,
    error,
    isVisible,
    startAdvertising,
    handleAdClick,
    closeAdvertisement,
    getNextAdvertisement
  };
};
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface EventItem {
  id: string;
  title: string;
  image_url?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  more_info_url?: string;
  order_position?: number;
  is_active?: boolean;
}

export const useEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📅 Cargando eventos desde ambas tablas...');
      
      // Consultar las 2 tablas en paralelo
      const [eventsResult, servicesEventsResult] = await Promise.all([
        supabase
        .from('events')
        .select('*')
          .order('start_date', { ascending: true }),
        supabase
          .from('services')
          .select('*')
          .eq('service_type', 'events')
          .order('created_at', { ascending: false })
      ]);

      // Procesar eventos de la tabla 'events'
      const eventsData = (eventsResult.data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        image_url: event.image_url,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        more_info_url: event.more_info_url,
        order_position: event.order_position,
        is_active: event.is_active ?? true
      }));

      // Procesar eventos de la tabla 'services'
      const servicesEventsData = (servicesEventsResult.data || []).map((service: any) => ({
        id: service.id,
        title: service.name, // En services se usa 'name' en lugar de 'title'
        image_url: service.image_url,
        description: service.description,
        start_date: service.created_at, // Usar created_at como start_date
        end_date: null,
        location: service.location,
        more_info_url: service.website_url, // Usar website_url como more_info_url
        order_position: service.display_order,
        is_active: service.is_active ?? true
      }));

      // Combinar eventos de ambas tablas y filtrar solo los activos
      const allEvents = [...eventsData, ...servicesEventsData]
        // .filter(event => event.is_active) // Temporalmente comentado para debug
        .sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          return dateB - dateA; // Orden descendente (más recientes primero)
        });

      console.log(`✅ Eventos cargados:`);
      console.log(`   - Desde tabla "events": ${eventsData.length}`);
      console.log(`   - Desde tabla "services": ${servicesEventsData.length}`);
      console.log(`   - Total activos: ${allEvents.length}`);

      setEvents(allEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar eventos inicialmente
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    refetch: loadEvents
  };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSync } from './useRealtimeSync';
import { useOrderManager } from '../utils/dynamicOrderManager';

export interface AdminService {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  service_type: string | null;
  price: number | string | null;
  currency?: string | null;
  duration?: number | null;
  rating?: number | null;
  phone?: string | null;
  phone_display?: string | null;
  email?: string | null;
  website_url?: string | null;
  image_url?: string | null;
  location?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  source_table: 'services' | 'taxi_drivers' | 'tourist_guides' | 'buss' | 'events';
}

export const useAdminServices = () => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { syncTrigger } = useRealtimeSync();
  
  // Usar el nuevo sistema de orden dinámico
  const orderManager = useOrderManager('services');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading services (aggregated) from Supabase...');

      const [srvRes, taxiRes, guideRes, busRes] = await Promise.allSettled([
        supabase.from('services').select('*').order('display_order', { ascending: true }),
        supabase.from('taxi_drivers').select('*').order('order_position', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('tourist_guides').select('*').order('order_position', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('buss').select('*').order('order_position', { ascending: true }).order('created_at', { ascending: false })
      ]);

      const aggregated: AdminService[] = [];

      if (srvRes.status === 'fulfilled' && !srvRes.value.error) {
        const list = (srvRes.value.data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? null,
          category: r.category ?? 'general',
          service_type: r.service_type ?? 'individual',
          price: r.price ?? 0,
          currency: r.currency ?? 'USD',
          duration: r.duration ?? 60,
          rating: r.rating ?? 0,
          phone: r.phone ?? null,
          phone_display: r.phone_display ?? null,
          email: r.email ?? null,
          website_url: r.website_url ?? null,
          image_url: r.image_url ?? null,
          location: r.location ?? null,
          is_active: r.is_active ?? true,
          display_order: r.display_order ?? 0,
          created_at: r.created_at,
          updated_at: r.updated_at,
          source_table: 'services' as const
        }));
        aggregated.push(...list);
      } else if (srvRes.status === 'fulfilled' && srvRes.value.error) {
        console.warn('services load error:', srvRes.value.error.message);
      }

      if (taxiRes.status === 'fulfilled' && !taxiRes.value.error) {
        const list = (taxiRes.value.data || []).map((r: any) => ({
          id: r.id,
          name: r.name ?? r.company ?? 'Taxi',
          description: r.description ?? null,
          category: 'Taxis',
          service_type: 'taxi',
          price: r.hourly_rate ?? null,
          currency: null,
          duration: null,
          rating: r.rating ?? 0,
          phone: r.phone ?? null,
          phone_display: r.phone_display ?? null,
          email: r.email ?? null,
          website_url: r.more_info_url ?? null,
          image_url: r.image_url ?? null,
          location: r.location ?? null,
          is_active: r.is_active ?? true,
          display_order: r.order_position ?? 0,
          created_at: r.created_at ?? new Date().toISOString(),
          updated_at: r.updated_at ?? new Date().toISOString(),
          source_table: 'taxi_drivers' as const
        }));
        aggregated.push(...list);
      } else if (taxiRes.status === 'fulfilled' && taxiRes.value.error) {
        console.warn('taxi_drivers load error:', taxiRes.value.error.message);
      }

      if (guideRes.status === 'fulfilled' && !guideRes.value.error) {
        const list = (guideRes.value.data || []).map((r: any) => ({
          id: r.id,
          name: r.name ?? 'Guía',
          description: r.description ?? null,
          category: 'Guías Turísticos',
          service_type: 'tourist_guide',
          price: r.hourly_rate ?? null,
          currency: null,
          duration: r.duration_hours ?? null,
          rating: r.rating ?? 0,
          phone: r.phone ?? null,
          phone_display: r.phone_display ?? null,
          email: r.email ?? null,
          website_url: r.website_url ?? null,
          image_url: r.image_url ?? null,
          location: r.location ?? null,
          is_active: r.is_active ?? true,
          display_order: r.order_position ?? 0,
          created_at: r.created_at ?? new Date().toISOString(),
          updated_at: r.updated_at ?? new Date().toISOString(),
          source_table: 'tourist_guides' as const
        }));
        aggregated.push(...list);
      } else if (guideRes.status === 'fulfilled' && guideRes.value.error) {
        console.warn('tourist_guides load error:', guideRes.value.error.message);
      }

      if (busRes.status === 'fulfilled' && !busRes.value.error) {
        const list = (busRes.value.data || []).map((r: any) => ({
          id: r.id,
          name: r.company ?? r.route ?? 'Bus',
          description: r.description ?? null,
          category: 'bus',
          service_type: 'bus',
          price: r.price_per_hour ?? null,
          currency: null,
          duration: null,
          rating: r.rating ?? 0,
          phone: r.phone ?? null,
          phone_display: r.phone_display ?? null,
          email: r.email ?? null,
          website_url: r.more_info_url ?? null,
          image_url: r.image_url ?? null,
          location: r.location ?? null,
          is_active: r.is_active ?? true,
          display_order: r.order_position ?? 0,
          created_at: r.created_at ?? new Date().toISOString(),
          updated_at: r.updated_at ?? new Date().toISOString(),
          source_table: 'buss' as const
        }));
        aggregated.push(...list);
      } else if (busRes.status === 'fulfilled' && busRes.value.error) {
        console.warn('buss load error:', busRes.value.error.message);
      }

      setServices(aggregated);
      console.log(`✅ Aggregated ${aggregated.length} services from multiple tables`);
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (syncTrigger > 0) {
      console.log('🔄 useAdminServices: Cambio detectado, recargando servicios...');
      fetchServices();
    }
  }, [syncTrigger, fetchServices]);

  const createService = useCallback(async (serviceData: Partial<AdminService>) => {
    try {
      console.log('📝 Creating service:', serviceData);
      
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: serviceData.name || 'Servicio sin nombre',
          description: serviceData.description || 'Sin descripción',
          category: serviceData.category || 'general',
          price: typeof serviceData.price === 'string' ? parseFloat(serviceData.price) || 0 : (serviceData.price || 0),
          currency: serviceData.currency || 'USD',
          duration: serviceData.duration || 60,
          is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
          display_order: serviceData.display_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }

      console.log('✅ Service created:', data);
      await fetchServices();
      return data;
    } catch (err) {
      console.error('Error creating service:', err);
      throw err;
    }
  }, [fetchServices]);

  const updateService = useCallback(async (serviceId: string, serviceData: Partial<AdminService>) => {
    try {
      console.log('📝 Updating service:', serviceId, serviceData);

      // Detectar tabla de origen
      const target = services.find(s => s.id === serviceId);
      const sourceTable = target?.source_table || 'services';

      let data, error;
      if (sourceTable === 'services') {
        ({ data, error } = await supabase
          .from('services')
          .update({
            name: serviceData.name,
            description: serviceData.description,
            category: serviceData.category,
            price: typeof serviceData.price === 'string' ? parseFloat(serviceData.price) || null : (serviceData.price as number | null | undefined),
            currency: serviceData.currency,
            duration: serviceData.duration as number | null | undefined,
            is_active: serviceData.is_active,
            display_order: serviceData.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single());
      } else if (sourceTable === 'taxi_drivers') {
        // Campos permitidos para taxistas
        ({ data, error } = await supabase
          .from('taxi_drivers')
          .update({
            name: serviceData.name,
            description: serviceData.description,
            phone: serviceData.phone ?? serviceData.phone_display,
            image_url: serviceData.image_url,
            more_info_url: serviceData.website_url,
            is_active: serviceData.is_active,
            order_position: typeof serviceData.display_order === 'number' ? serviceData.display_order : undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single());
      } else if (sourceTable === 'tourist_guides') {
        ({ data, error } = await supabase
          .from('tourist_guides')
          .update({
            name: serviceData.name,
            description: serviceData.description,
            phone: serviceData.phone ?? serviceData.phone_display,
            image_url: serviceData.image_url,
            website_url: serviceData.website_url,
            hourly_rate: typeof serviceData.price === 'string' ? parseFloat(serviceData.price) || null : (serviceData.price as number | null | undefined),
            is_active: serviceData.is_active,
            order_position: typeof serviceData.display_order === 'number' ? serviceData.display_order : undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single());
      } else if (sourceTable === 'buss') {
        ({ data, error } = await supabase
          .from('buss')
          .update({
            description: serviceData.description,
            is_active: serviceData.is_active,
            order_position: typeof serviceData.display_order === 'number' ? serviceData.display_order : undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .select()
          .single());
      } else {
        throw new Error('Edición no soportada para este tipo de servicio');
      }

      if (error) {
        console.error('Error updating service:', error);
        throw error;
      }

      console.log('✅ Service updated:', data);
      await fetchServices();
      return data;
    } catch (err) {
      console.error('Error updating service:', err);
      throw err;
    }
  }, [fetchServices, services]);

  const updateServiceOrder = useCallback(async (serviceId: string, newOrder: number) => {
    try {
      const target = services.find(s => s.id === serviceId);
      if (!target) throw new Error('Service not found');

      const payload: Partial<AdminService> = { display_order: newOrder } as any;
      await updateService(serviceId, payload);
      return true;
    } catch (err) {
      console.error('Error updating service order:', err);
      throw err;
    }
  }, [services, updateService]);

  const deleteService = useCallback(async (serviceId: string) => {
    try {
      console.log('🗑️ Deleting service:', serviceId);

      const target = services.find(s => s.id === serviceId);
      const sourceTable = target?.source_table || 'services';

      const { error } = await supabase
        .from(sourceTable)
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        throw error;
      }

      console.log('✅ Service deleted');
      await fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      throw err;
    }
  }, [fetchServices, services]);

  const toggleServiceStatus = useCallback(async (serviceId: string) => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      await updateService(serviceId, { is_active: !service.is_active });
    } catch (err) {
      console.error('Error toggling service status:', err);
      throw err;
    }
  }, [services, updateService]);

  // Función inteligente para manejar orden dinámico con swap automático
  const updateOrderPosition = useCallback(async (id: string, newPosition: number) => {
    try {
      console.log(`🔄 Swap dinámico en servicios: ${id} → posición ${newPosition}`);
      
      // Usar el sistema de orden dinámico con swap automático
      const result = await orderManager.swapPosition(id, newPosition);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Refrescar la lista para mostrar el nuevo orden
      await fetchServices();
      
      console.log(`✅ Swap dinámico completado: ${result.message}`);
      return result;
      
    } catch (err) {
      console.error('❌ Error en swap dinámico de servicios:', err);
      throw err;
    }
  }, [orderManager, fetchServices]);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    updateOrderPosition,
    deleteService,
    toggleServiceStatus,
    refetch: fetchServices,
    updateServiceOrder
  };
};
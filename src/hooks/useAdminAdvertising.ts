import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { handleJWTError } from '../utils/supabaseAuth';

export interface AdminAdvertisement {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  target_url?: string;
  is_active: boolean;
  priority: number;
  display_duration: number;
  click_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export const useAdminAdvertising = () => {
  const [advertisements, setAdvertisements] = useState<AdminAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseAdmin
        .from('advertisements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error de Supabase:', fetchError);
        
        // Intentar refrescar sesión si es error de JWT
        if (fetchError.message?.includes('JWT expired') || fetchError.code === 'PGRST303') {
          console.log('🔄 Intentando refrescar sesión...');
          const refreshed = await handleJWTError(fetchError);
          if (refreshed) {
            console.log('✅ Sesión refrescada, reintentando...');
            // Reintentar la consulta después del refresh
            const { data: retryData, error: retryError } = await supabaseAdmin
              .from('advertisements')
              .select('*')
              .order('priority', { ascending: false })
              .order('created_at', { ascending: false });
            
            if (retryError) {
              throw retryError;
            }
            setAdvertisements(retryData || []);
            return;
          }
        }
        
        throw fetchError;
      }

      setAdvertisements(data || []);
    } catch (err: any) {
      console.error('Error cargando anuncios:', err);
      
      // Manejo específico de errores
      if (err.message?.includes('JWT expired') || err.code === 'PGRST303') {
        setError('Sesión expirada. Por favor, recarga la página.');
      } else if (err.message?.includes('relation "advertisements" does not exist')) {
        setError('La tabla de anuncios no existe. Ejecuta el script create-missing-admin-tables.sql en Supabase.');
      } else if (err.message?.includes('permission denied')) {
        setError('Sin permisos para acceder a los anuncios. Verifica las políticas RLS.');
      } else {
        setError(err.message || 'Error desconocido cargando anuncios');
      }
      
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdvertisement = useCallback(async (adData: Partial<AdminAdvertisement>) => {
    try {
      const insertData: any = {
        title: adData.title || 'Sin título',
        description: adData.description || '',
        image_url: adData.image_url || '',
        link_url: adData.link_url || '',
        target_url: adData.target_url || '',
        is_active: adData.is_active !== undefined ? adData.is_active : true,
        priority: adData.priority || 1,
        display_duration: adData.display_duration || 60,
        expires_at: adData.expires_at ? new Date(adData.expires_at).toISOString() : null
      };

      const { data, error: createError } = await supabaseAdmin
        .from('advertisements')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        // Intentar refrescar sesión si es error de JWT
        if (createError.message?.includes('JWT expired') || createError.code === 'PGRST303') {
          const refreshed = await handleJWTError(createError);
          if (refreshed) {
            // Reintentar después del refresh
            const { data: retryData, error: retryError } = await supabaseAdmin
              .from('advertisements')
              .insert([insertData])
              .select()
              .single();
            
            if (retryError) {
              throw retryError;
            }
            await fetchAdvertisements();
            return retryData;
          }
        }
        throw createError;
      }

      await fetchAdvertisements(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('Error creando anuncio:', err);
      throw err;
    }
  }, [fetchAdvertisements]);

  const updateAdvertisement = useCallback(async (id: string, adData: Partial<AdminAdvertisement>) => {
    try {
      console.log('✏️ [AdminAdvertising] Actualizando anuncio:', id, adData);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (adData.title !== undefined) updateData.title = adData.title;
      if (adData.description !== undefined) updateData.description = adData.description;
      if (adData.image_url !== undefined) updateData.image_url = adData.image_url;
      if (adData.link_url !== undefined) updateData.link_url = adData.link_url;
      if (adData.target_url !== undefined) updateData.target_url = adData.target_url;
      if (adData.is_active !== undefined) updateData.is_active = adData.is_active;
      if (adData.priority !== undefined) updateData.priority = adData.priority;
      if (adData.display_duration !== undefined) updateData.display_duration = adData.display_duration;
      if (adData.expires_at !== undefined) {
        updateData.expires_at = adData.expires_at ? new Date(adData.expires_at).toISOString() : null;
      }

      const { data, error: updateError } = await supabaseAdmin
        .from('advertisements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ [AdminAdvertising] Anuncio actualizado:', data);
      await fetchAdvertisements(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ [AdminAdvertising] Error actualizando anuncio:', err);
      throw err;
    }
  }, [fetchAdvertisements]);

  const deleteAdvertisement = useCallback(async (id: string) => {
    try {
      console.log('🗑️ [AdminAdvertising] Eliminando anuncio:', id);

      const { error: deleteError } = await supabaseAdmin
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ [AdminAdvertising] Anuncio eliminado');
      await fetchAdvertisements(); // Recargar lista
    } catch (err: any) {
      console.error('❌ [AdminAdvertising] Error eliminando anuncio:', err);
      throw err;
    }
  }, [fetchAdvertisements]);

  const toggleAdvertisementStatus = useCallback(async (id: string) => {
    try {
      const ad = advertisements.find(a => a.id === id);
      if (!ad) throw new Error('Anuncio no encontrado');

      await updateAdvertisement(id, { is_active: !ad.is_active });
    } catch (err: any) {
      console.error('❌ [AdminAdvertising] Error cambiando estado:', err);
      throw err;
    }
  }, [advertisements, updateAdvertisement]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  return {
    advertisements,
    loading,
    error,
    fetchAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementStatus
  };
};
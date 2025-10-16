import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Translation {
  id: string;
  key: string;
  language: string;
  value: string;
  context?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminTranslations = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 [AdminTranslations] Iniciando carga de traducciones...');

      const { data, error: fetchError } = await supabase
        .from('translations')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (fetchError) {
        console.error('❌ [AdminTranslations] Error de Supabase:', fetchError);
        
        // Manejo específico de errores
        if (fetchError.message?.includes('JWT expired')) {
          setError('Sesión expirada. Por favor, recarga la página.');
        } else if (fetchError.message?.includes('relation "translations" does not exist')) {
          setError('La tabla de traducciones no existe. Ejecuta el script create-missing-admin-tables.sql en Supabase.');
        } else if (fetchError.message?.includes('permission denied')) {
          setError('Sin permisos para acceder a las traducciones. Verifica las políticas RLS.');
        } else {
          setError(fetchError.message || 'Error desconocido cargando traducciones');
        }
        
        setTranslations([]);
        return;
      }

      console.log('✅ [AdminTranslations] Traducciones cargadas:', data?.length || 0);
      setTranslations(data || []);
    } catch (err: any) {
      console.error('❌ [AdminTranslations] Error cargando traducciones:', err);
      setError(err.message || 'Error desconocido cargando traducciones');
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTranslation = useCallback(async (translationData: Partial<Translation>) => {
    try {
      console.log('📝 [AdminTranslations] Creando traducción:', translationData);

      const insertData: any = {
        key: translationData.key || '',
        language: translationData.language || 'es',
        value: translationData.value || '',
        context: translationData.context || 'general',
        category: translationData.category || 'ui',
        is_active: translationData.is_active !== undefined ? translationData.is_active : true
      };

      const { data, error: createError } = await supabase
        .from('translations')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('✅ [AdminTranslations] Traducción creada:', data);
      await fetchTranslations(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ [AdminTranslations] Error creando traducción:', err);
      throw err;
    }
  }, [fetchTranslations]);

  const updateTranslation = useCallback(async (id: string, translationData: Partial<Translation>) => {
    try {
      console.log('✏️ [AdminTranslations] Actualizando traducción:', id, translationData);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (translationData.key !== undefined) updateData.key = translationData.key;
      if (translationData.language !== undefined) updateData.language = translationData.language;
      if (translationData.value !== undefined) updateData.value = translationData.value;
      if (translationData.context !== undefined) updateData.context = translationData.context;
      if (translationData.category !== undefined) updateData.category = translationData.category;
      if (translationData.is_active !== undefined) updateData.is_active = translationData.is_active;

      const { data, error: updateError } = await supabase
        .from('translations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ [AdminTranslations] Traducción actualizada:', data);
      await fetchTranslations(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ [AdminTranslations] Error actualizando traducción:', err);
      throw err;
    }
  }, [fetchTranslations]);

  const deleteTranslation = useCallback(async (id: string) => {
    try {
      console.log('🗑️ [AdminTranslations] Eliminando traducción:', id);

      const { error: deleteError } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ [AdminTranslations] Traducción eliminada');
      await fetchTranslations(); // Recargar lista
    } catch (err: any) {
      console.error('❌ [AdminTranslations] Error eliminando traducción:', err);
      throw err;
    }
  }, [fetchTranslations]);

  const toggleTranslationStatus = useCallback(async (id: string) => {
    try {
      const translation = translations.find(t => t.id === id);
      if (!translation) throw new Error('Traducción no encontrada');

      await updateTranslation(id, { is_active: !translation.is_active });
    } catch (err: any) {
      console.error('❌ [AdminTranslations] Error cambiando estado:', err);
      throw err;
    }
  }, [translations, updateTranslation]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  return {
    translations,
    loading,
    error,
    fetchTranslations,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    toggleTranslationStatus
  };
};
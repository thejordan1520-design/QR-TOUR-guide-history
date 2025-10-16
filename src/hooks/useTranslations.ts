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

export interface SupportedLanguage {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  is_default: boolean;
  flag_emoji?: string;
  created_at: string;
}

export interface MissingTranslation {
  id: string;
  key: string;
  language: string;
  context?: string;
  category?: string;
  count: number;
  first_seen: string;
  last_seen: string;
}

export const useTranslations = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [missingTranslations, setMissingTranslations] = useState<MissingTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar traducciones
  const fetchTranslations = useCallback(async (language?: string, context?: string, category?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('translations')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (language) {
        query = query.eq('language', language);
      }
      if (context) {
        query = query.eq('context', context);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ [useTranslations] Error de Supabase:', fetchError);
        
        // Si la tabla no existe, mostrar error específico
        if (fetchError.message.includes('relation') && fetchError.message.includes('does not exist')) {
          setError('La tabla de traducciones no existe. Ejecuta el script create-admin-tables.sql en Supabase.');
        } else {
          setError(fetchError.message);
        }
        setTranslations([]);
        return;
      }

      setTranslations(data || []);
      console.log('✅ [useTranslations] Traducciones cargadas:', data?.length || 0);
    } catch (err) {
      console.error('❌ [useTranslations] Error cargando traducciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar idiomas soportados
  const fetchLanguages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('supported_languages')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setLanguages(data || []);
      console.log('✅ Idiomas cargados:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error cargando idiomas:', err);
    }
  }, []);

  // Cargar traducciones faltantes
  const fetchMissingTranslations = useCallback(async (language?: string) => {
    try {
      const { data, error } = await supabase.rpc('get_missing_translations', {
        p_language: language || null
      });

      if (error) {
        throw error;
      }

      setMissingTranslations(data || []);
      console.log('✅ Traducciones faltantes cargadas:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error cargando traducciones faltantes:', err);
    }
  }, []);

  // Obtener traducción específica
  const getTranslation = useCallback(async (key: string, language: string = 'es', fallbackLanguage: string = 'es') => {
    try {
      const { data, error } = await supabase.rpc('get_translation', {
        p_key: key,
        p_language: language,
        p_fallback_language: fallbackLanguage
      });

      if (error) {
        throw error;
      }

      return data || key; // Fallback a la clave si no se encuentra
    } catch (err) {
      console.error('❌ Error obteniendo traducción:', err);
      return key; // Fallback a la clave
    }
  }, []);

  // Crear nueva traducción
  const createTranslation = useCallback(async (translationData: Partial<Translation>) => {
    try {
      console.log('📝 Creando traducción:', translationData);

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

      console.log('✅ Traducción creada:', data);
      await fetchTranslations();
      return data;
    } catch (err) {
      console.error('❌ Error creando traducción:', err);
      throw err;
    }
  }, [fetchTranslations]);

  // Actualizar traducción
  const updateTranslation = useCallback(async (translationId: string, translationData: Partial<Translation>) => {
    try {
      console.log('📝 Actualizando traducción:', translationId, translationData);

      const updateData: any = {
        key: translationData.key,
        language: translationData.language,
        value: translationData.value,
        context: translationData.context,
        category: translationData.category,
        is_active: translationData.is_active
      };

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const { data, error: updateError } = await supabase
        .from('translations')
        .update(filteredUpdateData)
        .eq('id', translationId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Traducción actualizada:', data);
      await fetchTranslations();
      return data;
    } catch (err) {
      console.error('❌ Error actualizando traducción:', err);
      throw err;
    }
  }, [fetchTranslations]);

  // Eliminar traducción
  const deleteTranslation = useCallback(async (translationId: string) => {
    try {
      console.log('🗑️ Eliminando traducción:', translationId);

      const { error: deleteError } = await supabase
        .from('translations')
        .delete()
        .eq('id', translationId);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ Traducción eliminada');
      await fetchTranslations();
    } catch (err) {
      console.error('❌ Error eliminando traducción:', err);
      throw err;
    }
  }, [fetchTranslations]);

  // Sincronizar traducciones faltantes
  const syncMissingTranslations = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando traducciones faltantes...');

      const { data, error } = await supabase.rpc('sync_missing_translations');

      if (error) {
        throw error;
      }

      console.log(`✅ ${data} traducciones faltantes sincronizadas`);
      await fetchTranslations();
      await fetchMissingTranslations();
      return data;
    } catch (err) {
      console.error('❌ Error sincronizando traducciones faltantes:', err);
      throw err;
    }
  }, [fetchTranslations, fetchMissingTranslations]);

  // Crear traducción desde traducción faltante
  const createFromMissing = useCallback(async (missingTranslation: MissingTranslation, value: string) => {
    try {
      console.log('📝 Creando traducción desde faltante:', missingTranslation);

      const translationData: Partial<Translation> = {
        key: missingTranslation.key,
        language: missingTranslation.language,
        value: value,
        context: missingTranslation.context || 'general',
        category: missingTranslation.category || 'ui',
        is_active: true
      };

      const result = await createTranslation(translationData);
      
      // Recargar traducciones faltantes para actualizar la lista
      await fetchMissingTranslations();
      
      return result;
    } catch (err) {
      console.error('❌ Error creando traducción desde faltante:', err);
      throw err;
    }
  }, [createTranslation, fetchMissingTranslations]);

  // Obtener estadísticas de traducciones
  const getTranslationStats = useCallback(async () => {
    try {
      const stats = {
        totalTranslations: 0,
        translationsByLanguage: {} as Record<string, number>,
        missingTranslations: 0,
        translationsByCategory: {} as Record<string, number>
      };

      // Contar traducciones totales
      const { data: translationsData } = await supabase
        .from('translations')
        .select('language, category')
        .eq('is_active', true);

      if (translationsData) {
        stats.totalTranslations = translationsData.length;
        
        translationsData.forEach(t => {
          stats.translationsByLanguage[t.language] = (stats.translationsByLanguage[t.language] || 0) + 1;
          stats.translationsByCategory[t.category] = (stats.translationsByCategory[t.category] || 0) + 1;
        });
      }

      // Contar traducciones faltantes
      const { data: missingData } = await supabase
        .from('missing_translations')
        .select('id');

      stats.missingTranslations = missingData?.length || 0;

      return stats;
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas de traducciones:', err);
      throw err;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchTranslations(),
        fetchLanguages(),
        fetchMissingTranslations()
      ]);
    };

    loadInitialData();
  }, [fetchTranslations, fetchLanguages, fetchMissingTranslations]);

  return {
    translations,
    languages,
    missingTranslations,
    loading,
    error,
    fetchTranslations,
    fetchLanguages,
    fetchMissingTranslations,
    getTranslation,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    syncMissingTranslations,
    createFromMissing,
    getTranslationStats
  };
};




import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji o nombre de icono de lucide-react
  gradient: string; // clase CSS como "bg-gradient-to-br from-rose-500 to-pink-500"
  is_active: boolean;
  display_order: number;
  route: string; // ruta como "/services/pharmacies"
  created_at: string;
  updated_at: string;
}

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('📂 Obteniendo categorías de servicios...');
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo categorías:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} categorías obtenidas`);
      setCategories(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching service categories:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData: Partial<ServiceCategory>) => {
    try {
      console.log('📂 Creando categoría:', categoryData);
      
      // Generar ID único
      const baseId = categoryData.name?.toLowerCase().replace(/\s+/g, '-') || 'category';
      const uniqueId = `category-${baseId}-${Date.now()}`;
      
      // Generar ruta automáticamente si no se proporciona
      const route = categoryData.route || `/services/${baseId}`;
      
      const categoryToCreate = {
        id: uniqueId,
        name: categoryData.name?.trim() || '',
        description: categoryData.description?.trim() || '',
        icon: categoryData.icon?.trim() || '📦',
        gradient: categoryData.gradient?.trim() || 'bg-gradient-to-br from-gray-500 to-gray-600',
        is_active: categoryData.is_active ?? true,
        display_order: categoryData.display_order || 999,
        route: route,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('service_categories')
        .insert(categoryToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría creada:', data);
      await fetchCategories();
      return data;
    } catch (err) {
      console.error('❌ Error creating category:', err);
      throw err;
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<ServiceCategory>) => {
    try {
      console.log('📂 Actualizando categoría:', id, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('service_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría actualizada:', data);
      await fetchCategories();
      return data;
    } catch (err) {
      console.error('❌ Error updating category:', err);
      throw err;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      console.log('📂 Eliminando categoría:', id);
      
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría eliminada');
      await fetchCategories();
    } catch (err) {
      console.error('❌ Error deleting category:', err);
      throw err;
    }
  }, [fetchCategories]);

  const toggleCategoryStatus = useCallback(async (id: string) => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) throw new Error('Categoría no encontrada');

      const newStatus = !category.is_active;
      console.log(`📂 Cambiando estado de categoría ${id} a ${newStatus ? 'activo' : 'inactivo'}`);

      const { error } = await supabase
        .from('service_categories')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error cambiando estado:', error);
        throw error;
      }

      console.log('✅ Estado cambiado exitosamente');
      await fetchCategories();
    } catch (err) {
      console.error('❌ Error toggling category status:', err);
      throw err;
    }
  }, [categories, fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    refetch: fetchCategories
  };
};




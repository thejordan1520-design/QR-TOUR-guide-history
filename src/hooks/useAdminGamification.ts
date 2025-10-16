import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createTranslationService } from '../services/translationService';

export interface AdminBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  rarity: string;
  reward_points: number;
  is_active: boolean;
  created_at: string;
}

export const useAdminGamification = () => {
  const [badges, setBadges] = useState<AdminBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching badges:', error);
        throw error;
      }

      console.log('✅ Badges fetched:', data?.length || 0);
      setBadges(data || []);
    } catch (err) {
      console.error('❌ Error in fetchBadges:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBadge = useCallback(async (badgeData: Partial<AdminBadge>) => {
    try {
      console.log('📝 Creating badge:', badgeData);
      
      // Generar ID único
      const baseId = badgeData.name?.toLowerCase().replace(/\s+/g, '-') || 'badge';
      const uniqueId = `${baseId}-${Date.now()}`;
      
      const badgeToCreate = {
        id: uniqueId,
        name: badgeData.name?.trim() || '',
        description: badgeData.description?.trim() || '',
        icon: badgeData.icon?.trim() || '🏆',
        requirement_type: badgeData.requirement_type?.trim() || 'qr_scans',
        requirement_value: badgeData.requirement_value || 1,
        rarity: badgeData.rarity?.trim() || 'common',
        reward_points: badgeData.reward_points || 10,
        is_active: badgeData.is_active ?? true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('badges')
        .insert(badgeToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating badge:', error);
        throw error;
      }

      console.log('✅ Badge created:', data);
      
      // Crear traducciones automáticas
      await createBadgeTranslations(data.id, {
        name: data.name,
        description: data.description
      });
      
      // Refrescar la lista
      await fetchBadges();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating badge:', err);
      throw err;
    }
  }, [fetchBadges]);

  const updateBadge = useCallback(async (id: string, badgeData: Partial<AdminBadge>) => {
    try {
      console.log('✏️ Updating badge:', id, badgeData);
      
      const updateData = {
        ...badgeData
      };

      const { data, error } = await supabase
        .from('badges')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating badge:', error);
        throw error;
      }

      console.log('✅ Badge updated:', data);
      
      // Refrescar la lista
      await fetchBadges();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating badge:', err);
      throw err;
    }
  }, [fetchBadges]);

  const deleteBadge = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting badge:', id);
      
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting badge:', error);
        throw error;
      }

      console.log('✅ Badge deleted');
      
      // Refrescar la lista
      await fetchBadges();
    } catch (err) {
      console.error('❌ Error deleting badge:', err);
      throw err;
    }
  }, [fetchBadges]);

  const toggleBadgeStatus = useCallback(async (id: string) => {
    try {
      const badge = badges.find(b => b.id === id);
      if (!badge) {
        throw new Error('Badge not found');
      }

      const newStatus = !badge.is_active;
      
      await updateBadge(id, { is_active: newStatus });
      
      console.log(`✅ Badge status changed to ${newStatus ? 'active' : 'inactive'}`);
    } catch (err) {
      console.error('❌ Error toggling badge status:', err);
      throw err;
    }
  }, [badges, updateBadge]);

  const createBadgeTranslations = async (badgeId: string, spanishData: { name: string; description: string }) => {
    try {
      console.log('🌐 Creating badge translations for:', badgeId);
      
      const translationService = createTranslationService();
      
      // Traducir nombre
      const nameTranslations = await translationService.translatePlace({
        name: spanishData.name,
        description: '',
        title: spanishData.name
      }, 'es');
      
      // Traducir descripción
      const descriptionTranslations = await translationService.translatePlace({
        name: spanishData.description,
        description: '',
        title: spanishData.description
      }, 'es');

      const translationsToSave = [
        // Nombre
        { key: `badge.${badgeId}.name`, language: 'es', value: spanishData.name },
        { key: `badge.${badgeId}.name`, language: 'en', value: nameTranslations.name.en },
        { key: `badge.${badgeId}.name`, language: 'fr', value: nameTranslations.name.fr },
        
        // Descripción
        { key: `badge.${badgeId}.description`, language: 'es', value: spanishData.description },
        { key: `badge.${badgeId}.description`, language: 'en', value: descriptionTranslations.name.en },
        { key: `badge.${badgeId}.description`, language: 'fr', value: descriptionTranslations.name.fr }
      ];

      const { error } = await supabase
        .from('translations')
        .upsert(translationsToSave);

      if (error) {
        console.error('❌ Error saving badge translations:', error);
      } else {
        console.log('✅ Badge translations saved');
      }
    } catch (err) {
      console.error('❌ Error creating badge translations:', err);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading,
    error,
    fetchBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    toggleBadgeStatus,
    refetch: fetchBadges
  };
};




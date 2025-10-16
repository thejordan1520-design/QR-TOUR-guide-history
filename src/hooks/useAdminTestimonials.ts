import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminTestimonial {
  id: string;
  user_id: string | null;
  destination_id: string | null;
  destination_title: string | null;
  destination_description: string | null;
  rating: number;
  comment: string;
  category: 'compliment' | 'complaint' | 'suggestion' | 'question' | 'testimonial';
  is_public: boolean;
  admin_response: string | null;
  responded_at: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  display_order: number;
  user?: {
    display_name?: string;
    email?: string;
  };
}

export interface TestimonialStats {
  total: number;
  byCategory: Record<string, number>;
  byRating: Record<number, number>;
  public: number;
  private: number;
  responded: number;
  pending: number;
  averageRating: number;
}

export const useAdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          user:users!feedback_user_id_fkey (
            display_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching testimonials:', error);
        throw error;
      }

      console.log('✅ Testimonials fetched:', data?.length || 0);
      setTestimonials(data || []);
    } catch (err) {
      console.error('❌ Error in fetchTestimonials:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestimonial = useCallback(async (testimonialData: Partial<AdminTestimonial>) => {
    try {
      console.log('📝 Creating testimonial:', testimonialData);
      
      const testimonialToCreate = {
        user_id: testimonialData.user_id || null,
        destination_id: testimonialData.destination_id || null,
        destination_title: testimonialData.destination_title || null,
        destination_description: testimonialData.destination_description || null,
        rating: testimonialData.rating || 5,
        comment: testimonialData.comment?.trim() || '',
        category: testimonialData.category || 'testimonial',
        is_public: testimonialData.is_public ?? true,
        admin_response: testimonialData.admin_response || null,
        responded_at: testimonialData.responded_at || null,
        helpful_count: testimonialData.helpful_count || 0,
        display_order: testimonialData.display_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('feedback')
        .insert(testimonialToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating testimonial:', error);
        throw error;
      }

      console.log('✅ Testimonial created:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating testimonial:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const updateTestimonial = useCallback(async (id: string, testimonialData: Partial<AdminTestimonial>) => {
    try {
      console.log('✏️ Updating testimonial:', id, testimonialData);
      
      const updateData = {
        ...testimonialData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating testimonial:', error);
        throw error;
      }

      console.log('✅ Testimonial updated:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating testimonial:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const deleteTestimonial = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting testimonial:', id);
      
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting testimonial:', error);
        throw error;
      }

      console.log('✅ Testimonial deleted');
      
      // Refrescar la lista
      await fetchTestimonials();
    } catch (err) {
      console.error('❌ Error deleting testimonial:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const toggleTestimonialPublic = useCallback(async (id: string, isPublic: boolean) => {
    try {
      console.log('🔄 Toggling testimonial public status:', id, isPublic);
      
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error toggling testimonial public status:', error);
        throw error;
      }

      console.log('✅ Testimonial public status toggled:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error toggling testimonial public status:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const addAdminResponse = useCallback(async (id: string, response: string) => {
    try {
      console.log('💬 Adding admin response:', id, response);
      
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          admin_response: response,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding admin response:', error);
        throw error;
      }

      console.log('✅ Admin response added:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error adding admin response:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const updateDisplayOrder = useCallback(async (id: string, displayOrder: number) => {
    try {
      console.log('📊 Updating display order:', id, displayOrder);
      
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          display_order: displayOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating display order:', error);
        throw error;
      }

      console.log('✅ Display order updated:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating display order:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const getTestimonialStats = useCallback((): TestimonialStats => {
    const total = testimonials.length;
    
    // Estadísticas por categoría
    const byCategory: Record<string, number> = {};
    testimonials.forEach(testimonial => {
      byCategory[testimonial.category] = (byCategory[testimonial.category] || 0) + 1;
    });
    
    // Estadísticas por rating
    const byRating: Record<number, number> = {};
    testimonials.forEach(testimonial => {
      byRating[testimonial.rating] = (byRating[testimonial.rating] || 0) + 1;
    });
    
    // Estadísticas de visibilidad
    const publicTestimonials = testimonials.filter(t => t.is_public).length;
    const privateTestimonials = testimonials.filter(t => !t.is_public).length;
    
    // Estadísticas de respuesta
    const responded = testimonials.filter(t => t.admin_response && t.responded_at).length;
    const pending = total - responded;
    
    // Rating promedio
    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
    const averageRating = total > 0 ? totalRating / total : 0;

    return {
      total,
      byCategory,
      byRating,
      public: publicTestimonials,
      private: privateTestimonials,
      responded,
      pending,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }, [testimonials]);

  const searchTestimonials = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    
    return testimonials.filter(testimonial => 
      testimonial.comment.toLowerCase().includes(searchTerm) ||
      (testimonial.destination_title && testimonial.destination_title.toLowerCase().includes(searchTerm)) ||
      (testimonial.admin_response && testimonial.admin_response.toLowerCase().includes(searchTerm))
    );
  }, [testimonials]);

  const getTestimonialsByCategory = useCallback((category: string) => {
    return testimonials.filter(testimonial => testimonial.category === category);
  }, [testimonials]);

  const getPublicTestimonials = useCallback(() => {
    return testimonials.filter(testimonial => testimonial.is_public);
  }, [testimonials]);

  const getPendingTestimonials = useCallback(() => {
    return testimonials.filter(testimonial => !testimonial.admin_response || !testimonial.responded_at);
  }, [testimonials]);

  const getTopRatedTestimonials = useCallback((limit: number = 10) => {
    return testimonials
      .filter(testimonial => testimonial.is_public)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }, [testimonials]);

  const getRecentTestimonials = useCallback((limit: number = 10) => {
    return testimonials
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }, [testimonials]);

  const exportTestimonials = useCallback(async (format: 'json' | 'csv' = 'json', publicOnly: boolean = false) => {
    try {
      console.log('📤 Exporting testimonials in', format, 'format', publicOnly ? '(public only)' : '');
      
      let dataToExport = publicOnly ? getPublicTestimonials() : testimonials;
      
      if (format === 'json') {
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `testimonials_${publicOnly ? 'public_' : ''}${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'csv') {
        const headers = ['ID', 'User ID', 'Rating', 'Comment', 'Category', 'Public', 'Admin Response', 'Created At'];
        const csvContent = [
          headers.join(','),
          ...dataToExport.map(t => [
            t.id,
            t.user_id || '',
            t.rating,
            `"${t.comment.replace(/"/g, '""')}"`,
            t.category,
            t.is_public ? 'Yes' : 'No',
            t.admin_response ? `"${t.admin_response.replace(/"/g, '""')}"` : '',
            t.created_at
          ].join(','))
        ].join('\n');
        
        const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
        const exportFileDefaultName = `testimonials_${publicOnly ? 'public_' : ''}${new Date().toISOString().split('T')[0]}.csv`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
      
      console.log('✅ Testimonials exported successfully');
    } catch (err) {
      console.error('❌ Error exporting testimonials:', err);
      throw err;
    }
  }, [testimonials, getPublicTestimonials]);

  const importTestimonials = useCallback(async (testimonialsData: AdminTestimonial[]) => {
    try {
      console.log('📥 Importing testimonials:', testimonialsData.length);
      
      const { data, error } = await supabase
        .from('feedback')
        .upsert(testimonialsData, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('❌ Error importing testimonials:', error);
        throw error;
      }

      console.log('✅ Testimonials imported successfully');
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error importing testimonials:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const bulkUpdateCategory = useCallback(async (ids: string[], category: string) => {
    try {
      console.log('📝 Bulk updating category:', ids, category);
      
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          category,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .select();

      if (error) {
        console.error('❌ Error bulk updating category:', error);
        throw error;
      }

      console.log('✅ Category bulk updated:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error bulk updating category:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  const bulkTogglePublic = useCallback(async (ids: string[], isPublic: boolean) => {
    try {
      console.log('🔄 Bulk toggling public status:', ids, isPublic);
      
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .select();

      if (error) {
        console.error('❌ Error bulk toggling public status:', error);
        throw error;
      }

      console.log('✅ Public status bulk toggled:', data);
      
      // Refrescar la lista
      await fetchTestimonials();
      
      return data;
    } catch (err) {
      console.error('❌ Error bulk toggling public status:', err);
      throw err;
    }
  }, [fetchTestimonials]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return {
    testimonials,
    loading,
    error,
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialPublic,
    addAdminResponse,
    updateDisplayOrder,
    getTestimonialStats,
    searchTestimonials,
    getTestimonialsByCategory,
    getPublicTestimonials,
    getPendingTestimonials,
    getTopRatedTestimonials,
    getRecentTestimonials,
    exportTestimonials,
    importTestimonials,
    bulkUpdateCategory,
    bulkTogglePublic,
    refetch: fetchTestimonials
  };
};




import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminReservation {
  id: string;
  user_id: string | null;
  service_id: string;
  service_name: string;
  service_type: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  participants: number;
  reservation_date: string;
  reservation_time: string;
  special_requests: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  paypal_link: string | null;
  price: number | null;
  payment_status: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  display_order: number;
}

export const useAdminReservations = () => {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      console.log('📅 Obteniendo reservaciones desde Supabase...');
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo reservaciones:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} reservaciones obtenidas`);
      setReservations(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching reservations:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = async (reservationData: Partial<AdminReservation>) => {
    try {
      console.log('📅 Creando reservación:', reservationData);
      
      // Generar ID único basado en el servicio y fecha
      const baseId = reservationData.service_name?.toLowerCase().replace(/\s+/g, '-') || 'reservation';
      const uniqueId = `reservation-${baseId}-${Date.now()}`;
      
      const reservationToCreate = {
        id: uniqueId,
        user_id: reservationData.user_id || null,
        service_id: reservationData.service_id?.trim() || '',
        service_name: reservationData.service_name?.trim() || '',
        service_type: reservationData.service_type?.trim() || 'service',
        full_name: reservationData.full_name?.trim() || '',
        email: reservationData.email?.trim() || '',
        phone: reservationData.phone?.trim() || null,
        age: reservationData.age || null,
        participants: reservationData.participants || 1,
        reservation_date: reservationData.reservation_date || '',
        reservation_time: reservationData.reservation_time || '',
        special_requests: reservationData.special_requests?.trim() || null,
        emergency_contact: reservationData.emergency_contact?.trim() || null,
        emergency_phone: reservationData.emergency_phone?.trim() || null,
        status: reservationData.status || 'pending',
        admin_notes: reservationData.admin_notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paypal_link: reservationData.paypal_link?.trim() || null,
        price: reservationData.price || null,
        payment_status: reservationData.payment_status || 'pending',
        confirmed_at: reservationData.confirmed_at || null,
        confirmed_by: reservationData.confirmed_by?.trim() || null,
        display_order: reservationData.display_order || 999
      };

      const { data, error } = await supabase
        .from('reservations')
        .insert(reservationToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando reservación:', error);
        throw error;
      }

      console.log('✅ Reservación creada:', data);
      
      // Refrescar la lista
      await fetchReservations();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating reservation:', err);
      throw err;
    }
  };

  const updateReservation = async (id: string, updates: Partial<AdminReservation>) => {
    try {
      console.log('📅 Actualizando reservación:', id, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando reservación:', error);
        throw error;
      }

      console.log('✅ Reservación actualizada:', data);
      
      // Refrescar la lista
      await fetchReservations();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating reservation:', err);
      throw err;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      console.log('📅 Eliminando reservación:', id);
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando reservación:', error);
        throw error;
      }

      console.log('✅ Reservación eliminada');
      
      // Refrescar la lista
      setTimeout(() => fetchReservations(), 100);
      
    } catch (err) {
      console.error('❌ Error deleting reservation:', err);
      throw err;
    }
  };

  const updateReservationStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      console.log(`📅 Actualizando estado de reservación ${id} a ${status}`);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        updateData.confirmed_by = 'admin';
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando estado:', error);
        throw error;
      }

      console.log('✅ Estado actualizado exitosamente');
      await fetchReservations();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating reservation status:', err);
      throw err;
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      console.log(`📅 Actualizando estado de pago de reservación ${id} a ${paymentStatus}`);
      
      const { data, error } = await supabase
        .from('reservations')
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando estado de pago:', error);
        throw error;
      }

      console.log('✅ Estado de pago actualizado exitosamente');
      await fetchReservations();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating payment status:', err);
      throw err;
    }
  };

  // Cargar reservaciones al montar el componente
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    updatePaymentStatus,
    refetch: fetchReservations
  };
};




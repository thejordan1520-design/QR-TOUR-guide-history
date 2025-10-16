import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminQRCode {
  id: string;
  code: string;
  title: string;
  resource_type: string;
  resource_id: string;
  metadata: string | null;
  is_active: boolean;
  created_by: string;
  created_by_email: string;
  created_at: string;
  updated_at: string;
  is_premium: boolean;
  destination_id: string | null;
  qr_data: string | null;
}

export const useAdminQRCodes = () => {
  const [qrCodes, setQrCodes] = useState<AdminQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCodes = useCallback(async () => {
    try {
      console.log('📱 Obteniendo códigos QR desde Supabase...');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo códigos QR:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} códigos QR obtenidos`);
      setQrCodes(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching QR codes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar códigos QR');
    } finally {
      setLoading(false);
    }
  }, []);

  const createQRCode = async (qrCodeData: Partial<AdminQRCode>) => {
    try {
      console.log('📱 Creando código QR:', qrCodeData);
      
      // Generar ID único basado en el código
      const baseId = qrCodeData.code?.toLowerCase().replace(/\s+/g, '-') || 'qr-code';
      const uniqueId = `qr-${baseId}-${Date.now()}`;
      
      const qrCodeToCreate = {
        id: uniqueId,
        code: qrCodeData.code?.trim() || '',
        title: qrCodeData.title?.trim() || '',
        resource_type: qrCodeData.resource_type?.trim() || 'destination',
        resource_id: qrCodeData.resource_id?.trim() || '',
        metadata: qrCodeData.metadata?.trim() || null,
        is_active: qrCodeData.is_active ?? true,
        created_by: qrCodeData.created_by?.trim() || 'admin',
        created_by_email: qrCodeData.created_by_email?.trim() || 'admin@system.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_premium: qrCodeData.is_premium ?? false,
        destination_id: qrCodeData.destination_id?.trim() || null,
        qr_data: qrCodeData.qr_data?.trim() || null
      };

      const { data, error } = await supabase
        .from('qr_codes')
        .insert(qrCodeToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando código QR:', error);
        throw error;
      }

      console.log('✅ Código QR creado:', data);
      
      // Refrescar la lista
      await fetchQRCodes();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating QR code:', err);
      throw err;
    }
  };

  const updateQRCode = async (id: string, updates: Partial<AdminQRCode>) => {
    try {
      console.log('📱 Actualizando código QR:', id, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('qr_codes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando código QR:', error);
        throw error;
      }

      console.log('✅ Código QR actualizado:', data);
      
      // Refrescar la lista
      await fetchQRCodes();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating QR code:', err);
      throw err;
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      console.log('📱 Eliminando código QR:', id);
      
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando código QR:', error);
        throw error;
      }

      console.log('✅ Código QR eliminado');
      
      // Refrescar la lista
      setTimeout(() => fetchQRCodes(), 100);
      
    } catch (err) {
      console.error('❌ Error deleting QR code:', err);
      throw err;
    }
  };

  const toggleQRCodeStatus = async (id: string) => {
    try {
      const qrCode = qrCodes.find(q => q.id === id);
      if (!qrCode) throw new Error('Código QR no encontrado');

      const newStatus = !qrCode.is_active;
      console.log(`📱 Cambiando estado del código QR ${id} a ${newStatus ? 'activo' : 'inactivo'}`);

      const { error } = await supabase
        .from('qr_codes')
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
      await fetchQRCodes();
    } catch (err) {
      console.error('❌ Error toggling QR code status:', err);
      throw err;
    }
  };

  const generateQRCode = async (data: string) => {
    try {
      console.log('📱 Generando código QR para:', data);
      
      // Aquí podrías integrar con una API de generación de QR codes
      // Por ahora, simulamos la generación
      const qrData = `data:image/png;base64,${btoa(data)}`;
      
      return qrData;
    } catch (err) {
      console.error('❌ Error generating QR code:', err);
      throw err;
    }
  };

  // Cargar códigos QR al montar el componente
  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  return {
    qrCodes,
    loading,
    error,
    createQRCode,
    updateQRCode,
    deleteQRCode,
    toggleQRCodeStatus,
    generateQRCode,
    refetch: fetchQRCodes
  };
};




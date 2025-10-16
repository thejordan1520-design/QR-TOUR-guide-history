import { useState, useEffect } from 'react';
import { qrCodesService } from '../supabaseServices';

interface QRCode {
  id: string;
  place_id: string;
  code: string;
  lat: number;
  lng: number;
  status: string;
  scan_count: number;
  description: string;
  qr_image: string;
  created_at: string;
}

export const useQRCodes = (placeId?: string) => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      setLoading(true);
      setError(null);
      try {
        let { data, error };
        
        if (placeId) {
          // Obtener códigos QR por lugar específico
          ({ data, error } = await qrCodesService.getQRCodesByPlace(placeId));
        } else {
          // Obtener todos los códigos QR
          ({ data, error } = await qrCodesService.getAllQRCodes());
        }
        
        if (error) {
          console.error('Error fetching QR codes:', error);
          setError(error.message);
          setQrCodes([]);
        } else {
          setQrCodes(data || []);
          console.log('✅ QR codes loaded:', data?.length || 0, 'codes');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching QR codes:', err);
        setError(err.message);
        setQrCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [placeId]);

  // Función para obtener código QR por código específico
  const getQRCodeByCode = async (code: string) => {
    try {
      const { data, error } = await qrCodesService.getQRCodeByCode(code);
      if (error) {
        console.error('Error fetching QR code by code:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error fetching QR code by code:', err);
      return { data: null, error: err };
    }
  };

  // Función para crear nuevo código QR
  const createQRCode = async (qrData: Omit<QRCode, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await qrCodesService.createQRCode(qrData);
      if (error) {
        console.error('Error creating QR code:', error);
        return { data: null, error };
      }
      
      // Actualizar estado local
      if (data) {
        setQrCodes(prev => [...prev, data[0]]);
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error creating QR code:', err);
      return { data: null, error: err };
    }
  };

  return { 
    qrCodes, 
    loading, 
    error, 
    getQRCodeByCode,
    createQRCode 
  };
};

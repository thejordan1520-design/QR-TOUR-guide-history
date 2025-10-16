import { useState, useEffect } from 'react';
import { scansService } from '../supabaseServices';

interface Scan {
  id: string;
  user_id: string;
  qr_code_id: string;
  scan_date: string;
  location_lat: number;
  location_lng: number;
  device_info: string;
}

export const useScans = (userId?: string) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScans = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await scansService.getScansByUser(userId);
        
        if (error) {
          console.error('Error fetching user scans:', error);
          setError(error.message);
          setScans([]);
        } else {
          setScans(data || []);
          console.log('✅ User scans loaded:', data?.length || 0, 'scans');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching user scans:', err);
        setError(err.message);
        setScans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [userId]);

  // Función para crear nuevo escaneo
  const createScan = async (scanData: Omit<Scan, 'id'>) => {
    try {
      const { data, error } = await scansService.createScan(scanData);
      if (error) {
        console.error('Error creating scan:', error);
        return { data: null, error };
      }
      
      // Actualizar estado local
      if (data) {
        setScans(prev => [...prev, data[0]]);
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error creating scan:', err);
      return { data: null, error: err };
    }
  };

  // Función para obtener estadísticas de escaneos
  const getScanStats = () => {
    const totalScans = scans.length;
    const uniqueLocations = new Set(scans.map(scan => scan.qr_code_id)).size;
    const todayScans = scans.filter(scan => {
      const scanDate = new Date(scan.scan_date);
      const today = new Date();
      return scanDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalScans,
      uniqueLocations,
      todayScans
    };
  };

  return { 
    scans, 
    loading, 
    error, 
    createScan,
    getScanStats 
  };
};

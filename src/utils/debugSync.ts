// Utilidad de debug para verificar la sincronización
import { supabase } from '../lib/supabase';

export const debugSync = {
  // Verificar datos en la base de datos
  async checkDatabaseData() {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, title, description, image_url, audios')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching database data:', error);
        return null;
      }

      console.log('✅ Database data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in checkDatabaseData:', error);
      return null;
    }
  },

  // Verificar localStorage sync
  checkLocalStorageSync() {
    try {
      const syncData = localStorage.getItem('qr-tour-data-sync');
      console.log('📱 LocalStorage sync data:', syncData ? JSON.parse(syncData) : 'No sync data');
      return syncData ? JSON.parse(syncData) : null;
    } catch (error) {
      console.error('❌ Error checking localStorage sync:', error);
      return null;
    }
  },

  // Limpiar datos de sync
  clearSync() {
    localStorage.removeItem('qr-tour-data-sync');
    console.log('🧹 Sync data cleared');
  },

  // Forzar sync
  forceSync() {
    const syncData = {
      table: 'destinations',
      action: 'debug',
      timestamp: Date.now(),
      trigger: Math.random()
    };
    localStorage.setItem('qr-tour-data-sync', JSON.stringify(syncData));
    console.log('🔄 Force sync triggered:', syncData);
  }
};

// Exportar para uso en consola del navegador
(window as any).debugSync = debugSync;


// Test simple para verificar la sincronización
export const testSync = () => {
  console.log('🧪 Iniciando test de sincronización...');
  
  // 1. Verificar que DataSyncManager existe
  const manager = (window as any).DataSyncManager;
  if (!manager) {
    console.error('❌ DataSyncManager no está disponible en window');
    return;
  }
  
  console.log('✅ DataSyncManager encontrado');
  
  // 2. Verificar localStorage
  const syncKey = 'qr-tour-data-sync';
  const currentSync = localStorage.getItem(syncKey);
  console.log('📱 Current sync data:', currentSync ? JSON.parse(currentSync) : 'None');
  
  // 3. Trigger sync manual
  console.log('🔄 Triggering manual sync...');
  const syncData = {
    table: 'destinations',
    action: 'test',
    timestamp: Date.now(),
    trigger: Math.random()
  };
  
  localStorage.setItem(syncKey, JSON.stringify(syncData));
  
  // 4. Verificar que se guardó
  const newSync = localStorage.getItem(syncKey);
  console.log('📱 New sync data:', newSync ? JSON.parse(newSync) : 'None');
  
  console.log('✅ Test completado - revisa la consola del frontend para ver si detecta el cambio');
};

// Exportar para consola del navegador
(window as any).testSync = testSync;


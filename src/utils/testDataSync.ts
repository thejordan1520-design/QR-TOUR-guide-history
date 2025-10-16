// Archivo de prueba para verificar el sistema de sincronización
import { DataSyncManager } from './dataSync';

// Función para probar el sistema de sincronización
export const testDataSync = () => {
  console.log('🧪 Iniciando prueba del sistema de sincronización...');
  
  const manager = DataSyncManager.getInstance();
  
  // Suscribirse a cambios
  const unsubscribe = manager.subscribe(() => {
    console.log('✅ Cambio detectado en el sistema de sincronización');
    console.log('Último trigger:', manager.getLastSyncTrigger());
  });
  
  // Simular un cambio desde el Admin
  setTimeout(() => {
    console.log('📤 Simulando cambio desde Admin Panel...');
    manager.triggerSync('destinations', 'update');
  }, 2000);
  
  // Limpiar después de 5 segundos
  setTimeout(() => {
    unsubscribe();
    console.log('🧹 Limpieza completada');
  }, 5000);
  
  console.log('🎯 Prueba configurada, esperando cambios...');
};

// Exportar para uso en consola del navegador
(window as any).testDataSync = testDataSync;


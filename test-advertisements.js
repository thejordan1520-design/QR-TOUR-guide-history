// Script de prueba para verificar anuncios
// Ejecutar en la consola del navegador en http://localhost:3005

console.log('🧪 Iniciando prueba de anuncios...');

// Función para probar la obtención de anuncios
async function testAdvertisements() {
  try {
    console.log('1️⃣ Probando función RPC get_next_advertisement...');
    
    const { data, error } = await supabase.rpc('get_next_advertisement', {
      p_user_id: null,
      p_session_id: 'test_session_123'
    });
    
    if (error) {
      console.error('❌ Error con función RPC:', error);
      
      console.log('2️⃣ Probando consulta directa a la tabla...');
      const { data: directData, error: directError } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .limit(1);
        
      if (directError) {
        console.error('❌ Error con consulta directa:', directError);
      } else {
        console.log('✅ Consulta directa exitosa:', directData);
      }
    } else {
      console.log('✅ Función RPC exitosa:', data);
    }
    
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

// Función para probar el sistema de anuncios
function testAdvertisingSystem() {
  console.log('3️⃣ Probando sistema de anuncios...');
  
  // Verificar si el contexto de anuncios está disponible
  if (window.React && window.React.useContext) {
    console.log('✅ React está disponible');
  } else {
    console.log('❌ React no está disponible');
  }
  
  // Verificar si el componente de anuncios está en el DOM
  const adBanner = document.querySelector('[class*="AdvertisementBanner"]');
  if (adBanner) {
    console.log('✅ Banner de anuncios encontrado en el DOM');
  } else {
    console.log('ℹ️ Banner de anuncios no encontrado en el DOM');
  }
}

// Ejecutar pruebas
testAdvertisements();
testAdvertisingSystem();

console.log('🧪 Pruebas completadas. Revisa los resultados arriba.');


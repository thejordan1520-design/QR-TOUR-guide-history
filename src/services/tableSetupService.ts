import { supabase } from '../lib/supabase';

export interface TableSetupResult {
  success: boolean;
  message: string;
  error?: string;
}

export const tableSetupService = {
  /**
   * Verifica si la tabla subscription_plans existe y la crea si no existe
   */
  async ensureSubscriptionPlansTable(): Promise<TableSetupResult> {
    try {
      console.log('🔍 [TableSetup] Verificando tabla subscription_plans...');

      // Primero intentamos hacer una consulta simple para ver si la tabla existe
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id')
        .limit(1);

      if (error) {
        console.log('❌ [TableSetup] Tabla no existe o hay error:', error.message);
        
        // Si la tabla no existe, intentamos crearla usando RPC
        return await this.createSubscriptionPlansTable();
      }

      console.log('✅ [TableSetup] Tabla subscription_plans existe y es accesible');
      return {
        success: true,
        message: 'Tabla subscription_plans existe y es accesible'
      };

    } catch (err) {
      console.error('❌ [TableSetup] Error verificando tabla:', err);
      return {
        success: false,
        message: 'Error verificando tabla',
        error: err instanceof Error ? err.message : 'Error desconocido'
      };
    }
  },

  /**
   * Crea la tabla subscription_plans usando SQL directo
   */
  async createSubscriptionPlansTable(): Promise<TableSetupResult> {
    try {
      console.log('🔨 [TableSetup] Creando tabla subscription_plans...');

      // Intentamos crear la tabla usando una función RPC
      const { data, error } = await supabase.rpc('create_subscription_plans_table');

      if (error) {
        console.log('⚠️ [TableSetup] RPC no disponible, intentando método alternativo...');
        
        // Si RPC no funciona, intentamos insertar datos directamente
        // Esto fallará si la tabla no existe, pero nos dará información
        const testData = {
          name: 'Test Plan',
          description: 'Plan de prueba',
          price: 0,
          currency: 'USD',
          duration_days: 1,
          duration_hours: 24,
          features: [],
          benefits: [],
          is_active: true,
          is_popular: false,
          color: 'blue',
          plan_key: 'test-plan'
        };

        const { error: insertError } = await supabase
          .from('subscription_plans')
          .insert([testData]);

        if (insertError) {
          return {
            success: false,
            message: 'No se puede crear la tabla subscription_plans automáticamente',
            error: `Tabla no existe: ${insertError.message}. Necesitas crear la tabla manualmente en Supabase.`
          };
        }
      }

      console.log('✅ [TableSetup] Tabla subscription_plans creada exitosamente');
      return {
        success: true,
        message: 'Tabla subscription_plans creada exitosamente'
      };

    } catch (err) {
      console.error('❌ [TableSetup] Error creando tabla:', err);
      return {
        success: false,
        message: 'Error creando tabla',
        error: err instanceof Error ? err.message : 'Error desconocido'
      };
    }
  },

  /**
   * Verifica que todas las tablas necesarias existan
   */
  async verifyAllTables(): Promise<{
    subscription_plans: TableSetupResult;
    users?: TableSetupResult;
    reservations?: TableSetupResult;
    notifications?: TableSetupResult;
  }> {
    console.log('🔍 [TableSetup] Verificando todas las tablas...');

    const results: any = {};

    // Verificar subscription_plans
    results.subscription_plans = await this.ensureSubscriptionPlansTable();

    // Verificar otras tablas críticas
    try {
      const { error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      results.users = {
        success: !usersError,
        message: usersError ? 'Tabla users no existe' : 'Tabla users existe'
      };
    } catch (err) {
      results.users = {
        success: false,
        message: 'Error verificando tabla users',
        error: err instanceof Error ? err.message : 'Error desconocido'
      };
    }

    try {
      const { error: reservationsError } = await supabase
        .from('reservations')
        .select('id')
        .limit(1);
      
      results.reservations = {
        success: !reservationsError,
        message: reservationsError ? 'Tabla reservations no existe' : 'Tabla reservations existe'
      };
    } catch (err) {
      results.reservations = {
        success: false,
        message: 'Error verificando tabla reservations',
        error: err instanceof Error ? err.message : 'Error desconocido'
      };
    }

    try {
      const { error: notificationsError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      results.notifications = {
        success: !notificationsError,
        message: notificationsError ? 'Tabla notifications no existe' : 'Tabla notifications existe'
      };
    } catch (err) {
      results.notifications = {
        success: false,
        message: 'Error verificando tabla notifications',
        error: err instanceof Error ? err.message : 'Error desconocido'
      };
    }

    console.log('📊 [TableSetup] Resultados de verificación:', results);
    return results;
  }
};

export default tableSetupService;


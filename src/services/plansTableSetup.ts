import { supabase } from '../lib/supabase';

export interface PlanTableSetupResult {
  success: boolean;
  message: string;
  columnsAdded: string[];
  errors: string[];
}

export class PlansTableSetupService {
  private static instance: PlansTableSetupService;
  
  public static getInstance(): PlansTableSetupService {
    if (!PlansTableSetupService.instance) {
      PlansTableSetupService.instance = new PlansTableSetupService();
    }
    return PlansTableSetupService.instance;
  }

  /**
   * Configura automáticamente la tabla subscription_plans con todas las columnas necesarias
   */
  async setupPlansTable(): Promise<PlanTableSetupResult> {
    const result: PlanTableSetupResult = {
      success: false,
      message: '',
      columnsAdded: [],
      errors: []
    };

    try {
      console.log('🔧 [PlansTableSetup] Iniciando configuración automática de tabla subscription_plans...');

      // 1. Verificar si la tabla existe
      const { data: tableExists, error: tableError } = await supabase
        .from('subscription_plans')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('❌ [PlansTableSetup] Error verificando tabla:', tableError);
        result.errors.push(`Error verificando tabla: ${tableError.message}`);
        result.message = 'La tabla subscription_plans no existe o hay un problema de conexión';
        return result;
      }

      // 2. Verificar columnas existentes
      const existingColumns = await this.getExistingColumns();
      console.log('📋 [PlansTableSetup] Columnas existentes:', existingColumns);

      // 3. Definir columnas necesarias
      const requiredColumns = [
        { name: 'plan_key', type: 'TEXT', default: "''", unique: true },
        { name: 'paypal_link', type: 'TEXT', default: "''", unique: false },
        { name: 'price_usd', type: 'DECIMAL(10,2)', default: '0', unique: false },
        { name: 'discount_percentage', type: 'TEXT', default: "'0'", unique: false },
        { name: 'credits', type: 'INTEGER', default: '0', unique: false },
        { name: 'features', type: 'JSONB', default: "'[]'::jsonb", unique: false },
        { name: 'benefits', type: 'JSONB', default: "'[]'::jsonb", unique: false }
      ];

      // 4. Validación solamente: evitar inserts que disparan RLS
      for (const column of requiredColumns) {
        if (!existingColumns.includes(column.name)) {
          const msg = `Falta columna ${column.name} (ejecuta MIGRATE_SUBSCRIPTION_PLANS_COMPLETE.sql)`;
          console.warn('⚠️ [PlansTableSetup]', msg);
          result.errors.push(msg);
        }
      }

      // 5. Crear restricción única en plan_key si no existe
      await this.createUniqueConstraint();

      // 6. Determinar resultado final
      if (result.errors.length === 0) {
        result.success = true;
        result.message = `Configuración completada exitosamente. Columnas agregadas: ${result.columnsAdded.join(', ')}`;
      } else {
        result.success = false;
        result.message = `Configuración completada con errores: ${result.errors.join('; ')}`;
      }

      console.log('🎯 [PlansTableSetup] Resultado final:', result);
      return result;

    } catch (error) {
      const errorMsg = `Error general en configuración: ${error}`;
      console.error('❌ [PlansTableSetup]', errorMsg);
      result.errors.push(errorMsg);
      result.message = errorMsg;
      return result;
    }
  }

  /**
   * Obtiene las columnas existentes en la tabla subscription_plans
   */
  private async getExistingColumns(): Promise<string[]> {
    try {
      // Usar una consulta directa para obtener información del esquema
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'subscription_plans' });

      if (error) {
        console.warn('⚠️ [PlansTableSetup] No se pudo obtener columnas via RPC, usando método alternativo');
        // Método alternativo: intentar insertar un registro temporal para ver qué columnas existen
        return await this.getColumnsViaTestInsert();
      }

      return data?.map((col: any) => col.column_name) || [];
    } catch (error) {
      console.warn('⚠️ [PlansTableSetup] Error obteniendo columnas:', error);
      return await this.getColumnsViaTestInsert();
    }
  }

  /**
   * Método alternativo para obtener columnas mediante inserción de prueba
   */
  private async getColumnsViaTestInsert(): Promise<string[]> {
    // Columnas básicas que sabemos que existen
    const basicColumns = ['id', 'name', 'description', 'price', 'currency', 'duration_days', 'duration_hours', 'is_active', 'is_popular', 'color', 'created_at', 'updated_at'];
    
    // Intentar insertar con columnas adicionales para ver cuáles existen
    const testColumns = ['plan_key', 'paypal_link', 'price_usd', 'discount_percentage', 'credits', 'features', 'benefits'];
    const existingColumns = [...basicColumns];

    for (const col of testColumns) {
      try {
        // Crear un objeto de prueba con esta columna
        const testData: any = {
          name: 'test_column_check',
          description: 'test',
          price: 1,
          currency: 'USD',
          duration_days: 1,
          duration_hours: 24,
          is_active: true,
          is_popular: false,
          color: 'blue'
        };
        
        // Agregar la columna de prueba
        if (col === 'plan_key') testData.plan_key = 'test_key';
        else if (col === 'paypal_link') testData.paypal_link = 'test_link';
        else if (col === 'price_usd') testData.price_usd = 1;
        else if (col === 'discount_percentage') testData.discount_percentage = '0';
        else if (col === 'credits') testData.credits = 0;
        else if (col === 'features') testData.features = [];
        else if (col === 'benefits') testData.benefits = [];

        // Intentar insertar
        const { error } = await supabase
          .from('subscription_plans')
          .insert([testData])
          .select()
          .limit(1);

        if (!error) {
          existingColumns.push(col);
          // Eliminar el registro de prueba
          await supabase
            .from('subscription_plans')
            .delete()
            .eq('name', 'test_column_check');
        }
      } catch (error) {
        // La columna no existe o hay otro error
        console.log(`ℹ️ [PlansTableSetup] Columna ${col} no existe o hay error:`, error);
      }
    }

    return existingColumns;
  }

  /**
   * Agrega una columna a la tabla subscription_plans
   */
  private async addColumn(): Promise<void> {
    // Deshabilitado: no hacer inserts de prueba que violan RLS
    return;
  }

  /**
   * Crea restricción única en plan_key
   */
  private async createUniqueConstraint(): Promise<void> {
    // Esto también lo manejamos a nivel de aplicación ya que no podemos ejecutar DDL
    console.log('ℹ️ [PlansTableSetup] Restricción única se manejará a nivel de aplicación');
  }

  /**
   * Verifica si la tabla está configurada correctamente
   */
  async verifyTableSetup(): Promise<boolean> {
    try {
      const existingColumns = await this.getExistingColumns();
      const requiredColumns = ['plan_key', 'paypal_link', 'price_usd', 'discount_percentage', 'credits', 'features', 'benefits'];
      
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ [PlansTableSetup] Tabla configurada correctamente');
        return true;
      } else {
        console.log('⚠️ [PlansTableSetup] Faltan columnas:', missingColumns);
        return false;
      }
    } catch (error) {
      console.error('❌ [PlansTableSetup] Error verificando configuración:', error);
      return false;
    }
  }
}

// Instancia singleton
export const plansTableSetup = PlansTableSetupService.getInstance();


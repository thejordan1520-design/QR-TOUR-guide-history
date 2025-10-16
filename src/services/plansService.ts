// Servicio unificado para gestión de planes premium
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // en horas para SubscribePage
  duration_days: number; // en días
  features: string[];
  benefits: string[];
  is_active: boolean;
  is_popular: boolean;
  color: string; // para SubscribePage
  created_at: string;
  updated_at?: string;
  user_count?: number;
  revenue?: number;
}

// Planes por defecto
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'basic-24h',
    name: 'Acceso Básico',
    description: 'Acceso completo por 24 horas a todos los tours de audio',
    price: 5,
    currency: 'USD',
    duration: 24, // 24 horas
    duration_days: 1, // 1 día
    features: [
      'Acceso completo por 24 horas',
      'Todos los tours disponibles',
      'Audio de alta calidad',
      'Soporte WhatsApp',
      'Acceso desde cualquier dispositivo'
    ],
    benefits: [
      'Acceso ilimitado por 24 horas',
      'Todos los audios premium',
      'Soporte técnico incluido'
    ],
    is_active: true,
    is_popular: true,
    color: 'blue',
    created_at: new Date().toISOString(),
    user_count: 0,
    revenue: 0
  },
  {
    id: 'premium-7d',
    name: 'Plan Semanal',
    description: 'Acceso semanal por 7 días con beneficios adicionales',
    price: 15,
    currency: 'USD',
    duration: 168, // 7 días * 24 horas
    duration_days: 7,
    features: [
      'Acceso completo por 7 días',
      'Todos los tours disponibles',
      'Audio de alta calidad',
      'Soporte prioritario',
      'Descarga offline',
      'Acceso desde cualquier dispositivo'
    ],
    benefits: [
      'Acceso ilimitado por 7 días',
      'Descarga para uso offline',
      'Soporte prioritario 24/7',
      'Contenido exclusivo'
    ],
    is_active: true,
    is_popular: false,
    color: 'green',
    created_at: new Date().toISOString(),
    user_count: 0,
    revenue: 0
  }
];

class PlansService {
  private plans: Plan[] = [...DEFAULT_PLANS];

  // Obtener todos los planes
  getAllPlans(): Plan[] {
    return this.plans.filter(plan => plan.is_active);
  }


  // Obtener plan por ID
  getPlanById(id: string): Plan | undefined {
    return this.plans.find(plan => plan.id === id);
  }

  // Crear nuevo plan
  createPlan(planData: Omit<Plan, 'id' | 'created_at' | 'updated_at' | 'user_count' | 'revenue'>): Plan {
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_count: 0,
      revenue: 0
    };

    this.plans.push(newPlan);
    this.saveToLocalStorage();
    return newPlan;
  }

  // Actualizar plan
  updatePlan(id: string, planData: Partial<Plan>): Plan | null {
    const planIndex = this.plans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return null;

    const updatedPlan = {
      ...this.plans[planIndex],
      ...planData,
      id, // Mantener el ID original
      updated_at: new Date().toISOString()
    };

    this.plans[planIndex] = updatedPlan;
    this.saveToLocalStorage();
    return updatedPlan;
  }

  // Eliminar plan
  deletePlan(id: string): boolean {
    const planIndex = this.plans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return false;

    this.plans.splice(planIndex, 1);
    this.saveToLocalStorage();
    return true;
  }

  // Obtener estadísticas
  getStats() {
    const activePlans = this.plans.filter(plan => plan.is_active);
    const totalRevenue = this.plans.reduce((sum, plan) => sum + (plan.revenue || 0), 0);
    const totalUsers = this.plans.reduce((sum, plan) => sum + (plan.user_count || 0), 0);
    const averagePrice = activePlans.length > 0 
      ? activePlans.reduce((sum, plan) => sum + plan.price, 0) / activePlans.length 
      : 0;

    return {
      totalPlans: this.plans.length,
      activePlans: activePlans.length,
      totalUsers,
      totalRevenue,
      averagePrice
    };
  }

  // Guardar en localStorage para persistencia
  private saveToLocalStorage() {
    try {
      localStorage.setItem('qr-tour-plans', JSON.stringify(this.plans));
    } catch (error) {
      console.error('Error saving plans to localStorage:', error);
    }
  }

  // Cargar desde localStorage
  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('qr-tour-plans');
      if (saved) {
        const parsedPlans = JSON.parse(saved);
        // Verificar si los planes guardados tienen la estructura antigua (4 planes)
        const hasOldStructure = parsedPlans.some((p: Plan) => p.id === 'pro-30d' || p.id === 'enterprise-365d');
        
        if (hasOldStructure) {
          // Si tiene la estructura antigua, limpiar localStorage y usar solo los planes por defecto
          localStorage.removeItem('qr-tour-plans');
          this.plans = [...DEFAULT_PLANS];
          this.saveToLocalStorage(); // Guardar la nueva estructura
        } else {
          // Merge con planes por defecto para asegurar que siempre tengamos los planes básicos
          const defaultIds = DEFAULT_PLANS.map(p => p.id);
          const savedPlans = parsedPlans.filter((p: Plan) => !defaultIds.includes(p.id));
          this.plans = [...DEFAULT_PLANS, ...savedPlans];
        }
      } else {
        // Si no hay datos guardados, usar solo los planes por defecto
        this.plans = [...DEFAULT_PLANS];
      }
    } catch (error) {
      console.error('Error loading plans from localStorage:', error);
      this.plans = [...DEFAULT_PLANS];
    }
  }

  // Resetear planes a los valores por defecto
  resetToDefaults() {
    this.plans = [...DEFAULT_PLANS];
    this.saveToLocalStorage();
  }

  // Limpiar localStorage y recargar
  clearCache() {
    localStorage.removeItem('qr-tour-plans');
    this.plans = [...DEFAULT_PLANS];
    this.saveToLocalStorage();
  }

  // Inicializar servicio
  constructor() {
    this.loadFromLocalStorage();
  }
}

// Instancia singleton del servicio
export const plansService = new PlansService();

// Funciones de utilidad para conversión entre formatos
export const convertPlanForSubscribePage = (plan: Plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  duration: plan.duration,
  features: plan.features,
  popular: plan.is_popular,
  color: plan.color
});


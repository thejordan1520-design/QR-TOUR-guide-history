// Servicio unificado para gestión de planes premium con traducciones
import i18n from '../i18n';

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
  color: string;
  created_at: string;
  updated_at: string;
  user_count: number;
  revenue: number;
}

// Función para obtener traducciones
const t = (key: string): string => {
  return i18n.t(key);
};

// Planes por defecto con traducciones
const getDefaultPlans = (): Plan[] => [
  {
    id: 'basic-24h',
    name: t('plans.names.basic_24h'),
    description: t('plans.descriptions.basic_24h'),
    price: 5,
    currency: 'USD',
    duration: 24, // 24 horas
    duration_days: 1, // 1 día
    features: [
      t('plans.features.full_access_24h'),
      t('plans.features.all_tours_available'),
      t('plans.features.high_quality_audio'),
      t('plans.features.whatsapp_support'),
      t('plans.features.any_device_access')
    ],
    benefits: [
      t('plans.features.unlimited_access_24h'),
      t('plans.features.all_premium_audios'),
      t('plans.features.technical_support_included')
    ],
    is_active: true,
    is_popular: true,
    color: 'blue',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_count: 0,
    revenue: 0
  },
  {
    id: 'premium-7d',
    name: t('plans.names.premium_7d'),
    description: t('plans.descriptions.premium_7d'),
    price: 15,
    currency: 'USD',
    duration: 168, // 7 días * 24 horas
    duration_days: 7,
    features: [
      t('plans.features.full_access_1_week'),
      t('plans.features.all_tours_available'),
      t('plans.features.high_quality_audio'),
      t('plans.features.priority_support'),
      t('plans.features.offline_download'),
      t('plans.features.any_device_access')
    ],
    benefits: [
      t('plans.features.unlimited_access_7d'),
      t('plans.features.offline_usage'),
      t('plans.features.priority_support_24_7_alt'),
      t('plans.features.exclusive_content')
    ],
    is_active: true,
    is_popular: false,
    color: 'green',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_count: 0,
    revenue: 0
  },
  {
    id: 'premium-30d',
    name: t('plans.names.premium_30d'),
    description: t('plans.descriptions.premium_30d'),
    price: 45,
    currency: 'USD',
    duration: 720, // 30 días * 24 horas
    duration_days: 30,
    features: [
      t('plans.features.full_access_1_month'),
      t('plans.features.all_tours_available'),
      t('plans.features.high_quality_audio'),
      t('plans.features.priority_support_24_7'),
      t('plans.features.offline_downloads'),
      t('plans.features.any_device_access'),
      t('plans.features.exclusive_content')
    ],
    benefits: [
      t('plans.features.unlimited_access_7d'),
      t('plans.features.offline_downloads'),
      t('plans.features.priority_support_24_7'),
      t('plans.features.exclusive_content'),
      t('plans.features.tour_guide_panel'),
      t('plans.features.usage_statistics')
    ],
    is_active: true,
    is_popular: true,
    color: 'purple',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_count: 0,
    revenue: 0
  },
  {
    id: 'premium-365d',
    name: t('plans.names.premium_365d'),
    description: t('plans.descriptions.premium_365d'),
    price: 120,
    currency: 'USD',
    duration: 8760, // 365 días * 24 horas
    duration_days: 365,
    features: [
      t('plans.features.full_access_1_year'),
      t('plans.features.all_tours_available'),
      t('plans.features.high_quality_audio'),
      t('plans.features.vip_support_24_7'),
      t('plans.features.offline_downloads'),
      t('plans.features.any_device_access'),
      t('plans.features.exclusive_content'),
      t('plans.features.tour_guide_panel'),
      t('plans.features.usage_statistics'),
      t('plans.features.educational_material')
    ],
    benefits: [
      t('plans.features.unlimited_access_7d'),
      t('plans.features.offline_downloads'),
      t('plans.features.vip_support_24_7'),
      t('plans.features.exclusive_content'),
      t('plans.features.tour_guide_panel'),
      t('plans.features.usage_statistics'),
      t('plans.features.educational_material'),
      t('plans.features.personalized_sessions'),
      t('plans.features.official_certifications')
    ],
    is_active: true,
    is_popular: false,
    color: 'gold',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_count: 0,
    revenue: 0
  }
];

class PlansService {
  private plans: Plan[] = [];

  constructor() {
    this.loadPlans();
  }

  // Cargar planes con traducciones actualizadas
  private loadPlans() {
    this.plans = getDefaultPlans();
    this.saveToLocalStorage();
  }

  // Recargar planes cuando cambie el idioma
  reloadPlans() {
    this.loadPlans();
  }

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

  // Guardar en localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem('qr_tour_plans', JSON.stringify(this.plans));
    } catch (error) {
      console.error('Error saving plans to localStorage:', error);
    }
  }

  // Cargar desde localStorage
  private loadFromLocalStorage(): Plan[] {
    try {
      const stored = localStorage.getItem('qr_tour_plans');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading plans from localStorage:', error);
    }
    return [];
  }

  // Obtener estadísticas de planes
  getPlansStats() {
    const activePlans = this.plans.filter(plan => plan.is_active);
    const totalRevenue = this.plans.reduce((sum, plan) => sum + plan.revenue, 0);
    const totalUsers = this.plans.reduce((sum, plan) => sum + plan.user_count, 0);

    return {
      totalPlans: this.plans.length,
      activePlans: activePlans.length,
      totalRevenue,
      totalUsers,
      popularPlans: this.plans.filter(plan => plan.is_popular)
    };
  }

  // Buscar planes
  searchPlans(query: string): Plan[] {
    const lowercaseQuery = query.toLowerCase();
    return this.plans.filter(plan => 
      plan.name.toLowerCase().includes(lowercaseQuery) ||
      plan.description.toLowerCase().includes(lowercaseQuery) ||
      plan.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Obtener planes por precio
  getPlansByPriceRange(min: number, max: number): Plan[] {
    return this.plans.filter(plan => plan.price >= min && plan.price <= max);
  }

  // Obtener planes populares
  getPopularPlans(): Plan[] {
    return this.plans.filter(plan => plan.is_popular && plan.is_active);
  }

  // Incrementar contador de usuarios
  incrementUserCount(planId: string): boolean {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return false;

    plan.user_count += 1;
    plan.revenue += plan.price;
    plan.updated_at = new Date().toISOString();
    this.saveToLocalStorage();
    return true;
  }
}

// Instancia singleton
const plansService = new PlansService();

// Escuchar cambios de idioma para recargar planes
i18n.on('languageChanged', () => {
  plansService.reloadPlans();
});

export default plansService;

import { supabasePublic } from './lib/supabase'

// ============================================
// FUNCIONES PARA TABLAS DE DATOS
// ============================================

// ========== USUARIOS ==========
export const userService = {
  // Obtener todos los usuarios
  async getAllUsers() {
    const { data, error } = await supabasePublic
      .from('user')
      .select('*')
    return { data, error }
  },

  // Obtener usuario por ID
  async getUserById(id) {
    const { data, error } = await supabasePublic
      .from('user')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Obtener usuario por email
  async getUserByEmail(email) {
    const { data, error } = await supabasePublic
      .from('user')
      .select('*')
      .eq('email', email)
      .single()
    return { data, error }
  },

  // Crear nuevo usuario
  async createUser(userData) {
    const { data, error } = await supabasePublic
      .from('user')
      .insert([userData])
      .select()
    return { data, error }
  },

  // Actualizar usuario
  async updateUser(id, userData) {
    const { data, error } = await supabasePublic
      .from('user')
      .update(userData)
      .eq('id', id)
      .select()
    return { data, error }
  }
}

// ========== SUSCRIPCIONES DE USUARIOS ==========
export const userSubscriptionsService = {
  // Obtener todas las suscripciones
  async getAllSubscriptions() {
    const { data, error } = await supabasePublic
      .from('user_subscriptions')
      .select('*')
    return { data, error }
  },

  // Obtener suscripción por ID
  async getSubscriptionById(id) {
    const { data, error } = await supabasePublic
      .from('user_subscriptions')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Obtener suscripciones por usuario
  async getSubscriptionsByUser(userId) {
    const { data, error } = await supabasePublic
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
    return { data, error }
  },

  // Obtener suscripción activa del usuario
  async getActiveSubscriptionByUser(userId) {
    const { data, error } = await supabasePublic
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    return { data, error }
  },

  // Crear nueva suscripción
  async createSubscription(subscriptionData) {
    const { data, error } = await supabasePublic
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
    return { data, error }
  },

  // Actualizar suscripción
  async updateSubscription(id, subscriptionData) {
    const { data, error } = await supabasePublic
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select()
    return { data, error }
  }
}

// ========== PLANES DE SUSCRIPCIÓN ==========
export const subscriptionPlansService = {
  // Obtener todos los planes
  async getAllPlans() {
    const { data, error } = await supabasePublic
      .from('subscription_plans')
      .select('*')
    return { data, error }
  },

  // Obtener plan por ID
  async getPlanById(id) {
    const { data, error } = await supabasePublic
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  }
}

// ========== PAGOS ==========
export const paymentsService = {
  // Obtener todos los pagos
  async getAllPayments() {
    const { data, error } = await supabasePublic
      .from('payments')
      .select('*')
    return { data, error }
  },

  // Obtener pagos por usuario
  async getPaymentsByUser(userId) {
    const { data, error } = await supabasePublic
      .from('payments')
      .select('*')
      .eq('user_id', userId)
    return { data, error }
  },

  // Obtener pago por ID
  async getPaymentById(id) {
    const { data, error } = await supabasePublic
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Crear nuevo pago
  async createPayment(paymentData) {
    const { data, error } = await supabasePublic
      .from('payments')
      .insert([paymentData])
      .select()
    return { data, error }
  },

  // Actualizar estado de pago
  async updatePaymentStatus(id, status) {
    const { data, error } = await supabasePublic
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
    return { data, error }
  }
}

// ========== DESTINOS/LUGARES ==========
export const destinationsService = {
  // Obtener todos los destinos
  async getAllDestinations() {
    const { data, error } = await supabasePublic
      .from('destinations')
      .select('*')
    return { data, error }
  },

  // Obtener destino por ID
  async getDestinationById(id) {
    const { data, error } = await supabasePublic
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Obtener destinos populares
  async getPopularDestinations(limit = 10) {
    const { data, error } = await supabasePublic
      .from('destinations')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit)
    return { data, error }
  },

  // Obtener destinos por categoría
  async getDestinationsByCategory(category) {
    const { data, error } = await supabasePublic
      .from('destinations')
      .select('*')
      .eq('category', category)
    return { data, error }
  }
}

// ========== CÓDIGOS QR ==========
export const qrCodesService = {
  // Obtener todos los códigos QR
  async getAllQRCodes() {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
    return { data, error }
  },

  // Obtener código QR por ID
  async getQRCodeById(id) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Obtener códigos QR por lugar
  async getQRCodesByPlace(placeId) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('place_id', placeId)
    return { data, error }
  },

  // Obtener código QR por código
  async getQRCodeByCode(code) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', code)
      .single()
    return { data, error }
  },

  // Crear nuevo código QR
  async createQRCode(qrData) {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([qrData])
      .select()
    return { data, error }
  }
}

// ========== ESCANEOS ==========
export const scansService = {
  // Obtener todos los escaneos
  async getAllScans() {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
    return { data, error }
  },

  // Obtener escaneos por usuario
  async getScansByUser(userId) {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
    return { data, error }
  }
}

// ========== TEXTOS WEB ==========
export const webTextsService = {
  // Obtener todos los textos web
  async getAllWebTexts() {
    const { data, error } = await supabase
      .from('web_texts')
      .select('*')
    return { data, error }
  },

  // Obtener texto web por clave
  async getWebTextByKey(key) {
    const { data, error } = await supabase
      .from('web_texts')
      .select('*')
      .eq('key', key)
      .single()
    return { data, error }
  },

  // Obtener textos web por idioma
  async getWebTextsByLanguage(language) {
    const { data, error } = await supabase
      .from('web_texts')
      .select('*')
      .eq('language', language)
    return { data, error }
  }
}

// ========== COLABORADORES ==========
export const collaboratorsService = {
  // Obtener todos los colaboradores
  async getAllCollaborators() {
    const { data, error } = await supabase
      .from('collaborators')
      .select('*')
    return { data, error }
  },

  // Obtener colaborador por ID
  async getCollaboratorById(id) {
    const { data, error } = await supabase
      .from('collaborators')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  }
}

// ========== VERSIONES DE TEXTO ==========
export const textVersionsService = {
  // Obtener todas las versiones de texto
  async getAllTextVersions() {
    const { data, error } = await supabase
      .from('text_versions')
      .select('*')
    return { data, error }
  }
}

// ========== PAGOS DE COLABORADORES ==========
export const collaboratorPaymentsService = {
  // Obtener todos los pagos de colaboradores
  async getAllCollaboratorPayments() {
    const { data, error } = await supabase
      .from('collaborator_payments')
      .select('*')
    return { data, error }
  }
}

// ============================================
// FUNCIONES PARA STORAGE
// ============================================

export const storageService = {
  // Subir archivo
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  // Descargar archivo
  async downloadFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    return { data, error }
  },

  // Obtener URL pública
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Obtener URL firmada (con expiración)
  async getSignedUrl(bucket, path, expiresIn = 60) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    return { data, error }
  },

  // Obtener URL de imagen
  async getImageUrl(imagePath) {
    if (!imagePath) return { publicUrl: '/places/placeholder.jpg' }
    
    const { data, error } = await supabase.storage
      .from('destination-images')
      .getPublicUrl(imagePath)
    
    return { publicUrl: data.publicUrl, error }
  },

  // Obtener URL de audio
  async getAudioUrl(audioPath) {
    if (!audioPath) return { publicUrl: null }
    
    const { data, error } = await supabase.storage
      .from('destination-audio')
      .getPublicUrl(audioPath)
    
    return { publicUrl: data.publicUrl, error }
  }
}

// ========== ANUNCIOS/PUBLICIDAD ==========
export const advertisementsService = {
  // Obtener todos los anuncios activos
  async getActiveAdvertisements() {
    const { data, error } = await supabasePublic
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
    return { data, error }
  },

  // Obtener anuncios por idioma
  async getAdvertisementsByLanguage(language = 'es') {
    const { data, error } = await supabasePublic
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
    return { data, error }
  },

  // Obtener anuncios por sección
  async getAdvertisementsBySection(section) {
    const { data, error } = await supabasePublic
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .contains('target_sections', [section])
    return { data, error }
  }
}

// ========== CONFIGURACIONES DE APP ==========
export const appSettingsService = {
  // Obtener todas las configuraciones
  async getAllSettings() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
    return { data, error }
  },

  // Obtener configuración por clave
  async getSettingByKey(key) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('setting_key', key)
      .single()
    return { data, error }
  },

  // Obtener configuraciones por tipo
  async getSettingsByType(type) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('setting_type', type)
    return { data, error }
  }
}

// ========== AVATARES/COLECCIONABLES ==========
export const avatarCollectiblesService = {
  // Obtener todos los coleccionables disponibles
  async getAvailableCollectibles() {
    const { data, error } = await supabase
      .from('avatar_collectibles')
      .select('*')
      .eq('is_available', true)
      .order('price', { ascending: true })
    return { data, error }
  },

  // Obtener coleccionables por rareza
  async getCollectiblesByRarity(rarity) {
    const { data, error } = await supabase
      .from('avatar_collectibles')
      .select('*')
      .eq('rarity', rarity)
      .eq('is_available', true)
    return { data, error }
  },

  // Obtener coleccionable por ID
  async getCollectibleById(id) {
    const { data, error } = await supabase
      .from('avatar_collectibles')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  }
}

// ========== INSIGNIAS/LOGROS ==========
export const badgesService = {
  // Obtener todas las insignias activas
  async getActiveBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('requirement_value', { ascending: true })
    return { data, error }
  },

  // Obtener insignias por tipo de requisito
  async getBadgesByRequirementType(type) {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('requirement_type', type)
      .eq('is_active', true)
    return { data, error }
  },

  // Obtener insignias por rareza
  async getBadgesByRarity(rarity) {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('rarity', rarity)
      .eq('is_active', true)
    return { data, error }
  }
}

// ========== ADMINISTRADORES ==========
export const adminUsersService = {
  // Obtener todos los administradores
  async getAllAdmins() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Obtener administrador por ID
  async getAdminById(id) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Obtener administradores por rol
  async getAdminsByRole(role) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', role)
    return { data, error }
  },

  // Obtener super administradores
  async getSuperAdmins() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('is_super_admin', true)
    return { data, error }
  }
}

// ========== MÉTRICAS DE ADS ==========
export const adMetricsService = {
  // Obtener métricas por usuario
  async getMetricsByUser(userId) {
    const { data, error } = await supabase
      .from('ad_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Obtener métricas por anuncio
  async getMetricsByAd(adId) {
    const { data, error } = await supabase
      .from('ad_metrics')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Obtener métricas por tipo de evento
  async getMetricsByEventType(eventType) {
    const { data, error } = await supabase
      .from('ad_metrics')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// ============================================
// FUNCIONES PARA AUTH
// ============================================

export const authService = {
  // Login con email y contraseña
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Registro con email y contraseña
  async register(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Obtener sesión actual
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

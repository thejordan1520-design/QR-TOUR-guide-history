// Servicio de emergencia para notificaciones que siempre funciona
interface EmergencyNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback' | 'reservation' | 'payment';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

class EmergencyNotificationService {
  private notifications: EmergencyNotification[] = [];
  private listeners: Array<(notifications: EmergencyNotification[]) => void> = [];
  private lastNotifiedNotifications: EmergencyNotification[] = [];

  constructor() {
    // Inicializar con notificaciones de ejemplo
    this.initializeNotifications();
  }

  private initializeNotifications() {
    this.notifications = [
      {
        id: 'emergency-system',
        type: 'info',
        title: 'Sistema de Notificaciones',
        message: 'El sistema de notificaciones está funcionando en modo de emergencia. Todas las funcionalidades principales están disponibles.',
        is_read: false,
        created_at: new Date().toISOString(),
        metadata: { emergency: true, priority: 'high' }
      },
      {
        id: 'emergency-app',
        type: 'success',
        title: 'Aplicación Estable',
        message: 'La aplicación está funcionando correctamente. El frontend público está protegido contra fallos.',
        is_read: false,
        created_at: new Date().toISOString(),
        metadata: { emergency: true, priority: 'high' }
      }
    ];
  }

  // Obtener todas las notificaciones
  getNotifications(): EmergencyNotification[] {
    return [...this.notifications];
  }

  // Obtener notificaciones no leídas
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  // Marcar como leída
  markAsRead(notificationId: string): void {
    this.notifications = this.notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    this.notifyListeners();
  }

  // Eliminar notificación
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  // Crear nueva notificación
  createNotification(notification: Omit<EmergencyNotification, 'id' | 'created_at' | 'is_read'>): void {
    const newNotification: EmergencyNotification = {
      ...notification,
      id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  // Suscribirse a cambios
  subscribe(listener: (notifications: EmergencyNotification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Devolver función para desuscribirse
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notificar a todos los listeners solo si hay cambios reales
  private notifyListeners(): void {
    // Solo notificar si realmente hay cambios
    if (!this.hasChanged(this.lastNotifiedNotifications, this.notifications)) {
      return;
    }

    this.lastNotifiedNotifications = [...this.notifications];
    
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error notificando listener:', error);
      }
    });
  }

  // Verificar si hay cambios reales antes de notificar
  private hasChanged(oldNotifications: EmergencyNotification[], newNotifications: EmergencyNotification[]): boolean {
    if (oldNotifications.length !== newNotifications.length) return true;
    
    return oldNotifications.some((old, index) => {
      const current = newNotifications[index];
      return !current || old.id !== current.id || old.is_read !== current.is_read;
    });
  }

  // Crear notificación de reserva (para cuando se crean reservas)
  createReservationNotification(data: {
    userName: string;
    excursionName: string;
    date: string;
    time: string;
    participants: number;
  }): void {
    this.createNotification({
      type: 'reservation',
      title: 'Nueva Reservación',
      message: `${data.userName} ha reservado "${data.excursionName}" para ${data.date} a las ${data.time}. Participantes: ${data.participants}`,
      metadata: {
        reservation: true,
        userName: data.userName,
        excursionName: data.excursionName,
        date: data.date,
        time: data.time,
        participants: data.participants
      }
    });
  }

  // Crear notificación de pago
  createPaymentNotification(data: {
    userName: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
  }): void {
    const statusText = {
      pending: 'pendiente',
      paid: 'confirmado',
      failed: 'fallido'
    }[data.status];

    this.createNotification({
      type: data.status === 'paid' ? 'success' : data.status === 'failed' ? 'error' : 'info',
      title: `Pago ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message: `Pago de $${data.amount} ${statusText} para ${data.userName}`,
      metadata: {
        payment: true,
        userName: data.userName,
        amount: data.amount,
        status: data.status
      }
    });
  }
}

// Exportar instancia única
export const emergencyNotificationService = new EmergencyNotificationService();
export default emergencyNotificationService;

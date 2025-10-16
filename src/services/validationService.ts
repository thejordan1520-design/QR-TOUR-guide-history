import { supabase } from '../lib/supabase';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UserValidationData {
  email: string;
  password: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface ReservationValidationData {
  name: string;
  email: string;
  phone: string;
  excursion_id: string;
  date: string;
  time: string;
  participants: number;
  special_requests?: string;
}

export interface PaymentValidationData {
  amount: number;
  currency: string;
  plan_id: string;
  user_id: string;
  payment_method: 'paypal' | 'stripe';
  transaction_id?: string;
}

class ValidationService {
  private async callValidationFunction<T>(
    functionName: string,
    data: T
  ): Promise<ValidationResult> {
    try {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: { [functionName.replace('validate-', '') + 'Data']: data }
      });

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        return {
          isValid: false,
          errors: ['Error de conexión con el servidor de validación']
        };
      }

      return result as ValidationResult;
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      return {
        isValid: false,
        errors: ['Error interno del servidor']
      };
    }
  }

  async validateUser(userData: UserValidationData): Promise<ValidationResult> {
    return this.callValidationFunction('validate-user', userData);
  }

  async validateReservation(reservationData: ReservationValidationData): Promise<ValidationResult> {
    return this.callValidationFunction('validate-reservation', reservationData);
  }

  async validatePayment(paymentData: PaymentValidationData): Promise<ValidationResult> {
    return this.callValidationFunction('validate-payment', paymentData);
  }

  // Validaciones del lado del cliente (fallback)
  validateEmail(email: string): string[] {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email es requerido');
      return errors;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email debe tener un formato válido');
    }
    
    if (email.length > 254) {
      errors.push('Email no puede exceder 254 caracteres');
    }
    
    return errors;
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Contraseña es requerida');
      return errors;
    }
    
    if (password.length < 8) {
      errors.push('Contraseña debe tener al menos 8 caracteres');
    }
    
    if (password.length > 128) {
      errors.push('Contraseña no puede exceder 128 caracteres');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) {
      errors.push('Contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!hasLowerCase) {
      errors.push('Contraseña debe contener al menos una letra minúscula');
    }
    
    if (!hasNumbers) {
      errors.push('Contraseña debe contener al menos un número');
    }
    
    if (!hasSpecialChar) {
      errors.push('Contraseña debe contener al menos un carácter especial');
    }
    
    return errors;
  }

  validatePhone(phone: string): string[] {
    const errors: string[] = [];
    
    if (!phone) {
      errors.push('Teléfono es requerido');
      return errors;
    }
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Teléfono debe tener un formato válido');
    }
    
    if (phone.length < 7) {
      errors.push('Teléfono debe tener al menos 7 dígitos');
    }
    
    if (phone.length > 20) {
      errors.push('Teléfono no puede exceder 20 caracteres');
    }
    
    return errors;
  }

  validateName(name: string): string[] {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Nombre es requerido');
      return errors;
    }
    
    if (name.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
    
    if (name.length > 100) {
      errors.push('Nombre no puede exceder 100 caracteres');
    }
    
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name)) {
      errors.push('Nombre solo puede contener letras y espacios');
    }
    
    return errors;
  }

  validateAmount(amount: number): string[] {
    const errors: string[] = [];
    
    if (!amount || amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
      return errors;
    }
    
    if (!Number.isFinite(amount)) {
      errors.push('El monto debe ser un número válido');
      return errors;
    }
    
    if (amount < 0.01) {
      errors.push('El monto mínimo es $0.01');
    }
    
    if (amount > 10000) {
      errors.push('El monto máximo es $10,000');
    }
    
    if (amount % 0.01 !== 0) {
      errors.push('El monto no puede tener más de 2 decimales');
    }
    
    return errors;
  }

  // Validación rápida del lado del cliente
  quickValidateUser(userData: UserValidationData): ValidationResult {
    const errors: string[] = [];
    
    errors.push(...this.validateEmail(userData.email));
    errors.push(...this.validatePassword(userData.password));
    
    if (userData.full_name) {
      errors.push(...this.validateName(userData.full_name));
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  quickValidateReservation(reservationData: ReservationValidationData): ValidationResult {
    const errors: string[] = [];
    
    errors.push(...this.validateName(reservationData.name));
    errors.push(...this.validateEmail(reservationData.email));
    errors.push(...this.validatePhone(reservationData.phone));
    
    if (!reservationData.excursion_id) {
      errors.push('ID de excursión es requerido');
    }
    
    if (!reservationData.date) {
      errors.push('Fecha es requerida');
    }
    
    if (!reservationData.time) {
      errors.push('Hora es requerida');
    }
    
    if (!reservationData.participants || reservationData.participants < 1) {
      errors.push('Debe haber al menos 1 participante');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const validationService = new ValidationService();
export default validationService;

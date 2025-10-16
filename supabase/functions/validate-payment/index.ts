import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentData {
  amount: number
  currency: string
  plan_id: string
  user_id: string
  payment_method: 'paypal' | 'stripe'
  transaction_id?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

function validateAmount(amount: number): string[] {
  const errors: string[] = []
  
  if (!amount || amount <= 0) {
    errors.push('El monto debe ser mayor a 0')
    return errors
  }
  
  if (!Number.isFinite(amount)) {
    errors.push('El monto debe ser un número válido')
    return errors
  }
  
  if (amount < 0.01) {
    errors.push('El monto mínimo es $0.01')
  }
  
  if (amount > 10000) {
    errors.push('El monto máximo es $10,000')
  }
  
  // Verificar que no tenga más de 2 decimales
  if (amount % 0.01 !== 0) {
    errors.push('El monto no puede tener más de 2 decimales')
  }
  
  return errors
}

function validateCurrency(currency: string): string[] {
  const errors: string[] = []
  
  if (!currency) {
    errors.push('Moneda es requerida')
    return errors
  }
  
  const validCurrencies = ['USD', 'EUR', 'DOP', 'MXN', 'CAD']
  if (!validCurrencies.includes(currency.toUpperCase())) {
    errors.push('Moneda no soportada. Monedas válidas: USD, EUR, DOP, MXN, CAD')
  }
  
  return errors
}

function validatePlanId(planId: string): string[] {
  const errors: string[] = []
  
  if (!planId) {
    errors.push('ID de plan es requerido')
    return errors
  }
  
  if (typeof planId !== 'string') {
    errors.push('ID de plan debe ser una cadena de texto')
    return errors
  }
  
  if (planId.length < 1) {
    errors.push('ID de plan no puede estar vacío')
  }
  
  // Validar formato de UUID si es necesario
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(planId)) {
    errors.push('ID de plan debe tener formato UUID válido')
  }
  
  return errors
}

function validateUserId(userId: string): string[] {
  const errors: string[] = []
  
  if (!userId) {
    errors.push('ID de usuario es requerido')
    return errors
  }
  
  if (typeof userId !== 'string') {
    errors.push('ID de usuario debe ser una cadena de texto')
    return errors
  }
  
  if (userId.length < 1) {
    errors.push('ID de usuario no puede estar vacío')
  }
  
  return errors
}

function validatePaymentMethod(paymentMethod: string): string[] {
  const errors: string[] = []
  
  if (!paymentMethod) {
    errors.push('Método de pago es requerido')
    return errors
  }
  
  const validMethods = ['paypal', 'stripe']
  if (!validMethods.includes(paymentMethod.toLowerCase())) {
    errors.push('Método de pago no válido. Métodos válidos: paypal, stripe')
  }
  
  return errors
}

function validateTransactionId(transactionId?: string): string[] {
  const errors: string[] = []
  
  if (transactionId) {
    if (typeof transactionId !== 'string') {
      errors.push('ID de transacción debe ser una cadena de texto')
      return errors
    }
    
    if (transactionId.length < 1) {
      errors.push('ID de transacción no puede estar vacío')
    }
    
    if (transactionId.length > 100) {
      errors.push('ID de transacción no puede exceder 100 caracteres')
    }
  }
  
  return errors
}

function validatePaymentData(paymentData: PaymentData): ValidationResult {
  const errors: string[] = []
  
  // Validar campos requeridos
  errors.push(...validateAmount(paymentData.amount))
  errors.push(...validateCurrency(paymentData.currency))
  errors.push(...validatePlanId(paymentData.plan_id))
  errors.push(...validateUserId(paymentData.user_id))
  errors.push(...validatePaymentMethod(paymentData.payment_method))
  
  // Validar campos opcionales
  errors.push(...validateTransactionId(paymentData.transaction_id))
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentData } = await req.json()
    
    if (!paymentData) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          errors: ['Datos de pago no proporcionados'] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const validation = validatePaymentData(paymentData)
    
    return new Response(
      JSON.stringify(validation),
      { 
        status: validation.isValid ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error en validación de pago:', error)
    
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        errors: ['Error interno del servidor'] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReservationData {
  name: string
  email: string
  phone: string
  excursion_id: string
  date: string
  time: string
  participants: number
  special_requests?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

function validateEmail(email: string): string[] {
  const errors: string[] = []
  
  if (!email) {
    errors.push('Email es requerido')
    return errors
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('Email debe tener un formato válido')
  }
  
  return errors
}

function validatePhone(phone: string): string[] {
  const errors: string[] = []
  
  if (!phone) {
    errors.push('Teléfono es requerido')
    return errors
  }
  
  // Permitir diferentes formatos de teléfono
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Teléfono debe tener un formato válido')
  }
  
  if (phone.length < 7) {
    errors.push('Teléfono debe tener al menos 7 dígitos')
  }
  
  if (phone.length > 20) {
    errors.push('Teléfono no puede exceder 20 caracteres')
  }
  
  return errors
}

function validateName(name: string): string[] {
  const errors: string[] = []
  
  if (!name) {
    errors.push('Nombre es requerido')
    return errors
  }
  
  if (name.length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres')
  }
  
  if (name.length > 100) {
    errors.push('Nombre no puede exceder 100 caracteres')
  }
  
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  if (!nameRegex.test(name)) {
    errors.push('Nombre solo puede contener letras y espacios')
  }
  
  return errors
}

function validateDate(date: string): string[] {
  const errors: string[] = []
  
  if (!date) {
    errors.push('Fecha es requerida')
    return errors
  }
  
  const reservationDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (isNaN(reservationDate.getTime())) {
    errors.push('Fecha debe tener un formato válido')
    return errors
  }
  
  if (reservationDate < today) {
    errors.push('La fecha de reserva no puede ser en el pasado')
  }
  
  // No permitir reservas con más de 1 año de anticipación
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  
  if (reservationDate > oneYearFromNow) {
    errors.push('No se pueden hacer reservas con más de 1 año de anticipación')
  }
  
  return errors
}

function validateTime(time: string): string[] {
  const errors: string[] = []
  
  if (!time) {
    errors.push('Hora es requerida')
    return errors
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(time)) {
    errors.push('Hora debe tener formato HH:MM (24 horas)')
    return errors
  }
  
  const [hours, minutes] = time.split(':').map(Number)
  const timeInMinutes = hours * 60 + minutes
  
  // Horario de trabajo: 8:00 AM a 6:00 PM
  const startTime = 8 * 60 // 8:00 AM
  const endTime = 18 * 60 // 6:00 PM
  
  if (timeInMinutes < startTime || timeInMinutes > endTime) {
    errors.push('Las reservas solo están disponibles entre 8:00 AM y 6:00 PM')
  }
  
  return errors
}

function validateParticipants(participants: number): string[] {
  const errors: string[] = []
  
  if (!participants || participants < 1) {
    errors.push('Debe haber al menos 1 participante')
  }
  
  if (participants > 50) {
    errors.push('No se pueden reservar más de 50 participantes')
  }
  
  if (!Number.isInteger(participants)) {
    errors.push('El número de participantes debe ser un número entero')
  }
  
  return errors
}

function validateExcursionId(excursionId: string): string[] {
  const errors: string[] = []
  
  if (!excursionId) {
    errors.push('ID de excursión es requerido')
    return errors
  }
  
  if (typeof excursionId !== 'string') {
    errors.push('ID de excursión debe ser una cadena de texto')
    return errors
  }
  
  if (excursionId.length < 1) {
    errors.push('ID de excursión no puede estar vacío')
  }
  
  return errors
}

function validateSpecialRequests(specialRequests?: string): string[] {
  const errors: string[] = []
  
  if (specialRequests && specialRequests.length > 500) {
    errors.push('Las solicitudes especiales no pueden exceder 500 caracteres')
  }
  
  return errors
}

function validateReservationData(reservationData: ReservationData): ValidationResult {
  const errors: string[] = []
  
  // Validar campos requeridos
  errors.push(...validateName(reservationData.name))
  errors.push(...validateEmail(reservationData.email))
  errors.push(...validatePhone(reservationData.phone))
  errors.push(...validateExcursionId(reservationData.excursion_id))
  errors.push(...validateDate(reservationData.date))
  errors.push(...validateTime(reservationData.time))
  errors.push(...validateParticipants(reservationData.participants))
  
  // Validar campos opcionales
  errors.push(...validateSpecialRequests(reservationData.special_requests))
  
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
    const { reservationData } = await req.json()
    
    if (!reservationData) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          errors: ['Datos de reserva no proporcionados'] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const validation = validateReservationData(reservationData)
    
    return new Response(
      JSON.stringify(validation),
      { 
        status: validation.isValid ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error en validación de reserva:', error)
    
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

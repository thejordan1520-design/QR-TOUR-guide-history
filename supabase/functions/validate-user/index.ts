import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserData {
  email: string
  password: string
  full_name?: string
  first_name?: string
  last_name?: string
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
  
  if (email.length > 254) {
    errors.push('Email no puede exceder 254 caracteres')
  }
  
  return errors
}

function validatePassword(password: string): string[] {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Contraseña es requerida')
    return errors
  }
  
  if (password.length < 8) {
    errors.push('Contraseña debe tener al menos 8 caracteres')
  }
  
  if (password.length > 128) {
    errors.push('Contraseña no puede exceder 128 caracteres')
  }
  
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!hasUpperCase) {
    errors.push('Contraseña debe contener al menos una letra mayúscula')
  }
  
  if (!hasLowerCase) {
    errors.push('Contraseña debe contener al menos una letra minúscula')
  }
  
  if (!hasNumbers) {
    errors.push('Contraseña debe contener al menos un número')
  }
  
  if (!hasSpecialChar) {
    errors.push('Contraseña debe contener al menos un carácter especial')
  }
  
  return errors
}

function validateFullName(fullName: string): string[] {
  const errors: string[] = []
  
  if (!fullName) {
    errors.push('Nombre completo es requerido')
    return errors
  }
  
  if (fullName.length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres')
  }
  
  if (fullName.length > 100) {
    errors.push('Nombre no puede exceder 100 caracteres')
  }
  
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  if (!nameRegex.test(fullName)) {
    errors.push('Nombre solo puede contener letras y espacios')
  }
  
  return errors
}

function validateUserData(userData: UserData): ValidationResult {
  const errors: string[] = []
  
  // Validar email
  errors.push(...validateEmail(userData.email))
  
  // Validar contraseña
  errors.push(...validatePassword(userData.password))
  
  // Validar nombre completo si está presente
  if (userData.full_name) {
    errors.push(...validateFullName(userData.full_name))
  }
  
  // Validar nombres separados si están presentes
  if (userData.first_name) {
    errors.push(...validateFullName(userData.first_name))
  }
  
  if (userData.last_name) {
    errors.push(...validateFullName(userData.last_name))
  }
  
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
    const { userData } = await req.json()
    
    if (!userData) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          errors: ['Datos de usuario no proporcionados'] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const validation = validateUserData(userData)
    
    return new Response(
      JSON.stringify(validation),
      { 
        status: validation.isValid ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error en validación de usuario:', error)
    
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

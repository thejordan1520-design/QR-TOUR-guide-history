// Archivo de compatibilidad para migración gradual
// Este archivo mantiene la compatibilidad con el código existente
// mientras migramos a AuthContext

import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthContext';

// Re-exportar hooks con nombres compatibles
export { useAuth };
export const useSupabaseAuth = useAuth;

// Re-exportar el provider unificado con nombres compatibles
export { AuthProvider };
export const SupabaseAuthProvider = AuthProvider;

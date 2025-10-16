// Cliente Supabase específico para anuncios (sin autenticación)
import { createClient } from '@supabase/supabase-js';

// Variables de entorno directas
const SUPABASE_URL = 'https://nhegdlprktbtriwwhoms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZWdkbHBya3RidHJpd3dob21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODU5NTgsImV4cCI6MjA3Mjc2MTk1OH0.8shmGdoFCih9LKzUe7VQ1UdGIc2FCyuo6y8BCVKgKtk';

// Cliente específico para anuncios públicos (sin autenticación)
export const supabaseAds = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  }
});

console.log('✅ Cliente Supabase para anuncios creado (sin autenticación)');


import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import './styles/globals.css';
import './i18n';
import { WebTextsProvider } from './contexts/WebTextsContext';
import { disableServiceWorkerForAdmin } from './utils/disableServiceWorkerForAdmin';
import { disableServiceWorkerInDev } from './utils/disableServiceWorkerInDev';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

// ✅ FIX: Deshabilitar Service Worker en admin y DEV para evitar cache corrupto
disableServiceWorkerForAdmin();
disableServiceWorkerInDev();

// ✅ MIGRACIÓN: Limpiar OLD storage keys al inicio (solo una vez)
if (typeof window !== 'undefined') {
  const oldKeys = [
    'sb-nhegdlprktbtriwwhoms-auth-token',
    'supabase.auth.token'
  ];
  
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🧹 Migrando storage antiguo: ${key}`);
      localStorage.removeItem(key);
    }
  });
}

// ✅ FIX: Configurar QueryClient correctamente (evitar refetch en window focus)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // ✅ NO refetch al volver a la pestaña
      refetchOnReconnect: false,   // ✅ NO refetch al reconectar
      retry: 1,                     // ✅ Solo 1 reintento
      staleTime: 60000,             // ✅ Datos frescos por 60 segundos
      gcTime: 300000,               // ✅ Cache 5 minutos (antes cacheTime)
    },
  },
});

const root = document.getElementById('root');
ReactDOM.createRoot(root!).render(
  <GlobalErrorBoundary onError={(error, errorInfo) => {
    console.error('🚨 Error global capturado:', error, errorInfo);
  }}>
    <QueryClientProvider client={queryClient}>
      <WebTextsProvider>
        <App />
      </WebTextsProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

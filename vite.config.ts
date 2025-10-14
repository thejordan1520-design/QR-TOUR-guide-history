import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTargetRaw = env.VITE_API_URL || 'http://localhost:3003';
  // Normalizar target para evitar duplicar /api cuando la URL ya lo incluye
  const apiTarget = apiTargetRaw.replace(/\/api\/?$/, '');
  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: [
      'lucide-react'
    ],
  },
  server: {
    port: 3005,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      ignored: [
        'COPIAS',
        'copia*',
        'qrtourguidehistory copia*',
        'backup*',
        'node_modules/**',
        '.git/**',
        'dist/**'
      ]
    },
    // Optimizaciones para evitar caídas
    hmr: {
      overlay: false // Deshabilitar overlay de errores para evitar problemas
    },
    // Límites para evitar saturación
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['framer-motion', 'lucide-react'],
          i18n: ['react-i18next', 'i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Eliminar logs en producción
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
};
});

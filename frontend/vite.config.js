// vite.config.js - ✅ Production Level Configuration
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ==================== SERVER CONFIGURATION ====================
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // ==================== BUILD CONFIGURATION ====================
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@heroicons/react', 'lucide-react'],
          utils: ['axios', 'date-fns'],
          charts: ['recharts'],
          maps: ['react-google-maps'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  // ==================== RESOLVE ALIASES ====================
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@context': '/src/context',
      '@utils': '/src/utils',
      '@assets': '/src/assets',
    },
  },
  
  // ==================== CSS CONFIGURATION ====================
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // ==================== ENVIRONMENT VARIABLES ====================
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
  
  // ==================== OPTIMIZATION ====================
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  
  // ==================== ESBUILD ====================
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
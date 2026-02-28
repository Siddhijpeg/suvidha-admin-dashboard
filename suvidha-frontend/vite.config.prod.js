import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['lucide-react'],
          utils: ['axios', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  server: {
    host: true,
    port: 3000
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})

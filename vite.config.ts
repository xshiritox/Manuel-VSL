import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-vue-next'],
  },
})
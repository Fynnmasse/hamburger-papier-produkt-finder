import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['framer-motion'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          if (id.includes('framer-motion')) return 'vendor-framer'
          if (id.includes('@radix-ui')) return 'vendor-radix'
          if (id.includes('lucide-react')) return 'vendor-lucide'
        },
      },
    },
  },
})

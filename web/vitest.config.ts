import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    env: {
      VITE_API_URL: 'http://localhost:8000/api/v1',
    },
  },
  resolve: {
    alias: { '@': '/src' },
  },
})

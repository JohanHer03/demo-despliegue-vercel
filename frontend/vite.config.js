import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // En local, /api va al Spring Boot. En Vercel lo resuelven los rewrites de vercel.json.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})

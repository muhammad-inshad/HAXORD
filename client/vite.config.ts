import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite configuration with a development proxy for the backend API.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy all "/api" calls to the backend running on port 5000.
    // This avoids CORS issues during local development.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Preserve the original path (e.g., /api/user/cart) when forwarding.
        rewrite: (path) => path,
      },
    },
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                // target: 'http://13.60.230.32:8080', // AWS Production
                target: 'https://api-gateway-byj6.onrender.com', // Render Production
                // target: 'http://127.0.0.1:8080', // Local Docker
                changeOrigin: true
            }
        }
    }
})

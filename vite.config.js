import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5174
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html') // ejemplo de uso
      }
    }
  }
})

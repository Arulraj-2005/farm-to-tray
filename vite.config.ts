import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows access from other devices on the network
    port: 8080
  },
  define: {
    // Set default public URL for QR codes
    'import.meta.env.VITE_PUBLIC_BASE_URL': JSON.stringify('http://172.20.43.195:8080')
  }
})
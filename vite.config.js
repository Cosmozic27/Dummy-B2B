import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['4175-izxf44acmf7957o6lg78r-3242ebea.sg2.manus.computer'],
  },
})

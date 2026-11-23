import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', 'AITRIP_')
  const target = process.env.AITRIP_API_TARGET || env.AITRIP_API_TARGET || 'http://127.0.0.1:8000'
  return {
    plugins: [react(), tailwind()],
    server: { host: '0.0.0.0', port: 5173, strictPort: true, proxy: { '/api': { target } } },
  }
})

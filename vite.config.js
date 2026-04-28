import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/osrm-router': {
        target: 'https://router.project-osrm.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/osrm-router/, ''),
      },
      '/osrm-fossgis': {
        target: 'https://routing.openstreetmap.de',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/osrm-fossgis/, ''),
      },
    },
  },
})
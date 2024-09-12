import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: "src",
  plugins: [react()],
  usePolling: true,
  server: {    
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000  
    port: 3000, 
    headers: {
      "Cross-Origin-Embedder-Policy": "unsafe-none"
    }
  },
  resolve:{
    alias: {
      src: '/src'
    }
  },
  build: {
    rollupOptions:{
      external: [
        // "js/mui-player-desktop-plugin.min.js"
        // ""
      ],
    }
  }
})

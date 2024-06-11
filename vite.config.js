import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  usePolling: true,
  server: {    
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000  
    port: 3000, 
  },
  resolve:{
    alias: {
      src: '/src'
    }
  },
  build: {
    rollupOptions:{
      external: [
        // 'js/jquery.appear.js',
        // 'js/countdown.min.js',
        // 'js/waypoints.min.js',
        // 'js/jquery.counterup.min.js',
        // 'js/wow.min.js',
        // 'js/apexcharts.js',
        // 'js/select2.min.js',
        // 'js/owl.carousel.min.js',
        // 'js/jquery.magnific-popup.min.js',
        // 'js/smooth-scrollbar.js',
        // 'js/lottie.js',
        // 'js/core.js',
        // 'js/charts.js',
        // 'js/animated.js',
        // 'js/kelly.js',
        // 'js/maps.js',
        // 'js/worldLow.js',
        // 'js/chart-custom.js',
        // 'js/custom.js',
      ],
    }
  }
})

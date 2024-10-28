import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'
// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [
      "@fawmi/vue-google-maps",
      "fast-deep-equal",
    ],
  },
  plugins: [
    vue(),
    basicSsl(),
    vueJsx(),
    vueDevTools(),
    VitePWA({ 
      registerType: 'autoUpdate' ,
      injectRegister: 'auto',
      workbox:{
        cleanupOutdatedCaches:true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
      },
      manifest:{
        name: 'Max Pain',
        short_name:'maxpain',
        description: "America's Largest Personal Injury Platform",
        display: 'standalone',
      }
    })
  ],
  server: {
    https:true,
    port: 3001,
    proxy: {
      'baseURL': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baseURL/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

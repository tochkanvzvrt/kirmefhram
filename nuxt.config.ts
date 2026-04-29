export default defineNuxtConfig({
  ssr: true, // SSR включён для индексации
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/tailwind.css'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  // Переменные окружения для API WordPress
  runtimeConfig: {
    public: {
      wpApi: process.env.WP_API_URL || 'http://localhost/church'
    }
  },
  nitro: {
    preset: 'node-server'
  },
  vite: {
    server: {
      watch: { usePolling: true }
    }
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  }
})
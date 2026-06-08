export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/tailwind.css'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.ico' },
      ]
    }
  },
  runtimeConfig: {
    // Приватный — только на сервере (SSR)
    wpApiInternal: process.env.NUXT_WP_API_INTERNAL || 'https://admin.kirmefhram.ru',

    public: {
      // Публичный — доступен и на клиенте
      wpApi: process.env.NUXT_PUBLIC_WP_API || 'https://admin.kirmefhram.ru'
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
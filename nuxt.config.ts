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
      ],
      script: [
        {
          innerHTML: `
            document.addEventListener('DOMContentLoaded', function() {
              document.querySelectorAll('img').forEach(function(img) {
                const src = img.getAttribute('src');
                if (!src || img.dataset.retryChecked) return;
                img.dataset.retryChecked = '1';
                
                const timeout = setTimeout(() => {
                  if (!img.complete || img.naturalWidth === 0) {
                    img.dataset.retried = '1';
                    img.src = src + '?retry=' + Date.now();
                  }
                }, 3000);
                
                img.addEventListener('load', () => clearTimeout(timeout));
                img.addEventListener('error', () => {
                  clearTimeout(timeout);
                  if (!img.dataset.retried) {
                    img.dataset.retried = '1';
                    setTimeout(() => {
                      img.src = src + '?retry=' + Date.now();
                    }, 1000);
                  }
                });
              });
            });
          `,
          type: 'text/javascript'
        }
      ]
    }
  },
  runtimeConfig: {
    wpApiInternal: process.env.NUXT_WP_API_INTERNAL || 'https://admin.kirmefhram.ru',
    public: {
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
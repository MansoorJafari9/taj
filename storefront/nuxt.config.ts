import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-30',
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://127.0.0.1:3000/shop-api',
      channelToken: '',
      siteUrl: 'http://localhost:3001',
    },
  },
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'fa',
    detectBrowserLanguage: false,
    langDir: 'locales',
    locales: [
      { code: 'fa', language: 'fa-IR', name: 'فارسی', file: 'fa.json', dir: 'rtl' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
  },
  image: {
    domains: ['localhost'],
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})

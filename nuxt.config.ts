import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'pt-BR', file: 'pt-BR.json', name: 'Português' },
      { code: 'en-US', file: 'en-US.json', name: 'English' },
      { code: 'es-ES', file: 'es-ES.json', name: 'Español' },
    ],
    defaultLocale: 'en-US',
    fallbackLocale: 'en-US',
    lazy: true,
    langDir: '../app/assets/locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'en-US',
    },
    strategy: 'no_prefix',
  },
});

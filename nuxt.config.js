import pt from 'vuetify/src/locale/pt'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'spa',

  ssr: false,

  env: {
    API_URL: process.env.API_URL,
    APP_RELEASE: process.env.APP_RELEASE
  },

  server: {
    port: process.env.PORT || 8080,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s',
    title: 'NAVETSE',
    htmlAttrs: {
      lang: 'pt-BR',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-png', href: '/logo-icon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' }
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/persistedState.js', ssr: false },
    { src: '~/plugins/package.js', ssr: false },
    { src: '~/plugins/services.js', ssr: false },
    { src: '~/plugins/axios.js', ssr: false },
    { src: '~/plugins/filters.js', ssr: false },
    { src: '~/plugins/helper.js', ssr: false },
    { src: '~/plugins/translate.js', ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // ['vue-currency-input', { globalOptions: { currency: 'BRL' } }],
  ],

  middlewares: [
    '~/middlewares/auth'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.API_URL,
    headers: {
      common: {
        Accept: 'application/json',
      }
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss', '~/assets/custom.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#218c74',
          accent: '#8e44ad',
          secondary: '#1abc9c',
          info: '#3498db',
          warning: '#e67e22',
          error: '#e74c3c',
          success: '#33d9b2',
        },
      },
    },
    lang: {
      locales: { pt },
      current: 'pt'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // standalone: true,
  },
}

module.exports = {
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en'],
    localeDetection: false
  },
  fallbackLng: 'tr',
  defaultNS: 'common',
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
} 
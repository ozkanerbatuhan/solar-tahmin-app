/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    // Next.js i18n yapılandırması
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    // localeDetection true/false olmalı, şu an string değer kullanılıyor
    localeDetection: false 
  }
};

module.exports = nextConfig; 
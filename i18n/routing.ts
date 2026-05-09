import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'hi', 'bn', 'ta', 'te', 'kn', 'mr', 'gu'],
  defaultLocale: 'en',
})

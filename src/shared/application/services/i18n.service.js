import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const savedLocale = localStorage.getItem('safelab-locale')
const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale || defaultLocale,
  fallbackLocale: 'en',
  messages: { en, es }
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('safelab-locale', locale)
  document.documentElement.setAttribute('lang', locale === 'es' ? 'es-419' : 'en-US')
}

setLocale(savedLocale || defaultLocale)

export default i18n

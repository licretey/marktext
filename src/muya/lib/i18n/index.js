// Simple i18n wrapper for muya - does NOT depend on Vue/locales
// Translations are loaded from static/locales/ at runtime
import en from '../../../../static/locales/en.json'

let currentLocale = 'en'
const messages = { en }

export const t = (key) => {
  const keys = key.split('.')
  let result = messages[currentLocale] || messages.en
  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = result[k]
    } else {
      return key
    }
  }
  return result || key
}

export const setLocale = (locale) => {
  currentLocale = locale
}

export const loadLocale = (locale, translations) => {
  messages[locale] = translations
}

export default { t, setLocale, loadLocale }

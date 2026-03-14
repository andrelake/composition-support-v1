import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ptBr from './pt-br.json';
import es from './es.json';

export const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBr },
  es: { translation: es },
} as const;

export type SupportedLocale = keyof typeof resources;

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'pt-BR', 'es'];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const initI18n = (lng: SupportedLocale = DEFAULT_LOCALE) => {
  if (i18n.isInitialized) return i18n;

  i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

export { i18n };

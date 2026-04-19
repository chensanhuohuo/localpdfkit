import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

const LANGUAGE_PREFERENCE_KEY = 'i18nextLngPreference';
const LEGACY_LANGUAGE_KEY = 'i18nextLng';

export const supportedLanguages = ['en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
};

export const getLanguageFromUrl = (): SupportedLanguage => {
  return 'en';
};

let initialized = false;

export const initI18n = async (): Promise<typeof i18next> => {
  if (initialized) return i18next;

  await i18next.use(HttpBackend).init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: supportedLanguages as unknown as string[],
    ns: ['common', 'tools'],
    defaultNS: 'common',
    preload: ['en'],
    backend: {
      loadPath: `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}locales/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false,
    },
  });

  await i18next.loadNamespaces('tools');

  initialized = true;
  return i18next;
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18next.t(key, options);
};

export const changeLanguage = (_lang: SupportedLanguage): void => {
  localStorage.setItem(LANGUAGE_PREFERENCE_KEY, 'en');
  localStorage.setItem(LEGACY_LANGUAGE_KEY, 'en');
};

export const applyTranslations = (): void => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.textContent = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        (element as HTMLElement).title = translation;
      }
    }
  });

  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
};

export const rewriteLinks = (): void => {};

export default i18next;

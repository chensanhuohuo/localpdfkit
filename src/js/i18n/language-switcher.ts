import i18next from 'i18next';
import {
  changeLanguage,
  t,
  languageNames,
  supportedLanguages,
  type SupportedLanguage,
} from './i18n';

export const createLanguageSwitcher = (): HTMLElement => {
  const container = document.createElement('div');
  container.id = 'language-switcher';
  container.className = 'language-switcher';
  container.setAttribute('aria-label', t('nav.language'));

  const select = document.createElement('select');
  select.className = 'language-switcher__select';
  select.setAttribute('aria-label', t('nav.language'));

  for (const language of supportedLanguages) {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = languageNames[language];
    select.appendChild(option);
  }

  const syncValue = () => {
    const current = supportedLanguages.includes(
      i18next.language as SupportedLanguage
    )
      ? (i18next.language as SupportedLanguage)
      : 'en';
    select.value = current;
  };

  select.addEventListener('change', () => {
    changeLanguage(select.value as SupportedLanguage);
  });

  syncValue();
  window.addEventListener('localpdfkit:language-changed', syncValue);
  container.appendChild(select);
  return container;
};

export const injectLanguageSwitcher = (): void => {
  document.querySelectorAll('[data-language-switcher]').forEach((mount) => {
    if (mount.querySelector('.language-switcher')) return;
    mount.appendChild(createLanguageSwitcher());
  });
};

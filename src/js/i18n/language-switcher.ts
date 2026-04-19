export const createLanguageSwitcher = (): HTMLElement => {
  const container = document.createElement('div');
  container.id = 'language-switcher';
  container.hidden = true;
  return container;
};

export const injectLanguageSwitcher = (): void => {};

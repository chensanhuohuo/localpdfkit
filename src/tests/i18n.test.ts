import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLanguageFromUrl } from '@/js/i18n/i18n';

describe('getLanguageFromUrl', () => {
  const originalLocation = window.location;
  const originalNavigator = window.navigator;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/' },
      writable: true,
      configurable: true,
    });

    localStorage.clear();

    // Reset import.meta.env
    vi.stubEnv('BASE_URL', '/');
    vi.stubEnv('VITE_DEFAULT_LANGUAGE', 'en');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.unstubAllEnvs();
  });

  it('should return en for root paths', () => {
    window.location.pathname = '/';
    expect(getLanguageFromUrl()).toBe('en');
  });

  it('should ignore stored language preferences and prefixed paths', () => {
    window.location.pathname = '/de/about';
    localStorage.setItem('i18nextLngPreference', 'fr');
    localStorage.setItem('i18nextLng', 'zh');
    expect(getLanguageFromUrl()).toBe('en');
  });
});

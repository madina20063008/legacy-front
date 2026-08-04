/**
 * Internationalization for Legacy.
 *
 * Rules (per product spec):
 *  - English is ALWAYS the default on first launch. We never auto-switch to the
 *    device language.
 *  - The user's chosen language is persisted locally and restored on every launch,
 *    independent of auth state.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'uz'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
const STORAGE_KEY = 'legacy.language';

export const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
} as const;

// Initialize synchronously with the default so the first render is always valid.
i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Load and apply the persisted language. Call once during app bootstrap. */
export async function restoreLanguage(): Promise<AppLanguage> {
  try {
    const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as AppLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      if (i18n.language !== saved) await i18n.changeLanguage(saved);
      return saved;
    }
  } catch {
    // Ignore storage errors — fall back to the default language.
  }
  return DEFAULT_LANGUAGE;
}

/** Change the active language and persist the choice. */
export async function setLanguage(lang: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Non-fatal: the language still changes for this session.
  }
}

export default i18n;

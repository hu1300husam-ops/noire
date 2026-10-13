import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'ar'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

/** Locales rendered right-to-left. */
export const rtlLocales: readonly AppLocale[] = ['ar'];

export const localeLabels: Record<AppLocale, { native: string; english: string; short: string }> = {
  en: { native: 'English', english: 'English', short: 'EN' },
  ar: { native: 'العربية', english: 'Arabic', short: 'AR' },
};

export function isRtlLocale(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // `/shop` serves English, `/ar/shop` serves Arabic.
  localePrefix: 'as-needed',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
  },
});

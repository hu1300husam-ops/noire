import { describe, expect, it } from 'vitest';
import {
  routing,
  locales,
  defaultLocale,
  getDirection,
  isAppLocale,
  isRtlLocale,
  localeLabels,
} from '@/i18n/routing';
import { toPhysicalX } from '@/lib/hooks/use-direction';

describe('i18n routing config', () => {
  it('serves English as the default, unprefixed locale', () => {
    expect(defaultLocale).toBe('en');
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('as-needed');
  });

  it('supports Arabic and English only', () => {
    expect([...locales].sort()).toEqual(['ar', 'en']);
    expect(Object.keys(localeLabels).sort()).toEqual(['ar', 'en']);
  });

  it('detects the writing direction per locale', () => {
    expect(getDirection('ar')).toBe('rtl');
    expect(getDirection('en')).toBe('ltr');
    expect(isRtlLocale('ar')).toBe(true);
    expect(isRtlLocale('fr')).toBe(false);
  });

  it('type-guards unknown locale strings', () => {
    expect(isAppLocale('ar')).toBe(true);
    expect(isAppLocale('de')).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
  });
});

describe('toPhysicalX', () => {
  it('leaves values untouched in LTR', () => {
    expect(toPhysicalX(24, false)).toBe(24);
    expect(toPhysicalX('100%', false)).toBe('100%');
  });

  it('mirrors numeric and string offsets in RTL', () => {
    expect(toPhysicalX(24, true)).toBe(-24);
    expect(toPhysicalX(-8, true)).toBe(8);
    expect(toPhysicalX('100%', true)).toBe('-100%');
    expect(toPhysicalX('-100%', true)).toBe('100%');
  });
});

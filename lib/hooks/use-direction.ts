'use client';

import { useLocale } from 'next-intl';
import { getDirection } from '@/i18n/routing';

/** Returns the writing direction of the active locale. */
export function useDirection(): 'rtl' | 'ltr' {
  const locale = useLocale();
  return getDirection(locale);
}

export function useIsRtl(): boolean {
  return useDirection() === 'rtl';
}

/**
 * Converts a logical inline offset (positive = towards inline-end) into the
 * physical `x` value framer-motion expects for the active direction.
 */
export function toPhysicalX<T extends number | string>(value: T, isRtl: boolean): T {
  if (!isRtl) return value;
  if (typeof value === 'number') return -value as T;
  return (value.startsWith('-') ? value.slice(1) : `-${value}`) as T;
}

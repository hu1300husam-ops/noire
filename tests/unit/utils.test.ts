import { describe, expect, it } from 'vitest';
import { cn, formatPrice, calculateDiscountPercentage, formatTechnicalDate } from '@/lib/utils';

describe('lib/utils', () => {
  it('merges tailwind classes with conflict resolution', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('ps-2', undefined, false && 'hidden', 'text-sm')).toBe('ps-2 text-sm');
  });

  it('formats prices as USD', () => {
    expect(formatPrice(1250)).toMatch(/1,250/);
  });

  it('computes discount percentages', () => {
    expect(calculateDiscountPercentage(75, 100)).toBe(25);
    expect(calculateDiscountPercentage(100, 75)).toBeNull();
  });

  it('formats technical dates as YYYY.MM.DD', () => {
    expect(formatTechnicalDate('2026-10-14T00:00:00.000Z')).toMatch(/^2026\.10\.1[34]$/);
  });
});

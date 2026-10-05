import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

type Tree = Record<string, unknown>;

function flatten(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value as Tree, path)
      : [path];
  });
}

/** Extracts `{placeholder}` names from an ICU message string. */
function placeholders(message: string): string[] {
  return Array.from(message.matchAll(/\{\s*([a-zA-Z0-9_]+)/g), (m) => m[1]).sort();
}

function lookup(tree: Tree, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => (acc as Tree | undefined)?.[part], tree);
}

describe('message catalogs', () => {
  const FALLBACK_NAMESPACES = ['catalog.', 'shop.filters.'];
  const isFallbackKey = (key: string) => FALLBACK_NAMESPACES.some((ns) => key.startsWith(ns));
  // These namespaces are intentionally empty in en.json: English falls back to fixture copy.
  const enKeys = flatten(en as Tree).filter((k) => !isFallbackKey(k));
  const arKeys = flatten(ar as Tree).filter((k) => !isFallbackKey(k));

  it('ar.json contains every key defined in en.json', () => {
    const missing = enKeys.filter((key) => !arKeys.includes(key));
    expect(missing).toEqual([]);
  });

  it('ar.json does not define keys unknown to en.json', () => {
    const extra = arKeys.filter((key) => !enKeys.includes(key));
    expect(extra).toEqual([]);
  });

  it('keeps ICU placeholders identical between locales', () => {
    const mismatches = enKeys.filter((key) => {
      const enMessage = lookup(en as Tree, key);
      const arMessage = lookup(ar as Tree, key);
      if (typeof enMessage !== 'string' || typeof arMessage !== 'string') return false;
      return JSON.stringify(placeholders(enMessage)) !== JSON.stringify(placeholders(arMessage));
    });
    expect(mismatches).toEqual([]);
  });

  it('has no empty Arabic strings', () => {
    const empty = arKeys.filter((key) => String(lookup(ar as Tree, key)).trim() === '');
    expect(empty).toEqual([]);
  });
});

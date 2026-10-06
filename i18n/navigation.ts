import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware drop-in replacements for `next/link` and `next/navigation`.
 * `href` values stay locale-less (e.g. `/shop`); the active locale prefix is
 * applied automatically (`/ar/shop` when browsing in Arabic).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

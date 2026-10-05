'use client';

import React, { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeLabels, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export interface LanguageSwitcherProps {
  /** Header transparent mode (over dark hero) — switches to light-on-dark styling. */
  transparent?: boolean;
  className?: string;
  /** Render as a full-width list (mobile drawer) instead of a compact toggle. */
  variant?: 'compact' | 'list';
  onSwitched?: () => void;
}

export function LanguageSwitcher({
  transparent = false,
  className,
  variant = 'compact',
  onSwitched,
}: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: AppLocale) => {
    if (next === locale) return;
    // Read the query at click time instead of `useSearchParams()` so the header
    // never opts statically rendered pages out of prerendering.
    const query = typeof window === 'undefined' ? '' : window.location.search;
    const href = query ? `${pathname}${query}` : pathname;
    startTransition(() => {
      router.replace(href, { locale: next });
      onSwitched?.();
    });
  };

  if (variant === 'list') {
    return (
      <div className={cn('space-y-1', className)} role="group" aria-label={t('label')}>
        {locales.map((item) => {
          const active = item === locale;
          return (
            <button
              key={item}
              type="button"
              lang={item}
              onClick={() => switchTo(item)}
              aria-pressed={active}
              disabled={isPending}
              className={cn(
                'flex w-full items-center justify-between border px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-surface text-foreground hover:border-foreground'
              )}
            >
              <span>{localeLabels[item].native}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
                {localeLabels[item].short}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('label')}
      className={cn(
        'inline-flex h-10 items-center rounded-xs border transition-colors',
        transparent ? 'border-white/20 bg-white/5' : 'border-border bg-surface',
        isPending && 'opacity-60',
        className
      )}
    >
      <Globe
        className={cn(
          'ms-2.5 h-3.5 w-3.5 shrink-0',
          transparent ? 'text-white/70' : 'text-foreground-subtle'
        )}
        aria-hidden="true"
      />
      {locales.map((item) => {
        const active = item === locale;
        return (
          <button
            key={item}
            type="button"
            lang={item}
            onClick={() => switchTo(item)}
            aria-pressed={active}
            aria-label={t('switchTo', { language: localeLabels[item].native })}
            disabled={isPending}
            className={cn(
              'h-full px-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors last:pe-2.5',
              active
                ? 'text-foreground'
                : transparent
                  ? 'text-white/55 hover:text-white'
                  : 'text-foreground-subtle hover:text-foreground'
            )}
          >
            {localeLabels[item].short}
          </button>
        );
      })}
    </div>
  );
}

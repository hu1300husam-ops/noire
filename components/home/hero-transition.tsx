import React from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout';
import { Reveal } from '@/components/motion';

export function HeroTransition() {
  const t = useTranslations('home.transition');
  return (
    <div
      aria-label={t('aria')}
      className="relative overflow-hidden border-b border-border bg-background"
    >
      {/* Upper Dark Band stepping down from Obsidian Hero */}
      <div className="surface-obsidian border-b border-border bg-background py-5 text-foreground">
        <Container size="wide">
          <div className="grid grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent" />
              <span>{t('datum')}</span>
            </div>
            <div>
              <span>{t('alloy')}</span>
            </div>
            <div className="hidden sm:block">
              <span>{t('noiseFloor')}</span>
            </div>
            <div className="text-end">
              <span>{t('archiveIndex')}</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Lower Warm Alabaster Bridge with Vertical Datum Axis */}
      <Container size="wide" className="py-10 sm:py-14">
        <Reveal className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="flex items-center gap-4 md:col-span-4">
            <div className="h-10 w-px bg-foreground/30" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                {t('polarity')}
              </span>
              <span className="block font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                {t('polarityValue')}
              </span>
            </div>
          </div>

          <div className="md:col-span-8 md:border-s md:border-border md:ps-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-foreground-muted">
              {t('body')}
            </p>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

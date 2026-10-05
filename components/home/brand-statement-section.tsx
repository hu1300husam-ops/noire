import React from 'react';
import { useTranslations } from 'next-intl';
import { Container, Section } from '@/components/layout';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { Eyebrow, TechnicalCode } from '@/components/ui';

export function BrandStatementSection() {
  const t = useTranslations('home.manifesto');
  const pillars = (['subtract', 'mass', 'endure'] as const).map((key, i) => ({
    index: `03.${i + 1}`,
    title: t(`pillars.${key}.title`),
    detail: t(`pillars.${key}.detail`),
  }));

  return (
    <Section
      id="brand-manifesto"
      spacing="lg"
      tone="default"
      borderBottom
      aria-labelledby="manifesto-heading"
    >
      <Container size="wide">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left 3 Columns: Edition Stamp & Coordinates */}
          <Reveal className="flex flex-col justify-between border-b border-border pb-6 lg:col-span-3 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-8">
            <div className="space-y-3">
              <Eyebrow index="03" tone="accent">
                {t('eyebrow')}
              </Eyebrow>
              <TechnicalCode className="block">
                {t('docRef')}
              </TechnicalCode>
            </div>

            <div className="mt-8 space-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted lg:mt-0">
              <p className="text-foreground">{t('studioZurich')}</p>
              <p>{t('studioTokyo')}</p>
              <p className="pt-2 text-[10px] text-foreground-subtle">
                {t('established')}
              </p>
            </div>
          </Reveal>

          {/* Right 9 Columns: Oversized Statement Typography & Supporting Narrative */}
          <div className="space-y-12 lg:col-span-9 lg:ps-4">
            <Reveal delay={0.08} className="space-y-8">
              <h2
                id="manifesto-heading"
                className="font-display text-h1 tracking-tighter text-foreground"
              >
                {t.rich('title', {
                  em: (chunks) => (
                    <span className="font-normal italic text-foreground-muted">{chunks}</span>
                  ),
                })}
              </h2>

              <p className="max-w-2xl text-body-lg leading-relaxed text-foreground-muted">
                {t('body')}
              </p>
            </Reveal>

            {/* 3-Pillar Architectural Ledger */}
            <StaggerContainer className="grid grid-cols-1 gap-6 border-t border-border pt-8 md:grid-cols-3 md:gap-8">
              {pillars.map((pillar) => (
                <StaggerItem
                  key={pillar.index}
                  className="space-y-3 border-s border-border ps-4"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    {pillar.index}
                  </span>
                  <h3 className="font-display text-h3 tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-small leading-relaxed text-foreground-muted">
                    {pillar.detail}
                  </p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </Container>
    </Section>
  );
}

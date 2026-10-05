import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight, Ruler, Layers, Wrench } from 'lucide-react';
import { Container, Section } from '@/components/layout';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { Eyebrow, TechnicalCode } from '@/components/ui';

export function StoryCraftSection() {
  const t = useTranslations('home.craft');
  const stageMeta = [
    {
      key: 'subtraction',
      icon: Ruler,
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
    },
    {
      key: 'surface',
      icon: Layers,
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85',
    },
    {
      key: 'longevity',
      icon: Wrench,
      image:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85',
    },
  ] as const;
  const craftStages = stageMeta.map((stage) => ({
    ...stage,
    code: t(`stages.${stage.key}.code`),
    title: t(`stages.${stage.key}.title`),
    metric: t(`stages.${stage.key}.metric`),
    body: t(`stages.${stage.key}.body`),
    caption: t(`stages.${stage.key}.caption`),
  }));

  return (
    <Section
      id="craft"
      spacing="lg"
      tone="default"
      borderBottom
      aria-labelledby="story-craft-heading"
    >
      <Container size="wide">
        {/* Top Editorial Story Header */}
        <Reveal className="mb-14 grid grid-cols-1 gap-8 border-b border-border pb-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow index="08" tone="accent">
                {t('eyebrow')}
              </Eyebrow>
              <TechnicalCode>{t('labProtocol')}</TechnicalCode>
            </div>
            <h2
              id="story-craft-heading"
              className="font-display text-h1 tracking-tighter text-foreground"
            >
              {t.rich('title', {
                em: (chunks) => (
                  <span className="font-normal italic text-foreground-muted">{chunks}</span>
                ),
              })}
            </h2>
          </div>

          <div className="flex flex-col justify-end space-y-4 lg:col-span-5">
            <p className="text-body leading-relaxed text-foreground-muted">
              {t('body')}
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
              <span>{t('noPlastic')}</span>
              <span>•</span>
              <span>{t('serviceable')}</span>
            </div>
          </div>
        </Reveal>

        {/* Primary Asymmetrical Architectural Craft Feature */}
        <div className="mb-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left 8 Columns: Monumental Studio Image Plate */}
          <Reveal className="flex flex-col justify-between border border-border bg-surface p-3 sm:p-5 lg:col-span-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
              <span>{t('archivePlate')}</span>
              <span className="text-accent">ISO-2768-F PRECISION</span>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=85"
                alt={t('labImageAlt')}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 sm:p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#F4F3EF]">
                  {t('cavityVerification')}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle sm:grid-cols-4">
              <div>
                <span className="block text-foreground">85.4%</span>
                <span>{t('metrics.recycled')}</span>
              </div>
              <div>
                <span className="block text-foreground">{t('metrics.spindleValue')}</span>
                <span>{t('metrics.spindle')}</span>
              </div>
              <div>
                <span className="block text-foreground">{t('metrics.oxideValue')}</span>
                <span>{t('metrics.oxide')}</span>
              </div>
              <div>
                <span className="block text-foreground">&lt; 0.04% THD</span>
                <span>{t('metrics.harmonic')}</span>
              </div>
            </div>
          </Reveal>

          {/* Right 4 Columns: Editorial Craft Narrative & Dossier */}
          <Reveal
            delay={0.1}
            className="flex flex-col justify-between border border-border bg-surface p-6 sm:p-8 lg:col-span-4"
          >
            <div className="space-y-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                {t('doctrineEyebrow')}
              </span>

              <h3 className="font-display text-h2 tracking-tight text-foreground">
                {t('doctrineTitle')}
              </h3>

              <p className="text-small leading-relaxed text-foreground-muted">
                {t('doctrineBody1')}
              </p>

              <p className="text-small leading-relaxed text-foreground-muted">
                {t('doctrineBody2')}
              </p>
            </div>

            <div className="mt-8 border-t border-border pt-5">
              <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                <span>{t('certifiedBy')}</span>
                <span className="text-foreground">{t('certifier')}</span>
              </div>

              <Link
                href="#journal"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-foreground underline underline-offset-8 transition-colors hover:text-accent"
              >
                <span>{t('readMonograph')}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* 3-Stage Fabrication Ledger */}
        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {craftStages.map((stage) => {
            const IconComponent = stage.icon;
            return (
              <StaggerItem
                key={stage.code}
                className="group flex flex-col justify-between border border-border bg-surface transition-colors hover:border-foreground/50"
              >
                <div>
                  {/* Stage Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-surface-muted">
                    <img
                      src={stage.image}
                      alt={stage.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-noire-out group-hover:scale-105"
                    />
                    <span className="absolute start-3 top-3 border border-border bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                      {stage.metric}
                    </span>
                  </div>

                  {/* Stage Text */}
                  <div className="space-y-3 p-6">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                      <span>{stage.code}</span>
                      <IconComponent className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-h3 tracking-tight text-foreground">
                      {stage.title}
                    </h3>
                    <p className="text-small leading-relaxed text-foreground-muted">
                      {stage.body}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-subtle">
                  {stage.caption}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </Container>
    </Section>
  );
}

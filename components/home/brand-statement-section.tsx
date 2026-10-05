import React from 'react';
import { Container, Section } from '@/components/layout';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { Eyebrow, TechnicalCode } from '@/components/ui';

export function BrandStatementSection() {
  const pillars = [
    {
      index: '03.1',
      title: 'Subtract Ornament',
      detail:
        'Every radius, chamfer, and aperture exists solely to serve acoustic damping, thermal dissipation, or tactile orientation.',
    },
    {
      index: '03.2',
      title: 'Honor Physical Mass',
      detail:
        'We reject hollow injection-molded shells. Solid billet aluminum, grade-5 titanium, and architectural brass ground each object in space.',
    },
    {
      index: '03.3',
      title: 'Engineered to Endure',
      detail:
        'Torx T6 assembly and modular internal architecture ensure every battery, driver, and switch remains serviceable for a decade or more.',
    },
  ];

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
          <Reveal className="flex flex-col justify-between border-b border-border pb-6 lg:col-span-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <div className="space-y-3">
              <Eyebrow index="03" tone="accent">
                BRAND STATEMENT
              </Eyebrow>
              <TechnicalCode className="block">
                DOC-REF // NR-MANIFESTO-04
              </TechnicalCode>
            </div>

            <div className="mt-8 space-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted lg:mt-0">
              <p className="text-foreground">ZÜRICH INDUSTRIAL STUDIO</p>
              <p>TOKYO ACOUSTIC LABORATORY</p>
              <p className="pt-2 text-[10px] text-foreground-subtle">
                EST. 2021 — ARCHIVAL HARDWARE
              </p>
            </div>
          </Reveal>

          {/* Right 9 Columns: Oversized Statement Typography & Supporting Narrative */}
          <div className="space-y-12 lg:col-span-9 lg:pl-4">
            <Reveal delay={0.08} className="space-y-8">
              <h2
                id="manifesto-heading"
                className="font-display text-h1 tracking-tighter text-foreground"
              >
                We reject disposable velocity. Every NOIRÉ instrument is milled
                from solid billet, calibrated in anechoic silence, and{' '}
                <span className="font-normal italic text-foreground-muted">
                  serialized to outlast a decade
                </span>{' '}
                of daily physical contact.
              </h2>

              <p className="max-w-2xl text-body-lg leading-relaxed text-foreground-muted">
                Consumer technology has grown weightless, transient, and visually
                noisy. NOIRÉ restores permanence to the objects you touch every
                hour—uniting Swiss 5-axis CNC metallurgy with Japanese acoustic
                and optical precision.
              </p>
            </Reveal>

            {/* 3-Pillar Architectural Ledger */}
            <StaggerContainer className="grid grid-cols-1 gap-6 border-t border-border pt-8 md:grid-cols-3 md:gap-8">
              {pillars.map((pillar) => (
                <StaggerItem
                  key={pillar.index}
                  className="space-y-3 border-l border-border pl-4"
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

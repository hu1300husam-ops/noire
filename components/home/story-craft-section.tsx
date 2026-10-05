import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Ruler, Layers, Wrench } from 'lucide-react';
import { Container, Section } from '@/components/layout';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { Eyebrow, TechnicalCode } from '@/components/ui';

export function StoryCraftSection() {
  const craftStages = [
    {
      code: 'STAGE 01 // SUBTRACTION',
      title: '5-Axis CNC Billet Milling',
      metric: '±0.02mm Tolerance',
      icon: Ruler,
      body: 'An 18.4-kilogram block of forged 6061-T6 aluminum spends four hours inside a 5-axis milling cell. Over 85% of the raw alloy is subtracted and recycled in-house to leave a single seamless monocoque with zero internal weld seams.',
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
      caption: 'FIG 08.A — 5-AXIS MONOCOQUE TOOLPATH GEOMETRY',
    },
    {
      code: 'STAGE 02 // SURFACE METALLURGY',
      title: 'Ceramic Bead-Blast & Type III Anodizing',
      metric: '62 HRC Surface Hardness',
      icon: Layers,
      body: 'Before electrochemical anodization, each chassis is bombarded with fine zirconium-silicate glass beads. The resulting matte skin scatters ambient light without glare and resists skin oils and micro-abrasions for decades.',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85',
      caption: 'FIG 08.B — MICRO-CRYSTALLINE OXIDE LAYER INSPECTION',
    },
    {
      code: 'STAGE 03 // LONGEVITY',
      title: 'Anechoic Calibration & Modular Serviceability',
      metric: '10-Year Parts Archive',
      icon: Wrench,
      body: 'Every NOIRÉ instrument is assembled solely with standardized Torx T6 titanium fasteners—never permanent adhesives. Each unit is individually swept in our Zürich anechoic chamber and shipped with its signed calibration graph.',
      image:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85',
      caption: 'FIG 08.C — ZÜRICH ANECHOIC CHAMBER FREQUENCY SWEEP',
    },
  ];

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
                METALLURGY &amp; CRAFT
              </Eyebrow>
              <TechnicalCode>LAB-PROTOCOL // ZH-TYO</TechnicalCode>
            </div>
            <h2
              id="story-craft-heading"
              className="font-display text-h1 tracking-tighter text-foreground"
            >
              From 18 Kilograms of Raw Billet to an{' '}
              <span className="font-normal italic text-foreground-muted">
                Instrument of Silence.
              </span>
            </h2>
          </div>

          <div className="flex flex-col justify-end space-y-4 lg:col-span-5">
            <p className="text-body leading-relaxed text-foreground-muted">
              True luxury in industrial hardware is measured by what is removed.
              When you lift a NOIRÉ object, the cold density in your palm is the
              result of uncompromising subtraction and acoustic discipline.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
              <span>0% STRUCTURAL PLASTIC</span>
              <span>•</span>
              <span>100% TORX SERVICEABLE</span>
            </div>
          </div>
        </Reveal>

        {/* Primary Asymmetrical Architectural Craft Feature */}
        <div className="mb-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left 8 Columns: Monumental Studio Image Plate */}
          <Reveal className="flex flex-col justify-between border border-border bg-surface p-3 sm:p-5 lg:col-span-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
              <span>ARCHIVE PLATE // ZÜRICH MILLING FACILITY</span>
              <span className="text-accent">ISO-2768-F PRECISION</span>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=85"
                alt="NOIRÉ acoustic and metallurgical laboratory"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 sm:p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#F4F3EF]">
                  ACOUSTIC CAVITY VERIFICATION // ZERO STANDING INTERNAL RESONANCE
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle sm:grid-cols-4">
              <div>
                <span className="block text-foreground">85.4%</span>
                <span>ALLOY RECYCLED</span>
              </div>
              <div>
                <span className="block text-foreground">4.2 HOURS</span>
                <span>CNC SPINDLE TIME</span>
              </div>
              <div>
                <span className="block text-foreground">25 MICRONS</span>
                <span>OXIDE DEPTH</span>
              </div>
              <div>
                <span className="block text-foreground">&lt; 0.04% THD</span>
                <span>HARMONIC FLOOR</span>
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
                ARCHITECTURAL DOCTRINE
              </span>

              <h3 className="font-display text-h2 tracking-tight text-foreground">
                Why Mass Matters in Acoustic &amp; Tactile Hardware.
              </h3>

              <p className="text-small leading-relaxed text-foreground-muted">
                Micro-vibrations are the enemy of both acoustic fidelity and
                tactile precision. In conventional plastic electronics, the
                housing vibrates sympathetically with the transducer or key
                switch, smearing transient detail.
              </p>

              <p className="text-small leading-relaxed text-foreground-muted">
                By machining our enclosures from solid blocks of aerospace
                aluminum and architectural brass, the chassis acts as an inert
                seismic anchor—allowing only pure sound, light, or mechanical
                actuation to reach your senses.
              </p>
            </div>

            <div className="mt-8 border-t border-border pt-5">
              <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                <span>CERTIFIED BY</span>
                <span className="text-foreground">S. LINDQVIST // HEAD OF DESIGN</span>
              </div>

              <Link
                href="#journal"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-foreground underline underline-offset-8 transition-colors hover:text-accent"
              >
                <span>Read Monograph Issue 14</span>
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
                    <span className="absolute left-3 top-3 border border-border bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
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

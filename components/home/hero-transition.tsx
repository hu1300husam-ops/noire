import React from 'react';
import { Container } from '@/components/layout';
import { Reveal } from '@/components/motion';

export function HeroTransition() {
  return (
    <div
      aria-label="Architectural Section Transition"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      {/* Upper Dark Band stepping down from Obsidian Hero */}
      <div className="surface-obsidian border-b border-border bg-background py-5 text-foreground">
        <Container size="wide">
          <div className="grid grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent" />
              <span>02 // DATUM TRANSITION</span>
            </div>
            <div>
              <span>ALLOY: 6061-T6 / TI-6AL-4V</span>
            </div>
            <div className="hidden sm:block">
              <span>CHAMBER NOISE FLOOR: &lt;11 dBA</span>
            </div>
            <div className="text-right">
              <span>ARCHIVE INDEX: NR-2026-E04</span>
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
                SURFACE POLARITY SHIFT
              </span>
              <span className="block font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                Obsidian Chamber → Alabaster Gallery
              </span>
            </div>
          </div>

          <div className="md:col-span-8 md:border-l md:border-border md:pl-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-foreground-muted">
              Every NOIRÉ object is photographed and calibrated across two
              lighting environments: nocturnal studio shadow and natural
              architectural daylight.
            </p>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

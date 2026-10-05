'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Container } from '@/components/layout';
import { Reveal } from '@/components/motion';
import {
  Eyebrow,
  Input,
  Button,
  TechnicalCode,
  useToast,
} from '@/components/ui';

export function NewsletterSection() {
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [disciplineInterest, setDisciplineInterest] = useState<
    'all' | 'acoustic' | 'architectural'
  >('all');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewed, setIsPreviewed] = useState(false);

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Enter a test email address to preview this local form.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Enter a valid test address, such as studio@example.test.';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    const validationError = validateEmail(trimmed);
    if (validationError) {
      setError(validationError);
      addToast({
        type: 'error',
        title: 'Invalid Demo Address',
        description: validationError,
      });
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (trimmed.toLowerCase() === 'error@example.test') {
      setIsSubmitting(false);
      const demoError = 'A local preview error was simulated. Nothing was saved or sent; try again.';
      setError(demoError);
      addToast({
        type: 'error',
        title: 'Demo Preview Error',
        description: demoError,
      });
      return;
    }

    setIsSubmitting(false);
    setIsPreviewed(true);
    setEmail('');
    addToast({
      type: 'success',
      title: 'Demo Preview Only',
      description: 'Nothing was saved or sent; no mailing-list service is connected.',
    });
  };

  return (
    <section
      id="private-dispatch"
      aria-labelledby="newsletter-heading"
      className="relative border-b border-border bg-background pt-16 text-foreground sm:pt-24"
    >
      <Container size="wide">
        {/* Upper Alabaster / Obsidian Bridge Card */}
        <Reveal className="surface-obsidian border border-border bg-background p-6 text-foreground sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left 6 Columns: Editorial Framing */}
            <div className="space-y-5 lg:col-span-6">
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow index="10" tone="accent">
                  NEWSLETTER // FRONTEND DEMO
                </Eyebrow>
                <TechnicalCode>LOCAL PREVIEW // NOT SENT</TechnicalCode>
              </div>

              <h2
                id="newsletter-heading"
                className="font-display text-h1 tracking-tighter text-foreground"
              >
                Preview the{' '}
                <span className="font-normal italic text-foreground-muted">
                  Private Dispatch Experience.
                </span>
              </h2>

              <p className="max-w-xl text-small leading-relaxed text-foreground-muted">
                This frontend-only form demonstrates newsletter preferences. No
                mailing-list service is connected; use a test address. Nothing
                is saved, and no allocation notice, monograph, or invitation will
                be sent.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
                <span>NO MAILING-LIST SERVICE</span>
                <span>•</span>
                <span>NO ADDRESS STORED OR SENT</span>
              </div>
            </div>

            {/* Right 6 Columns: Validated Interactive Form or Confirmed Dossier */}
            <div className="lg:col-span-6">
              {isPreviewed ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="space-y-5 border border-accent/50 bg-surface p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-accent">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>DEMO PREVIEW COMPLETE</span>
                    </span>
                    <span className="border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                      NOTHING SENT
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-h3 tracking-tight text-foreground">
                      No subscription was created.
                    </h3>
                    <p className="text-small leading-relaxed text-foreground-muted">
                      Preference preview //{' '}
                      <span className="uppercase text-accent">
                        {disciplineInterest === 'all'
                          ? 'All Engineering Disciplines'
                          : disciplineInterest === 'acoustic'
                          ? 'Acoustic Systems'
                          : 'Desk & Architectural Lighting'}
                      </span>
                      . This local interaction did not save your address or preference.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                    <span>Mailing list // not connected</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPreviewed(false);
                        setEmail('');
                      }}
                      className="text-foreground underline underline-offset-4 transition-colors hover:text-accent"
                    >
                      Try Preview Again
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5 border border-border bg-surface p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                    <span>LOCAL NEWSLETTER PREVIEW</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                      DEMO MODE
                    </span>
                  </div>

                  {/* Discipline Preference Pills */}
                  <div className="space-y-2">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                      Primary Discipline Focus
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'all', label: 'All Systems' },
                          { id: 'acoustic', label: 'Acoustic' },
                          { id: 'architectural', label: 'Desk & Light' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDisciplineInterest(opt.id)}
                          className={`border py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                            disciplineInterest === opt.id
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-background text-foreground-muted hover:border-foreground/50 hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Input using Reusable Primitive */}
                  <Input
                    label="Test Email Address"
                    codeLabel="LOCAL PREVIEW // NOT SENT"
                    type="email"
                    placeholder="studio@example.test"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(undefined);
                    }}
                    error={error}
                    hint="Use a test address; no email or preference is stored or sent."
                    disabled={isSubmitting}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Preview Newsletter Form
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Architectural Connector Band into Section 11 (GlobalFooter) */}
      <div className="surface-obsidian mt-16 border-t border-border bg-background py-4 text-foreground sm:mt-24">
        <Container size="wide">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            <span>11 // GLOBAL DIRECTORY &amp; ARCHIVE INDEX</span>
            <span>NOIRÉ AG — ZÜRICH // TOKYO</span>
          </div>
        </Container>
      </div>
    </section>
  );
}

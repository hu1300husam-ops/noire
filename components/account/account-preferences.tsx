'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Send } from 'lucide-react';
import type { PrivateDispatchDiscipline } from '@/lib/account/contracts';
import { Button, Checkbox, TechnicalCode } from '@/components/ui';
import { useCheckout } from '@/lib/context/checkout-context';
import { useToast } from '@/components/ui/toast';

const DISCIPLINES: Array<{
  id: PrivateDispatchDiscipline;
  label: string;
  description: string;
}> = [
  { id: 'acoustic-systems', label: 'Acoustic Systems', description: 'Listening instruments and studio reference' },
  { id: 'desk-architecture', label: 'Desk Architecture', description: 'Tactile input and workspace systems' },
  { id: 'transit-field', label: 'Transit & Field', description: 'Portable instruments and field hardware' },
  { id: 'lighting', label: 'Lighting', description: 'Architectural and ambient illumination' },
];

export function AccountPreferences() {
  const { customer } = useCheckout();
  const { addToast } = useToast();
  const [disciplines, setDisciplines] = useState<PrivateDispatchDiscipline[]>([]);
  const [isPreviewApplied, setIsPreviewApplied] = useState(false);

  const toggleDiscipline = (discipline: PrivateDispatchDiscipline, checked: boolean) => {
    setDisciplines((current) => {
      if (checked) return current.includes(discipline) ? current : [...current, discipline];
      return current.filter((item) => item !== discipline);
    });
    setIsPreviewApplied(false);
  };

  const applyPreview = () => {
    setIsPreviewApplied(true);
    addToast({
      type: 'info',
      title: 'Dispatch preview updated',
      description: 'This selection is held in the current page only. No newsletter registration or account preference was sent or saved.',
    });
  };

  return (
    <section id="private-dispatch" aria-labelledby="private-dispatch-heading" className="scroll-mt-28 space-y-5 sm:space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <TechnicalCode>Correspondence protocol // 06</TechnicalCode>
          <h2 id="private-dispatch-heading" className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Private Dispatch
          </h2>
        </div>
        <span className="border border-border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">
          Registration not connected
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="min-w-0 border border-border bg-surface p-4 sm:p-6 lg:col-span-5">
          <TechnicalCode>Client dispatch endpoint</TechnicalCode>
          <h3 className="mt-2 font-display text-xl text-foreground">Contact address</h3>
          <dl className="mt-4 border-y border-border py-4">
            <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">Email from checkout draft</dt>
            <dd className="mt-2 break-all text-small text-foreground">{customer.email.trim() || 'NOT PROVIDED'}</dd>
          </dl>
          <p className="mt-4 text-small leading-relaxed text-foreground-muted">
            This address is an unverified checkout-session value, not a subscription record.
          </p>
          <Link href="#client-profile" className="mt-3 inline-flex min-h-11 items-center gap-2 border-b border-border px-1 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
            Review contact draft <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="min-w-0 border border-border bg-surface p-4 sm:p-6 lg:col-span-7">
          <div className="flex items-start gap-3 border-b border-border pb-4">
            <Send className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <TechnicalCode>Interest map // preview only</TechnicalCode>
              <h3 className="mt-2 font-display text-xl text-foreground">Disciplines</h3>
              <p className="mt-1.5 text-small leading-relaxed text-foreground-muted">
                Select interests for this page preview. The sitewide Private Dispatch form remains the only available registration entry point.
              </p>
            </div>
          </div>

          <fieldset className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <legend className="sr-only">Private Dispatch discipline preview</legend>
            {DISCIPLINES.map((discipline) => (
              <Checkbox
                key={discipline.id}
                checked={disciplines.includes(discipline.id)}
                onChange={(checked) => toggleDiscipline(discipline.id, checked)}
                label={discipline.label}
                description={discipline.description}
                className="min-h-11 border border-border p-3"
              />
            ))}
          </fieldset>

          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-[10px] leading-relaxed text-foreground-subtle">
              {isPreviewApplied
                ? `${disciplines.length} preview interest${disciplines.length === 1 ? '' : 's'} selected // not persisted`
                : 'Selections are temporary and will reset when this page is reloaded.'}
            </p>
            <Button type="button" variant="secondary" size="md" onClick={applyPreview}>
              Apply preview selection
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-l border-foreground px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="max-w-2xl text-small leading-relaxed text-foreground-muted">
          Newsletter registration is not duplicated in this workspace. Use the existing sitewide Private Dispatch form; its current implementation is a front-end preview and is not a persistent subscription service.
        </p>
        <Link href="/#private-dispatch" className="inline-flex min-h-11 shrink-0 items-center gap-2 border-b border-foreground px-1 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
          Open dispatch registration <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

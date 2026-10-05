import Link from 'next/link';
import { ArrowUpRight, Fingerprint, ShieldCheck } from 'lucide-react';
import type { CustomerSession } from '@/types';
import { Container } from '@/components/layout';

export function AccountHeader({ session }: { session: CustomerSession }) {
  const isGuest = session.status === 'guest';
  const heading = isGuest
    ? 'Guest Client'
    : `Welcome, ${session.customer.firstName}`;
  const clientCode = isGuest
    ? 'NOT ASSIGNED'
    : session.customer.clientCode || 'NOT ASSIGNED';
  const memberSince = isGuest
    ? 'NOT RECORDED'
    : session.customer.memberSince || 'NOT RECORDED';

  return (
    <header className="border-b border-border bg-background">
      <Container size="wide" className="pb-8 pt-24 sm:pb-10 lg:pb-12">
        <nav aria-label="Breadcrumb" className="mb-7">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-subtle">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Maison
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Private Client Atelier
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-end gap-7 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.17em] text-accent">
              <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
              <span>01 // Private Client Atelier</span>
            </div>
            <h1 className="max-w-4xl break-words font-display text-4xl leading-[0.98] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="mt-4 max-w-2xl text-small leading-relaxed text-foreground-muted sm:text-base">
              Your instrument archive, allocation records, delivery register, and client preferences—arranged as a private working dossier.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div className="min-w-0 border border-border bg-surface px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">
                Client reference
              </p>
              <p className="mt-2 break-all font-mono text-sm tabular-nums text-foreground">
                {clientCode}
              </p>
            </div>
            <div className="min-w-0 border border-border bg-surface px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">
                Member since
              </p>
              <p className="mt-2 break-words font-mono text-sm tabular-nums text-foreground">
                {memberSince}
              </p>
            </div>
            <div className="flex min-h-11 items-center gap-2 border border-border bg-surface px-4 py-3 sm:col-span-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground">
                {isGuest ? 'Guest client // preview session' : 'Private client // provider session'}
              </span>
              {isGuest && (
                <span className="ml-auto border border-accent/35 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-accent">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>

        {isGuest && (
          <div
            role="status"
            className="mt-7 flex flex-col gap-3 border-l border-accent bg-accent/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <p className="text-small leading-relaxed text-foreground-muted">
              No customer identity is connected. Local checkout drafts and browser-stored demonstration orders are not verified account records.
            </p>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">
              Sign-in will connect in a future release
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>
        )}
      </Container>
    </header>
  );
}

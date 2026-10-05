'use client';

import { Link } from '@/i18n/navigation';
import { ErrorState } from '@/components/ui';

export default function WishlistError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="min-h-screen bg-background px-4 pb-16 pt-28 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-container">
        <ErrorState
          code="ARCHIVE // CONNECTION INTERRUPTED"
          title="The saved ledger could not be loaded."
          description="Catalog records are temporarily unavailable. Your saved instruments remain in this browser; retry the connection to resolve them against the current archive."
          retryLabel="Retry archive"
          onRetry={reset}
          secondaryAction={
            <Link
              href="/"
              className="inline-flex min-h-11 items-center border-b border-border px-1 font-mono text-[10px] uppercase tracking-[0.13em] text-foreground-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Return to Maison
            </Link>
          }
        />
      </div>
    </main>
  );
}

'use client';

import { ErrorState } from '@/components/ui';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="min-w-0">
      <ErrorState
        code="ERR // COMMAND CENTER"
        title="The local operations workspace could not be rendered."
        description={error.message || 'An unexpected local error interrupted this admin preview.'}
        onRetry={reset}
        retryLabel="Retry workspace"
      />
    </main>
  );
}

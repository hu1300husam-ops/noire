import { notFound } from 'next/navigation';

/** Catch-all: unknown routes inside a valid locale render the localized `not-found` page. */
export default function CatchAllPage() {
  notFound();
}

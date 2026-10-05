'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Read the user's motion preference after hydration so server markup and the
 * first client render remain identical. The preference still takes effect
 * immediately after mount without forcing a server/client tree mismatch.
 */
export function useStableReducedMotion(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted && prefersReducedMotion === true;
}

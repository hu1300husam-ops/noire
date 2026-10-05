'use client';

import { useState, useEffect } from 'react';
import { NOIRE_BREAKPOINT_TOKENS } from '@/lib/design-system/tokens';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useBreakpoint() {
  const isMdUp = useMediaQuery(`(min-width: ${NOIRE_BREAKPOINT_TOKENS.md}px)`);
  const isLgUp = useMediaQuery(`(min-width: ${NOIRE_BREAKPOINT_TOKENS.lg}px)`);

  return {
    isMobile: !isMdUp,
    isTablet: isMdUp && !isLgUp,
    isDesktop: isLgUp,
  };
}

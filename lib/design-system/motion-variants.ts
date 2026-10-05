import type { Variants } from 'framer-motion';
import { NOIRE_MOTION_TOKENS } from './tokens';

export type MotionDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export function createFadeVariants({
  direction = 'up',
  distance = 16,
  duration = NOIRE_MOTION_TOKENS.duration.normal,
  delay = 0,
  reducedMotion = false,
}: {
  direction?: MotionDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  reducedMotion?: boolean;
}): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 1, x: 0, y: 0 },
      visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0 } },
    };
  }

  const offsetMap: Record<MotionDirection, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  return {
    hidden: {
      opacity: 0,
      ...offsetMap[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: NOIRE_MOTION_TOKENS.easing.outExpo,
      },
    },
  };
}

export function createStaggerContainerVariants({
  staggerDelay = NOIRE_MOTION_TOKENS.stagger.normal,
  delayChildren = 0,
  reducedMotion = false,
}: {
  staggerDelay?: number;
  delayChildren?: number;
  reducedMotion?: boolean;
}): Variants {
  return {
    hidden: { opacity: reducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay,
        delayChildren: reducedMotion ? 0 : delayChildren,
      },
    },
  };
}

export function createStaggerItemVariants({
  distance = 18,
  duration = NOIRE_MOTION_TOKENS.duration.normal,
  reducedMotion = false,
}: {
  distance?: number;
  duration?: number;
  reducedMotion?: boolean;
}): Variants {
  return {
    hidden: {
      opacity: reducedMotion ? 1 : 0,
      y: reducedMotion ? 0 : distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : duration,
        ease: NOIRE_MOTION_TOKENS.easing.outExpo,
      },
    },
  };
}

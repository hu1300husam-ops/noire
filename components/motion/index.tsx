'use client';

import React, { useMemo } from 'react';
import {
  motion,
  type HTMLMotionProps,
} from 'framer-motion';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import {
  createFadeVariants,
  createStaggerContainerVariants,
  createStaggerItemVariants,
  type MotionDirection,
} from '@/lib/design-system/motion-variants';
import { cn } from '@/lib/utils';
import { useStableReducedMotion } from '@/lib/hooks/use-stable-reduced-motion';

interface BaseMotionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  className?: string;
}

/**
 * 01. FadeIn — Subtle opacity + optional directional drift.
 * Automatically degrades to instant render when prefers-reduced-motion is active.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = NOIRE_MOTION_TOKENS.duration.normal,
  direction = 'up',
  distance = 16,
  once = true,
  amount = 0.15,
  className,
  ...props
}: BaseMotionProps & {
  direction?: MotionDirection;
  distance?: number;
}) {
  const prefersReducedMotion = useStableReducedMotion();

  const variants = useMemo(
    () =>
      createFadeVariants({
        direction,
        distance,
        duration,
        delay,
        reducedMotion: prefersReducedMotion,
      }),
    [direction, distance, duration, delay, prefersReducedMotion]
  );

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const Reveal = FadeIn;

/**
 * 02. SlideUp — Crisp vertical editorial entrance.
 */
export function SlideUp({
  children,
  delay = 0,
  duration = NOIRE_MOTION_TOKENS.duration.slow,
  once = true,
  amount = 0.2,
  className,
  ...props
}: BaseMotionProps) {
  return (
    <FadeIn
      direction="up"
      distance={24}
      delay={delay}
      duration={duration}
      once={once}
      amount={amount}
      className={className}
      {...props}
    >
      {children}
    </FadeIn>
  );
}

/**
 * 03. StaggerContainer & StaggerItem — Coordinated sequence for product grids, specs, and lists.
 */
export function StaggerContainer({
  children,
  staggerDelay = NOIRE_MOTION_TOKENS.stagger.normal,
  delayChildren = 0,
  once = true,
  amount = 0.1,
  className,
  ...props
}: BaseMotionProps & {
  staggerDelay?: number;
  delayChildren?: number;
}) {
  const prefersReducedMotion = useStableReducedMotion();

  const variants = useMemo(
    () =>
      createStaggerContainerVariants({
        staggerDelay,
        delayChildren,
        reducedMotion: prefersReducedMotion,
      }),
    [staggerDelay, delayChildren, prefersReducedMotion]
  );

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  distance = 18,
  duration = NOIRE_MOTION_TOKENS.duration.normal,
  ...props
}: BaseMotionProps & { distance?: number }) {
  const prefersReducedMotion = useStableReducedMotion();

  const variants = useMemo(
    () =>
      createStaggerItemVariants({
        distance,
        duration,
        reducedMotion: prefersReducedMotion,
      }),
    [distance, duration, prefersReducedMotion]
  );

  return (
    <motion.div variants={variants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * 04. ImageReveal — Cinematic architectural curtain + subtle optical scale settle.
 */
export function ImageReveal({
  children,
  delay = 0,
  duration = NOIRE_MOTION_TOKENS.duration.cinematic,
  once = true,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = useStableReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn('relative overflow-hidden', className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: NOIRE_MOTION_TOKENS.easing.outExpo,
      }}
      className={cn('relative overflow-hidden', className)}
    >
      <motion.div
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once, amount: 0.15 }}
        transition={{
          duration: duration * 1.15,
          delay,
          ease: NOIRE_MOTION_TOKENS.easing.outExpo,
        }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * 05. RevealText — Masked editorial headline reveal.
 */
export function RevealText({
  text,
  as: Component = 'span',
  delay = 0,
  className,
}: {
  text: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useStableReducedMotion();

  if (prefersReducedMotion) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component className={cn('inline-block overflow-hidden align-bottom', className)}>
      <motion.span
        initial={{ y: '100%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: NOIRE_MOTION_TOKENS.duration.slow,
          delay,
          ease: NOIRE_MOTION_TOKENS.easing.outExpo,
        }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </Component>
  );
}

/**
 * 06. ScaleReveal — Subtle precision scale entrance for cards & modals.
 */
export function ScaleReveal({
  children,
  delay = 0,
  duration = NOIRE_MOTION_TOKENS.duration.normal,
  once = true,
  className,
  ...props
}: BaseMotionProps) {
  const prefersReducedMotion = useStableReducedMotion();

  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.96 }
      }
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: NOIRE_MOTION_TOKENS.easing.outExpo,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 07. PageTransition — Smooth route wrapper for primary page views.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useStableReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : NOIRE_MOTION_TOKENS.duration.normal,
        ease: NOIRE_MOTION_TOKENS.easing.outExpo,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

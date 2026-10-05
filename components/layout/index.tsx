import React from 'react';
import { cn } from '@/lib/utils';
import { Eyebrow, Heading, Text } from '@/components/ui/typography';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide' | 'full';
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'article';
}

export function Container({
  children,
  size = 'default',
  as: Component = 'div',
  className,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    default: 'max-w-editorial px-5 sm:px-8 md:px-12 lg:px-16',
    narrow: 'max-w-5xl px-5 sm:px-8 md:px-12',
    wide: 'max-w-[1680px] px-5 sm:px-8 md:px-12 lg:px-20',
    full: 'w-full px-5 sm:px-8 md:px-12',
  };

  return (
    <Component
      className={cn('mx-auto w-full', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: 'default' | 'surface' | 'muted' | 'obsidian';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  borderTop?: boolean;
  borderBottom?: boolean;
}

export function Section({
  children,
  tone = 'default',
  spacing = 'md',
  borderTop = false,
  borderBottom = false,
  className,
  ...props
}: SectionProps) {
  const toneClasses = {
    default: 'bg-background text-foreground',
    surface: 'bg-surface text-foreground',
    muted: 'bg-surface-muted text-foreground',
    obsidian: 'surface-obsidian bg-background text-foreground',
  };

  const spacingClasses = {
    none: 'py-0',
    sm: 'py-section-sm',
    md: 'py-section-md',
    lg: 'py-section-lg',
  };

  return (
    <section
      className={cn(
        'relative transition-colors duration-400',
        toneClasses[tone],
        spacingClasses[spacing],
        borderTop && 'border-t border-border',
        borderBottom && 'border-b border-border',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function ArchitecturalGrid({
  children,
  className,
  gap = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  gap?: 'none' | 'tight' | 'default' | 'wide';
}) {
  const gapClasses = {
    none: 'gap-0',
    tight: 'gap-4 md:gap-6',
    default: 'gap-5 md:gap-8 lg:gap-10',
    wide: 'gap-8 md:gap-12 lg:gap-16',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * EditorialSplit — Asymmetrical two-column architectural layout
 * with intentional mobile ordering and optional sticky column support.
 */
export function EditorialSplit({
  left,
  right,
  ratio = '5-7',
  reverseOnMobile = false,
  stickyColumn = 'none',
  className,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: '5-7' | '6-6' | '7-5' | '4-8' | '8-4';
  reverseOnMobile?: boolean;
  stickyColumn?: 'none' | 'left' | 'right';
  className?: string;
}) {
  const ratioMap = {
    '5-7': {
      left: 'lg:col-span-5',
      right: 'lg:col-span-7',
    },
    '6-6': {
      left: 'lg:col-span-6',
      right: 'lg:col-span-6',
    },
    '7-5': {
      left: 'lg:col-span-7',
      right: 'lg:col-span-5',
    },
    '4-8': {
      left: 'lg:col-span-4',
      right: 'lg:col-span-8',
    },
    '8-4': {
      left: 'lg:col-span-8',
      right: 'lg:col-span-4',
    },
  };

  const spans = ratioMap[ratio];

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:gap-12',
        className
      )}
    >
      <div
        className={cn(
          spans.left,
          reverseOnMobile && 'order-2 lg:order-1',
          stickyColumn === 'left' && 'lg:sticky lg:top-24 lg:self-start'
        )}
      >
        {left}
      </div>
      <div
        className={cn(
          spans.right,
          reverseOnMobile && 'order-1 lg:order-2',
          stickyColumn === 'right' && 'lg:sticky lg:top-24 lg:self-start'
        )}
      >
        {right}
      </div>
    </div>
  );
}

/**
 * AspectMedia — Architectural media frame with consistent aspect ratios and optional figure caption.
 */
export function AspectMedia({
  aspect = 'portrait',
  caption,
  figureCode,
  bordered = true,
  className,
  children,
}: {
  aspect?: 'square' | 'portrait' | 'editorial' | 'landscape' | 'cinema' | 'ultrawide';
  caption?: string;
  figureCode?: string;
  bordered?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[4/5]',
    editorial: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    cinema: 'aspect-[16/9]',
    ultrawide: 'aspect-[21/9]',
  };

  return (
    <figure className="space-y-2.5">
      <div
        className={cn(
          'relative w-full overflow-hidden bg-surface-muted',
          aspectClasses[aspect],
          bordered && 'border border-border',
          className
        )}
      >
        {children}
      </div>
      {(figureCode || caption) && (
        <figcaption className="flex items-baseline justify-between gap-4 text-caption text-foreground-subtle">
          {figureCode && (
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
              {figureCode}
            </span>
          )}
          {caption && <span>{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
  align = 'split',
  className,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'split' | 'left';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-10 md:mb-14 lg:mb-16',
        align === 'split' &&
          'flex flex-col justify-between gap-6 md:flex-row md:items-end',
        className
      )}
    >
      <div className="max-w-2xl space-y-3.5">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <Heading as="h2" size="h2" className="tracking-tight">
          {title}
        </Heading>
        {description && (
          <Text size="body" tone="muted" measure>
            {description}
          </Text>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

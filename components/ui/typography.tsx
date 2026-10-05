import React from 'react';
import { cn } from '@/lib/utils';

export type TypographyTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'inverse'
  | 'danger'
  | 'success';

const toneClasses: Record<TypographyTone, string> = {
  default: 'text-foreground',
  muted: 'text-foreground-muted',
  subtle: 'text-foreground-subtle',
  accent: 'text-accent',
  inverse: 'text-foreground-inverse',
  danger: 'text-danger',
  success: 'text-success',
};

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'display' | 'h1' | 'h2' | 'h3';
  tone?: TypographyTone;
}

export function Heading({
  as: Component = 'h2',
  size = 'h2',
  tone = 'default',
  className,
  children,
  ...props
}: HeadingProps) {
  const sizeClasses = {
    display: 'font-display text-display',
    h1: 'font-display text-h1',
    h2: 'font-display text-h2',
    h3: 'font-display text-h3',
  };

  return (
    <Component
      className={cn(sizeClasses[size], toneClasses[tone], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'figcaption';
  size?: 'body-lg' | 'body' | 'small' | 'caption';
  tone?: TypographyTone;
  measure?: boolean;
}

export function Text({
  as: Component = 'p',
  size = 'body',
  tone = 'default',
  measure = false,
  className,
  children,
  ...props
}: TextProps) {
  const sizeClasses = {
    'body-lg': 'font-sans text-body-lg',
    body: 'font-sans text-body',
    small: 'font-sans text-small',
    caption: 'font-sans text-caption',
  };

  return (
    <Component
      className={cn(
        sizeClasses[size],
        toneClasses[tone],
        measure && 'max-w-reading',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Eyebrow({
  index,
  children,
  tone = 'accent',
  className,
}: {
  index?: string;
  children: React.ReactNode;
  tone?: TypographyTone;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {index && (
        <>
          <span className="font-mono text-label text-foreground-subtle">
            {index}
          </span>
          <span className="h-px w-6 bg-border-strong/30" aria-hidden="true" />
        </>
      )}
      <span
        className={cn(
          'font-mono text-label uppercase tracking-[0.14em]',
          toneClasses[tone]
        )}
      >
        {children}
      </span>
    </div>
  );
}

export function TechnicalCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums text-foreground-subtle',
        className
      )}
    >
      {children}
    </span>
  );
}

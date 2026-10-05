import React from 'react';
import { Container } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { ShopProductGridSkeleton } from '@/components/shop';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 text-foreground sm:pt-24 lg:pt-28">
      <Container size="wide">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center justify-between border-b border-border py-3.5">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-3.5 w-36" />
        </div>

        {/* Intro Header Skeleton */}
        <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-12 lg:py-10">
          <div className="space-y-4 lg:col-span-8">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex gap-2 overflow-hidden border-y border-border py-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-28 shrink-0" />
          ))}
        </div>

        {/* Main Workspace Skeleton */}
        <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-12 lg:gap-10">
          <div className="hidden space-y-6 lg:col-span-3 lg:block">
            <Skeleton className="h-[640px] w-full" />
          </div>
          <div className="lg:col-span-9">
            <ShopProductGridSkeleton viewMode="editorial" count={6} />
          </div>
        </div>
      </Container>
    </div>
  );
}

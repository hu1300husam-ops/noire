'use client';

import React from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { CommerceProvider } from '@/lib/context/commerce-context';
import { CheckoutProvider } from '@/lib/context/checkout-context';

export function NoireProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CommerceProvider>
        <CheckoutProvider>{children}</CheckoutProvider>
      </CommerceProvider>
    </ToastProvider>
  );
}

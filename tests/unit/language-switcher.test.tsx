import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

const replaceMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/shop',
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

import { LanguageSwitcher } from '@/components/navigation/language-switcher';

function renderWithLocale(locale: 'en' | 'ar', variant: 'compact' | 'list' = 'compact') {
  const messages = locale === 'ar' ? ar : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LanguageSwitcher variant={variant} />
    </NextIntlClientProvider>
  );
}

describe('<LanguageSwitcher />', () => {
  beforeEach(() => {
    replaceMock.mockClear();
    window.history.replaceState({}, '', '/shop?category=audio');
  });

  it('renders both locales and marks the active one', () => {
    renderWithLocale('en');
    const enButton = screen.getByRole('button', { pressed: true });
    expect(enButton).toHaveTextContent('EN');
    expect(screen.getByRole('button', { pressed: false })).toHaveTextContent('AR');
  });

  it('switches locale while preserving the current path and query', () => {
    renderWithLocale('en');
    fireEvent.click(screen.getByRole('button', { pressed: false }));
    expect(replaceMock).toHaveBeenCalledWith('/shop?category=audio', { locale: 'ar' });
  });

  it('does not navigate when the active locale is clicked', () => {
    renderWithLocale('ar');
    fireEvent.click(screen.getByRole('button', { pressed: true }));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('exposes native language names in list mode', () => {
    renderWithLocale('ar', 'list');
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });
});

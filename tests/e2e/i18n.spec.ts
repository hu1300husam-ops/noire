import { test, expect } from '@playwright/test';

test.describe('Localization & RTL', () => {
  test('English is served unprefixed as LTR', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
  });

  test('/ar renders Arabic RTL markup', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('link', { name: 'المتجر' }).first()).toBeVisible();
  });

  test('language switcher keeps the current route and query', async ({ page }) => {
    await page.goto('/shop?category=audio');
    await page.getByRole('button', { name: /switch to العربية/i }).first().click();
    await expect(page).toHaveURL(/\/ar\/shop\?category=audio$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.getByRole('button', { name: /التبديل إلى English/ }).first().click();
    await expect(page).toHaveURL(/\/shop\?category=audio$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('unknown locale segments and routes return a localized 404', async ({ page }) => {
    const response = await page.goto('/ar/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('هذه الصفحة ليست في الأرشيف')).toBeVisible();

    const en = await page.goto('/this-route-does-not-exist');
    expect(en?.status()).toBe(404);
    await expect(page.getByText('This Page Is Not in the Archive')).toBeVisible();
  });

  test('product page renders in Arabic with English brand names preserved', async ({ page }) => {
    await page.goto('/ar/product/aether-01-headphones');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/AETHER/i);
  });
});

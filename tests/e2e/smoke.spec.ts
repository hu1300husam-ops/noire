import { test, expect } from '@playwright/test';

const routes = ['/', '/shop', '/cart', '/wishlist', '/account', '/checkout', '/ar', '/ar/shop', '/ar/cart'];

for (const route of routes) {
  test(`renders ${route} without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#main-content')).toBeVisible();
    expect(errors.filter((e) => !e.includes('Download the React DevTools'))).toEqual([]);
  });
}

test('shop filters update the URL and the product grid', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('link', { name: /Audio/i }).first().click();
  await expect(page).toHaveURL(/category=audio/);
  await expect(page.locator('#main-content')).toContainText(/AUDIO/i);
});

test('adding a product to the bag opens the bag drawer', async ({ page }) => {
  await page.goto('/product/aether-01-headphones');
  await page.getByRole('button', { name: /allocate to bag|reserve/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

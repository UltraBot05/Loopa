import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  // Next.js static page should load without crashing
  await expect(page).toHaveTitle(/Create Next App|Loopa/);
});

import { test, expect } from '@playwright/test';

// These tests use the mobile-chrome project (375px width, Pixel 5 device)
// but we can also run them explicitly with a small viewport.
test.use({ viewport: { width: 375, height: 812 } });

test.describe('Mobile Responsive', () => {
  test('should render login page on mobile', async ({ page }) => {
    // Use empty storage state for login page
    await page.goto('/login');
    await expect(page.getByText('Ascent XR')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should display command center in mobile layout', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Command Center')).toBeVisible();
    // KPI cards should stack vertically on mobile (grid-cols-1)
    const kpiCards = page.locator('[class*="grid"] [class*="rounded"]');
    const count = await kpiCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show sidebar navigation accessible on mobile', async ({ page }) => {
    await page.goto('/');
    // On mobile the sidebar may be collapsed or shown differently
    // The logo should still be visible
    await expect(page.locator('text=AX').first()).toBeVisible();
  });

  test('should render sales page on mobile viewport', async ({ page }) => {
    await page.goto('/sales');
    await expect(page.getByText('Sales')).toBeVisible();
    // Pipeline columns should be horizontally scrollable on mobile
    await expect(page.getByText('Discovery')).toBeVisible();
  });

  test('should render finance page on mobile viewport', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByText('Finance')).toBeVisible();
  });

  test('should render goals page on mobile viewport', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.getByText('Goals & OKRs')).toBeVisible();
  });

  test('should handle notification panel on mobile', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await expect(page.getByText('Notifications')).toBeVisible();
    // Panel should be visible (full width on mobile)
    await page.keyboard.press('Escape');
  });

  test('should open and close modals on mobile', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: '+ New Goal' }).click();
    await expect(page.getByText('New Goal')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('New Goal')).not.toBeVisible();
  });
});

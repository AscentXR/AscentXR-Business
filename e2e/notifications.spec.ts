import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display notification bell in header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Toggle notifications' })).toBeVisible();
  });

  test('should open notification panel when bell clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  });

  test('should display filter tabs in notification panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Critical' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'High' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Low' })).toBeVisible();
  });

  test('should close notification panel on escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await page.keyboard.press('Escape');
    // Panel slides out via animation - wait for it to complete
    await page.waitForTimeout(600);
    // The panel may still be in the DOM but translated off-screen, or fully hidden
    const isHidden = await page.getByRole('heading', { name: 'Notifications' }).isHidden().catch(() => true);
    const hasTranslate = await page.locator('.translate-x-full').count().catch(() => 0);
    // Accept either: heading hidden, or panel translated off-screen
    expect(isHidden || hasTranslate > 0).toBeTruthy();
  });

  test('should show mark-all-read button', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    // Mark all read button (CheckCheck icon) has title attribute
    await expect(page.getByTitle('Mark all as read')).toBeVisible();
  });
});

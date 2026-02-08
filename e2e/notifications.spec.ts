import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display notification bell in header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Toggle notifications' })).toBeVisible();
  });

  test('should open notification panel when bell clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await expect(page.getByText('Notifications')).toBeVisible();
  });

  test('should display filter tabs in notification panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Critical' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'High' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Low' })).toBeVisible();
  });

  test('should close notification panel on escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    await expect(page.getByText('Notifications')).toBeVisible();
    await page.keyboard.press('Escape');
    // Panel slides out
    await page.waitForTimeout(400);
    await expect(page.locator('.translate-x-full')).toBeVisible();
  });

  test('should show mark-all-read button', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle notifications' }).click();
    // Mark all read button (CheckCheck icon)
    await expect(page.getByTitle('Mark all as read')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

// These tests run WITHOUT pre-authenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test('should show login page with branding', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Ascent XR' })).toBeVisible();
    await expect(page.getByText('Business Control Center')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('baduser');
    await page.getByLabel('Password').fill('badpass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should show validation error when fields are empty', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Please enter both username and password')).toBeVisible();
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/login/);
    await expect(page.getByLabel('Username')).toBeVisible();
  });

  test('should redirect to Command Center after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('jim');
    await page.getByLabel('Password').fill(process.env.TEST_PASSWORD || 'admin');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
  });

  test('should protect all routes when not authenticated', async ({ page }) => {
    const routes = ['/sales', '/finance', '/goals', '/agents', '/customer-success'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForURL(/\/login/);
    }
  });
});

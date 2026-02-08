import { test as setup } from '@playwright/test';

const AUTH_FILE = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('jim');
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD || 'admin');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect to dashboard (Command Center)
  await page.waitForURL('/', { timeout: 10_000 });

  // Save signed-in state
  await page.context().storageState({ path: AUTH_FILE });
});

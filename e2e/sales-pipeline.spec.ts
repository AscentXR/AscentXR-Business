import { test, expect } from '@playwright/test';

test.describe('Sales Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sales');
  });

  test('should display pipeline board with stage columns', async ({ page }) => {
    await expect(page.getByText('Sales')).toBeVisible();
    await expect(page.getByText('CRM & Pipeline Management')).toBeVisible();

    // Pipeline stages
    await expect(page.getByText('Discovery')).toBeVisible();
    await expect(page.getByText('Needs Assessment')).toBeVisible();
    await expect(page.getByText('Proposal')).toBeVisible();
    await expect(page.getByText('Negotiation')).toBeVisible();
    await expect(page.getByText('Contract Review')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    const tabs = ['Pipeline', 'Contacts', 'Deals', 'Proposals'];
    for (const tab of tabs) {
      await page.getByRole('button', { name: tab }).click();
      // Each tab should render without errors
      await page.waitForTimeout(300);
    }
  });

  test('should show contact form when clicking Add Contact', async ({ page }) => {
    await page.getByRole('button', { name: 'Contacts' }).click();
    await page.getByRole('button', { name: '+ Add Contact' }).click();

    // Modal should appear
    await expect(page.getByText('New Contact')).toBeVisible();
    await expect(page.getByText('First Name')).toBeVisible();
    await expect(page.getByText('Last Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
  });

  test('should show deal form when clicking Add Deal', async ({ page }) => {
    await page.getByRole('button', { name: 'Deals' }).click();
    await page.getByRole('button', { name: '+ Add Deal' }).click();

    await expect(page.getByText('New Deal')).toBeVisible();
    await expect(page.getByText('District')).toBeVisible();
    await expect(page.getByText('Stage')).toBeVisible();
  });

  test('should display agent trigger buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Research District' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draft Proposal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Qualify Lead' })).toBeVisible();
  });
});

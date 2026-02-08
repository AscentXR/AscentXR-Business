import { test, expect } from '@playwright/test';

test.describe('Goals & OKRs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals');
  });

  test('should display goals page with title', async ({ page }) => {
    await expect(page.getByText('Goals & OKRs')).toBeVisible();
    await expect(page.getByText('Objectives and Key Results tracking')).toBeVisible();
  });

  test('should display quarter selector buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Q1 2026' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Q2 2026' })).toBeVisible();
  });

  test('should display business area filter buttons', async ({ page }) => {
    const areas = ['All', 'Sales', 'Marketing', 'Finance', 'Product', 'Customer Success'];
    for (const area of areas) {
      await expect(page.getByRole('button', { name: area, exact: true })).toBeVisible();
    }
  });

  test('should display area summary cards', async ({ page }) => {
    const areas = ['Sales', 'Marketing', 'Finance', 'Product', 'Customer Success'];
    for (const area of areas) {
      await expect(page.getByText(area, { exact: true }).first()).toBeVisible();
    }
  });

  test('should display OKR tree section', async ({ page }) => {
    await expect(page.getByText('OKR Tree - Q1 2026')).toBeVisible();
  });

  test('should display behind schedule section', async ({ page }) => {
    await expect(page.getByText('Behind Schedule')).toBeVisible();
  });

  test('should open new goal modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Goal' }).click();

    await expect(page.getByText('New Goal')).toBeVisible();
    await expect(page.getByText('Title')).toBeVisible();
    await expect(page.getByText('Type')).toBeVisible();
    await expect(page.getByText('Business Area')).toBeVisible();
    await expect(page.getByText('Target Value')).toBeVisible();
    await expect(page.getByText('Owner')).toBeVisible();
  });

  test('should switch quarters', async ({ page }) => {
    await page.getByRole('button', { name: 'Q2 2026' }).click();
    await expect(page.getByText('OKR Tree - Q2 2026')).toBeVisible();
  });

  test('should display Generate Weekly Review agent button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Generate Weekly Review' })).toBeVisible();
  });
});

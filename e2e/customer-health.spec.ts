import { test, expect } from '@playwright/test';

test.describe('Customer Health & Success', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customer-success');
  });

  test('should display customer success page with KPIs', async ({ page }) => {
    await expect(page.getByText('Customer Success')).toBeVisible();
    await expect(page.getByText('Health scores, support, and renewals')).toBeVisible();

    // KPI cards
    await expect(page.getByText('Avg Health Score')).toBeVisible();
    await expect(page.getByText('At-Risk Accounts')).toBeVisible();
    await expect(page.getByText('Open Tickets')).toBeVisible();
    await expect(page.getByText('Expansion Opportunities')).toBeVisible();
  });

  test('should display health dashboard tab with risk groups', async ({ page }) => {
    await page.getByRole('button', { name: 'Health Dashboard' }).click();
    // The health dashboard should render risk level groups or empty state
    await page.waitForTimeout(500);
    const hasScores = await page.getByText('healthy').or(page.getByText('No health scores')).isVisible();
    expect(hasScores).toBeTruthy();
  });

  test('should switch to support tickets tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Support Tickets' }).click();
    await page.waitForTimeout(300);
    // Should show ticket table or empty state
    const visible = await page.locator('table, [class*="text-gray-500"]').first().isVisible();
    expect(visible).toBeTruthy();
  });

  test('should switch to renewals tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Renewals' }).click();
    await page.waitForTimeout(300);
    const visible = await page.getByText('District').or(page.getByText('No renewal data')).isVisible();
    expect(visible).toBeTruthy();
  });

  test('should open new ticket modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Ticket' }).click();

    await expect(page.getByText('New Ticket')).toBeVisible();
    await expect(page.getByText('Subject')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();
    await expect(page.getByText('Tier')).toBeVisible();
  });

  test('should display Analyze Churn Risk agent button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Analyze Churn Risk' })).toBeVisible();
  });
});

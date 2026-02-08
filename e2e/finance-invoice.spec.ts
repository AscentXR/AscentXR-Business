import { test, expect } from '@playwright/test';

test.describe('Finance & Invoices', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance');
  });

  test('should display finance overview with KPI cards', async ({ page }) => {
    await expect(page.getByText('Finance')).toBeVisible();
    await expect(page.getByText('Invoices, Expenses & Budgets')).toBeVisible();

    // KPI cards
    await expect(page.getByText('Revenue')).toBeVisible();
    await expect(page.getByText('Expenses')).toBeVisible();
    await expect(page.getByText('Net Income')).toBeVisible();
    await expect(page.getByText('Budget Utilization')).toBeVisible();
  });

  test('should switch between finance tabs', async ({ page }) => {
    const tabs = ['Overview', 'Invoices', 'Expenses', 'Budgets'];
    for (const tab of tabs) {
      await page.getByRole('button', { name: tab }).click();
      await page.waitForTimeout(300);
    }
  });

  test('should open new invoice modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Invoices' }).click();
    await page.getByRole('button', { name: '+ New Invoice' }).click();

    await expect(page.getByText('Invoice Details')).toBeVisible();
    await expect(page.getByText('Invoice #')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Issue Date')).toBeVisible();
    await expect(page.getByText('Due Date')).toBeVisible();
  });

  test('should show invoice status options including paid', async ({ page }) => {
    await page.getByRole('button', { name: 'Invoices' }).click();
    await page.getByRole('button', { name: '+ New Invoice' }).click();

    const statusSelect = page.locator('select').filter({ hasText: 'Draft' });
    await expect(statusSelect).toBeVisible();

    // Verify status options exist
    const options = statusSelect.locator('option');
    const optionTexts = await options.allTextContents();
    expect(optionTexts).toContain('Draft');
    expect(optionTexts).toContain('Sent');
    expect(optionTexts).toContain('Paid');
    expect(optionTexts).toContain('Overdue');
  });

  test('should open add expense modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Expenses' }).click();
    await page.getByRole('button', { name: '+ Add Expense' }).click();

    await expect(page.getByText('Add Expense')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Amount ($)')).toBeVisible();
    await expect(page.getByText('Category')).toBeVisible();
  });

  test('should display agent trigger buttons for finance', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Categorize Expenses' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draft Invoice' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cash Flow Forecast' })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Agent Execution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agents');
  });

  test('should display agent coordination page', async ({ page }) => {
    await expect(page.getByText('Agent Coordination')).toBeVisible();
    await expect(page.getByText('Manage AI agents and their tasks')).toBeVisible();
  });

  test('should display agent grid cards', async ({ page }) => {
    // Wait for agent cards or loading state to resolve
    await page.waitForTimeout(1000);
    // Agent cards should show or loading placeholders
    const hasAgents = await page.locator('[class*="rounded-xl"]').count();
    expect(hasAgents).toBeGreaterThan(0);
  });

  test('should display task history section', async ({ page }) => {
    await expect(page.getByText('Task History')).toBeVisible();
  });

  test('should open execute task modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ Execute Task' }).click();

    await expect(page.getByText('Execute Agent Task')).toBeVisible();
    await expect(page.getByText('Agent')).toBeVisible();
    await expect(page.getByText('Task Title')).toBeVisible();
    await expect(page.getByText('Prompt')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible();
  });

  test('should have disabled execute button when no agent or prompt', async ({ page }) => {
    await page.getByRole('button', { name: '+ Execute Task' }).click();
    const executeBtn = page.getByRole('button', { name: 'Execute' });
    await expect(executeBtn).toBeDisabled();
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.getByRole('button', { name: '+ Execute Task' }).click();
    await expect(page.getByText('Execute Agent Task')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Execute Agent Task')).not.toBeVisible();
  });
});

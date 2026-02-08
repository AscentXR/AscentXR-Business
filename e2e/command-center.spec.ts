import { test, expect } from '@playwright/test';

test.describe('Command Center', () => {
  test('should display dashboard with KPI cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Command Center')).toBeVisible();
    await expect(page.getByText('Mission Control for Ascent XR')).toBeVisible();

    // KPI cards
    await expect(page.getByText('Revenue')).toBeVisible();
    await expect(page.getByText('Pipeline Value')).toBeVisible();
    await expect(page.getByText('Active Deals')).toBeVisible();
    await expect(page.getByText('Active Agents')).toBeVisible();
  });

  test('should display revenue progress bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Revenue Progress to $300K')).toBeVisible();
  });

  test('should display revenue trend chart', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Revenue Trend')).toBeVisible();
  });

  test('should display top objectives section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Top Objectives - Q1 2026')).toBeVisible();
  });

  test('should display milestone timeline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Milestone Timeline')).toBeVisible();
    await expect(page.getByText('Company Founded')).toBeVisible();
    await expect(page.getByText('Product v1.0 Launch')).toBeVisible();
  });

  test('should navigate to Sales via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Sales/ }).click();
    await page.waitForURL('/sales');
    await expect(page.getByText('Sales')).toBeVisible();
  });

  test('should navigate to all main sections', async ({ page }) => {
    await page.goto('/');

    const sections = [
      { link: /Finance/, url: '/finance', title: 'Finance' },
      { link: /Goals/, url: '/goals', title: 'Goals & OKRs' },
      { link: /Agents/, url: '/agents', title: 'Agent Coordination' },
      { link: /Customer Success/, url: '/customer-success', title: 'Customer Success' },
    ];

    for (const section of sections) {
      await page.getByRole('link', { name: section.link }).click();
      await page.waitForURL(section.url);
      await expect(page.getByText(section.title)).toBeVisible();
    }
  });
});

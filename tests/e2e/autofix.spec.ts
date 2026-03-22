import { test, expect } from '@playwright/test';

test.describe('Autofix Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('hasVisited', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should generate and accept AI suggestion', async ({ page }) => {
    await page.route('**/api/complete', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestion: ' This is an AI-generated continuation.',
        }),
      });
    });

    const editor = page.locator('[data-testid="input-editor"]');
    await editor.click();
    await page.keyboard.type(
      'This is a test sentence that should trigger AI completion.'
    );

    const generatingStatus = page.locator('[data-testid="status-generating"]');
    await expect(generatingStatus).toBeVisible();

    const suggestion = page.locator('[data-testid="text-suggestion"]');
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toContainText(
      'This is an AI-generated continuation.'
    );

    await page.keyboard.press('Tab');

    await expect(editor).toHaveValue(
      'This is a test sentence that should trigger AI completion. This is an AI-generated continuation.'
    );
    await expect(suggestion).not.toBeVisible();
  });

  test('should handle API status check', async ({ page }) => {
    await page.route('**/api/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          providers: { gemini: true, sambanova: false },
        }),
      });
    });

    await expect(page.locator('[data-testid="input-editor"]')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    await page.route('**/api/complete', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ suggestion: '' }),
      });
    });

    const editor = page.locator('[data-testid="input-editor"]');
    await editor.click();
    await page.keyboard.type(
      'This is a test sentence that should trigger AI completion.'
    );

    const generatingStatus = page.locator('[data-testid="status-generating"]');
    await expect(generatingStatus).toBeVisible();
    await expect(generatingStatus).not.toBeVisible();

    const suggestion = page.locator('[data-testid="text-suggestion"]');
    await expect(suggestion).not.toBeVisible();
  });
});

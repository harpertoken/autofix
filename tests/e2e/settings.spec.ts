import { test, expect } from '@playwright/test';

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('hasVisited', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should change AI provider in settings', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="button-settings"]');
    await settingsButton.click();

    const aiTab = page.locator('[data-testid="tab-ai"]');
    await aiTab.click();

    const providerSelect = page.locator('[data-testid="select-ai-provider"]');
    await providerSelect.selectOption('gemini');

    const closeButton = page.locator('[data-testid="button-close-settings"]');
    await closeButton.click();

    await settingsButton.click();
    await aiTab.click();
    await expect(providerSelect).toHaveValue('gemini');
  });

  test('should change completion mode and writing style', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="button-settings"]');
    await settingsButton.click();

    const modeSelect = page.locator('[data-testid="select-completion-mode"]');
    await modeSelect.selectOption('paragraph');

    const styleSelect = page.locator('[data-testid="select-writing-style"]');
    await styleSelect.selectOption('formal');

    const closeButton = page.locator('[data-testid="button-close-settings"]');
    await closeButton.click();

    await settingsButton.click();
    await expect(modeSelect).toHaveValue('paragraph');
    await expect(styleSelect).toHaveValue('formal');
  });

  test('should toggle auto-save setting', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="button-settings"]');
    await settingsButton.click();

    const autoSaveSwitch = page.locator('[data-testid="switch-auto-save"]');
    await autoSaveSwitch.check();

    await expect(autoSaveSwitch).toBeChecked();
  });
});

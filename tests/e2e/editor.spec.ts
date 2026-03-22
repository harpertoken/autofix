import { test, expect } from '@playwright/test';

test.describe('Text Editor App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('hasVisited', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should load the editor page', async ({ page }) => {
    await expect(page).toHaveTitle(/Harper Autofix/);
    const editor = page.locator('[data-testid="input-editor"]');
    await expect(editor).toBeVisible();
  });

  test('should allow typing in the editor', async ({ page }) => {
    const editor = page.locator('[data-testid="input-editor"]');
    await editor.click();
    await page.keyboard.type('Hello, world!');
    await expect(editor).toHaveValue('Hello, world!');
  });

  test('should open settings panel', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="button-settings"]');
    await settingsButton.click();
    const settingsPanel = page.locator('[data-testid="panel-settings"]');
    await expect(settingsPanel).toBeVisible();
  });

  test('should open keyboard shortcuts modal', async ({ page }) => {
    await page.keyboard.press('Control+/');
    const shortcutsModal = page.locator('[data-testid="modal-shortcuts"]');
    await expect(shortcutsModal).toBeVisible();
  });

  test('should open providers modal from settings', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="button-settings"]');
    await settingsButton.click();
    const learnMoreLink = page.locator('text=Learn more');
    await learnMoreLink.click();
    const providersModal = page.locator('[data-testid="modal-providers"]');
    await expect(providersModal).toBeVisible();
    await expect(providersModal).toContainText('AI Providers');
    await expect(providersModal).toContainText('Google Gemini 3.0 Pro Preview');
    await expect(providersModal).toContainText('SambaNova GPT-OSS-120B');
  });

  test('should update word count', async ({ page }) => {
    const editor = page.locator('[data-testid="input-editor"]');
    await editor.click();
    await page.keyboard.type('This is a test sentence.');
    const wordCount = page.locator('[data-testid="text-word-count"]');
    await expect(wordCount).toContainText('5');
  });
});

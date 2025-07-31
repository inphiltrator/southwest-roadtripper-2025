import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should load application without errors', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('text=Startpunkt:')).toBeVisible();
    await expect(page.locator('text=Zielpunkt:')).toBeVisible();
  });

  test('should allow text input in waypoint fields', async ({ page }) => {
    const startInput = page.locator('input').first();
    await startInput.click();
    await startInput.fill('Phoenix');
    await expect(startInput).toHaveValue('Phoenix');
  });

  test('should handle empty input gracefully', async ({ page }) => {
    const startInput = page.locator('input').first();
    await startInput.click();
    await startInput.fill('');
    await expect(page.locator('text=Startpunkt:')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Waypoint Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    });

    test('should autocomplete start and finish entries', async ({ page }) => {
        const inputs = page.locator('input');

        await test.step('autocompletes start location', async () => {
            const startInput = inputs.first();
            await startInput.click();
            await startInput.fill('Los Angeles');
            await expect(startInput).toHaveValue('Los Angeles');
        });

        await test.step('autocompletes finish location', async () => {
            const finishInput = inputs.nth(1);
            await finishInput.click();
            await finishInput.fill('San Francisco');
            await expect(finishInput).toHaveValue('San Francisco');
        });
    });

    test('should add and remove intermediate waypoints', async ({ page }) => {
        await test.step('adds a waypoint', async () => {
            await page.click('.leaflet-container');
            const waypoints = page.locator('li');
            await expect(waypoints).toHaveCount(1);
        });

        await test.step('removes a waypoint', async () => {
            const removeButton = page.locator('li button').first();
            await removeButton.click();
            const waypoints = page.locator('li');
            await expect(waypoints).toHaveCount(0);
        });
    });

    test('should display validation messages for DestinationInput', async ({ page }) => {
        await test.step('assert empty input validation', async () => {
            const finishInput = page.locator('input').nth(1);
            await finishInput.fill('');
            await finishInput.press('Tab');
            const validationMessage = await finishInput.evaluate(e => e.validationMessage);
            await expect(validationMessage).not.toBe('');
        });
    });
});


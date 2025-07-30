import { test, expect } from '@playwright/test';

test.describe('Southwest Roadtripper Homepage', () => {
	test('should load the homepage and display navigation', async ({ page }) => {
		await page.goto('/');

		// Check for the main heading
		await expect(page.locator('h1')).toContainText('Southwest Roadtripper 2025');

		// Check for navigation elements
		await expect(page.getByRole('button', { name: /current trip/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /discover/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /profile/i })).toBeVisible();
	});

	test('should display the glass UI design', async ({ page }) => {
		await page.goto('/');

		// Check for glass card elements
		const glassCards = page.locator('.glass-card');
		await expect(glassCards.first()).toBeVisible();

		// Check for glass button styling
		const glassButtons = page.locator('.glass-button');
		await expect(glassButtons.first()).toBeVisible();
	});

	test('should show the map container', async ({ page }) => {
		await page.goto('/');

		// Wait for map to load
		await page.waitForSelector('.leaflet-container', { timeout: 10000 });

		// Check if map is visible
		const mapContainer = page.locator('.leaflet-container');
		await expect(mapContainer).toBeVisible();

		// Check for map controls
		await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
	});
});

import { test, expect } from '@playwright/test';

test.describe('Waypoint Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('.leaflet-container', { timeout: 10000 });
	});

	test('should add a waypoint by clicking the map', async ({ page }) => {
		// Click on the map to add a waypoint
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });

		// Wait for the popup to appear
		await expect(page.locator('.leaflet-popup-content')).toBeVisible();

		// Click the "Add to Route" button
		await page.getByRole('button', { name: /add to route/i }).click();

		// Check if the waypoint appears in the list
		await expect(page.locator('.waypoint-manager')).toContainText(/custom waypoint/i);
	});

	test('should remove a waypoint from the list', async ({ page }) => {
		// Add a waypoint first
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		// Remove the waypoint
		await page.locator('.waypoint-manager .remove-waypoint').click();

		// Check that the waypoint is gone
		await expect(page.locator('.waypoint-manager')).not.toContainText(/custom waypoint/i);
	});

	test('should clear all waypoints', async ({ page }) => {
		// Add multiple waypoints
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		await page.getByRole('button', { name: /add to route/i }).click();
		await page.locator('.leaflet-container').click({ position: { x: 400, y: 300 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		// Click the "Clear All" button
		await page.getByRole('button', { name: /clear all/i }).click();

		// Check that all waypoints are gone
		await expect(page.locator('.waypoint-manager')).not.toContainText(/custom waypoint/i);
	});
});

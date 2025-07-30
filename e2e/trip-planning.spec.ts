import { test, expect } from '@playwright/test';

test.describe('Trip Planning', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('.leaflet-container', { timeout: 10000 });
	});

	test('should create a new trip with waypoints', async ({ page }) => {
		// Add some waypoints to create a trip
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		await page.locator('.leaflet-container').click({ position: { x: 400, y: 300 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		// Check that the route is displayed
		await expect(page.locator('.leaflet-interactive')).toBeVisible();

		// Check that trip details are shown
		const tripCard = page.locator('.trip-card');
		await expect(tripCard).toBeVisible();
		await expect(tripCard).toContainText('Distance:');
		await expect(tripCard).toContainText('Duration:');
	});

	test('should display route information', async ({ page }) => {
		// Add waypoints to create a route
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		await page.locator('.leaflet-container').click({ position: { x: 400, y: 300 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		// Wait for routing to complete
		await page.waitForTimeout(2000);

		// Check for route information
		const tripInfo = page.locator('.trip-card');
		await expect(tripInfo).toContainText(/miles|km/i);
		await expect(tripInfo).toContainText(/hours|minutes/i);
	});

	test('should show POI discovery near route', async ({ page }) => {
		// Add waypoints to create a route
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		await page.locator('.leaflet-container').click({ position: { x: 400, y: 300 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		// Wait for POI discovery to complete
		await page.waitForTimeout(3000);

		// Check for POI markers on the map
		const poiMarkers = page.locator('.leaflet-marker-icon');
		await expect(poiMarkers.first()).toBeVisible();
	});

	test('should persist trip data across page reloads', async ({ page }) => {
		// Add waypoints
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		await page.getByRole('button', { name: /add to route/i }).click();

		// Reload the page
		await page.reload();
		await page.waitForSelector('.leaflet-container', { timeout: 10000 });

		// Check that the waypoint is still there
		await expect(page.locator('.waypoint-manager')).toContainText(/custom waypoint/i);
	});
});

import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load test fixtures
const routeSuccessFixture = JSON.parse(
	readFileSync(join(__dirname, '../fixtures/route-success.json'), 'utf-8')
);
const routeErrorFixture = JSON.parse(
	readFileSync(join(__dirname, '../fixtures/route-error.json'), 'utf-8')
);

test.describe('OpenRouteService Integration', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app and wait for map to initialize
		await page.goto('/');
		await page.waitForSelector('.leaflet-container', { timeout: 10000 });
		
		// Wait for any initial loading to complete
		await page.waitForTimeout(1000);
	});

	test('should successfully render route polyline with mocked API response', async ({ page }) => {
		await test.step('Mock successful OpenRouteService API response', async () => {
			await page.route('https://api.openrouteservice.org/**', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(routeSuccessFixture)
				});
			});
		});

		await test.step('Add waypoints to trigger route calculation', async () => {
			// Add first waypoint (Las Vegas)
			await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
			await page.waitForTimeout(500);

			// Add second waypoint to trigger routing
			await page.click('.leaflet-container', { position: { x: 500, y: 200 } });
			await page.waitForTimeout(1000);
		});

		await test.step('Verify loading spinner appears during route calculation', async () => {
			// Check for loading state in RouteAlternatives component
			const loadingSpinner = page.locator('[data-testid="route-loading"], .animate-spin').first();
			// The spinner might be very quick, so we'll check if it appears or if we see results
			const hasLoadingOrResults = await Promise.race([
				loadingSpinner.isVisible(),
				page.locator('[data-testid="route-alternatives"]').isVisible()
			]);
			expect(hasLoadingOrResults).toBeTruthy();
		});

		await test.step('Verify route polyline is rendered on map', async () => {
			// Wait for route calculation to complete
			await page.waitForSelector('[data-testid="route-alternatives"]', { timeout: 5000 });
			
			// Check for polyline elements in the map
			const polylines = page.locator('.leaflet-container path[stroke]');
			await expect(polylines).toHaveCount(1, { timeout: 5000 });
			
			// Verify polyline has correct styling attributes
			const polyline = polylines.first();
			await expect(polyline).toHaveAttribute('stroke');
			await expect(polyline).toHaveAttribute('stroke-width');
		});

		await test.step('Verify route alternatives are displayed with correct data', async () => {
			// Check that route alternatives component shows the calculated route
			const routeCard = page.locator('[data-testid="route-card"]').first();
			await expect(routeCard).toBeVisible();
			
			// Verify distance is displayed (should be converted from meters to miles)
			const expectedDistance = Math.round(routeSuccessFixture.routes[0].summary.distance / 1609.344);
			await expect(page.locator(`text=${expectedDistance} mi`)).toBeVisible();
			
			// Verify duration is displayed (should be converted from seconds to minutes)
			const expectedDuration = Math.round(routeSuccessFixture.routes[0].summary.duration / 60);
			const durationText = expectedDuration > 60 
				? `${Math.floor(expectedDuration / 60)}h ${expectedDuration % 60}m`
				: `${expectedDuration} min`;
			await expect(page.locator(`text=${durationText}`)).toBeVisible();
		});

		await test.step('Verify trip summary is updated', async () => {
			// Check that the trip summary shows updated values
			const tripSummary = page.locator('[data-testid="trip-summary"]');
			await expect(tripSummary).toBeVisible();
			
			// Should show distance and duration from the API response
			await expect(tripSummary.locator('text=/\\d+ mi/')).toBeVisible();
			await expect(tripSummary.locator('text=/\\d+h \\d+m|\\d+ min/')).toBeVisible();
		});
	});

	test('should handle API errors gracefully with error UI', async ({ page }) => {
		await test.step('Mock OpenRouteService API 500 error', async () => {
			await page.route('https://api.openrouteservice.org/**', async (route) => {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify(routeErrorFixture)
				});
			});
		});

		await test.step('Add waypoints to trigger route calculation', async () => {
			// Add first waypoint
			await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
			await page.waitForTimeout(500);

			// Add second waypoint to trigger routing
			await page.click('.leaflet-container', { position: { x: 500, y: 200 } });
			await page.waitForTimeout(1000);
		});

		await test.step('Verify loading spinner appears initially', async () => {
			// Should show loading state before falling back to mock
			const loadingIndicator = page.locator('.animate-spin, [data-testid="route-loading"]').first();
			// Loading might be brief due to fallback, so check for either loading or results
			const hasActivity = await Promise.race([
				loadingIndicator.isVisible(),
				page.waitForTimeout(2000).then(() => true)
			]);
			expect(hasActivity).toBeTruthy();
		});

		await test.step('Verify graceful fallback to mock routing', async () => {
			// Should fall back to mock calculation and still show results
			await page.waitForTimeout(3000); // Allow time for fallback
			
			// Should still show route alternatives (using mock data)
			const routeAlternatives = page.locator('[data-testid="route-alternatives"]');
			await expect(routeAlternatives).toBeVisible({ timeout: 10000 });
			
			// Should display some route information (mock data)
			await expect(page.locator('text=/\\d+ mi/')).toBeVisible();
		});

		await test.step('Verify error is logged to console', async () => {
			// Check that error was logged (API error message should appear in console)
			const consoleMessages = [];
			page.on('console', msg => {
				if (msg.type() === 'error') {
					consoleMessages.push(msg.text());
				}
			});
			
			// Trigger another route calculation to capture console logs
			await page.click('.leaflet-container', { position: { x: 300, y: 400 } });
			await page.waitForTimeout(2000);
			
			// Should have console error messages
			expect(consoleMessages.some(msg => 
				msg.includes('OpenRouteService') || 
				msg.includes('API failed') ||
				msg.includes('fallback')
			)).toBeTruthy();
		});

		await test.step('Verify no error banner breaks the UI', async () => {
			// Ensure the UI remains functional despite API errors
			const mapContainer = page.locator('.leaflet-container');
			await expect(mapContainer).toBeVisible();
			
			const sidebar = page.locator('[data-testid="sidebar"]');
			await expect(sidebar.or(page.locator('.space-y-6'))).toBeVisible();
			
			// Should still be able to interact with the map
			await page.click('.leaflet-container', { position: { x: 350, y: 350 } });
			await expect(page.locator('li')).toHaveCount(3); // Should have 3 waypoints now
		});
	});

	test('should handle rate limiting with retry logic', async ({ page }) => {
		let requestCount = 0;

		await test.step('Mock rate limiting responses', async () => {
			await page.route('https://api.openrouteservice.org/**', async (route) => {
				requestCount++;
				
				if (requestCount <= 2) {
					// First two requests return 429 (rate limited)
					await route.fulfill({
						status: 429,
						contentType: 'application/json',
						body: JSON.stringify({
							error: {
								code: 4003,
								message: 'Rate limit exceeded'
							}
						})
					});
				} else {
					// Third request succeeds
					await route.fulfill({
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify(routeSuccessFixture)
					});
				}
			});
		});

		await test.step('Add waypoints to trigger route calculation with retries', async () => {
			await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
			await page.waitForTimeout(500);

			await page.click('.leaflet-container', { position: { x: 500, y: 200 } });
		});

		await test.step('Verify loading spinner during retry attempts', async () => {
			// Should show loading during retry attempts
			const loadingSpinner = page.locator('.animate-spin').first();
			await expect(loadingSpinner).toBeVisible({ timeout: 5000 });
		});

		await test.step('Verify successful response after retries', async () => {
			// Should eventually succeed and show route
			await expect(page.locator('[data-testid="route-alternatives"]')).toBeVisible({ timeout: 10000 });
			
			// Verify the correct number of API calls were made (retries + success)
			expect(requestCount).toBe(3);
		});
	});

	test('should display multiple route alternatives', async ({ page }) => {
		await test.step('Mock multiple route alternatives', async () => {
			const multiRouteResponse = {
				...routeSuccessFixture,
				routes: [
					routeSuccessFixture.routes[0],
					{
						...routeSuccessFixture.routes[0],
						summary: {
							distance: 450000,
							duration: 16800
						}
					},
					{
						...routeSuccessFixture.routes[0],
						summary: {
							distance: 425000,
							duration: 17200
						}
					}
				]
			};

			await page.route('https://api.openrouteservice.org/**', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',	
					body: JSON.stringify(multiRouteResponse)
				});
			});
		});

		await test.step('Add waypoints to get route alternatives', async () => {
			await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
			await page.waitForTimeout(500);
			await page.click('.leaflet-container', { position: { x: 500, y: 200 } });
		});

		await test.step('Verify multiple route options are displayed', async () => {
			await page.waitForSelector('[data-testid="route-alternatives"]', { timeout: 5000 });
			
			// Should show multiple route cards
			const routeCards = page.locator('[data-testid="route-card"]');
			await expect(routeCards).toHaveCount(3);
			
			// Each card should have different labels/descriptions
			await expect(page.locator('text=Fastest Route')).toBeVisible();
			await expect(page.locator('text=Scenic Route')).toBeVisible();
			await expect(page.locator('text=Avoid Tolls')).toBeVisible();
		});

		await test.step('Verify route selection functionality', async () => {					 
			// Click on second route option
			await page.locator('[data-testid="route-card"]').nth(1).click();
			
			// Should show selected state
			const selectedRoute = page.locator('[data-testid="route-card"]').nth(1);
			await expect(selectedRoute).toHaveClass(/ring-2|selected|bg-southwest-sage/);
			
			// Should show checkmark or selected indicator
			await expect(selectedRoute.locator('svg[fill="currentColor"]')).toBeVisible();
		});
	});

	test('should handle network connectivity issues', async ({ page }) => {
		await test.step('Simulate network failure', async () => {
			await page.route('https://api.openrouteservice.org/**', async (route) => {
				await route.abort('failed');
			});
		});

		await test.step('Add waypoints during network failure', async () => {
			await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
			await page.waitForTimeout(500);
			await page.click('.leaflet-container', { position: { x: 500, y: 200 } });
		});

		await test.step('Verify graceful fallback to mock routing', async () => {
			// Should fall back to mock calculation
			await expect(page.locator('[data-testid="route-alternatives"]')).toBeVisible({ timeout: 10000 });
			
			// Should show route information from mock calculation
			await expect(page.locator('text=/\\d+ mi/')).toBeVisible();
			await expect(page.locator('text=/\\d+h \\d+m|\\d+ min/')).toBeVisible();
		});

		await test.step('Verify user can continue using the app', async () => {
			// Should be able to add more waypoints
			await page.click('.leaflet-container', { position: { x: 300, y: 400 } });
			await expect(page.locator('li')).toHaveCount(3);
			
			// Should be able to remove waypoints
			await page.locator('li button').first().click();
			await expect(page.locator('li')).toHaveCount(2);
		});
	});
});

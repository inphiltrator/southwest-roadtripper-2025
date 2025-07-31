import { test } from '@playwright/test';

test.describe('Debug Map Interaction', () => {
	test('debug map click and popup', async ({ page }) => {
		// Enable console logging
		page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

		await page.goto('/');
		await page.waitForSelector('.leaflet-container', { timeout: 10000 });

		console.log('Map container found');

		// Click on the map
		await page.locator('.leaflet-container').click({ position: { x: 300, y: 200 } });
		console.log('Clicked on map');

		// Wait longer for popup to appear
		await page.waitForTimeout(2000);

		// Look for leaflet popup wrapper first
		const popupWrapper = page.locator('.leaflet-popup');
		const popupWrapperVisible = await popupWrapper.isVisible();
		console.log('Popup wrapper visible:', popupWrapperVisible);

		// Look for popup content
		// See all existing popups in DOM
		const popups = page.locator('.leaflet-popup-content');
		const popupCount = await popups.count();
		console.log('Popup count:', popupCount);

		const popupContent = page.locator('.leaflet-popup-content');
		const popupVisible = await popupContent.isVisible();
		console.log('Popup content visible:', popupVisible);

		if (popupVisible) {
			console.log('Popup visible:', popupVisible);
			if (popupCount) {
				for (let i = 0; i < popupCount; i++) {
					const popupEachText = await popups.nth(i).textContent();
					console.log(`Popup ${i} text:`, popupEachText);
					if (popupVisible) {
						const popupHTML = await popups.nth(i).innerHTML();
						console.log(`Popup ${i} HTML:`, popupHTML);
					}
				}
			}
			const popupHTML = await popupContent.innerHTML();
			console.log('Popup HTML:', popupHTML);
		}

		// Look for markers on the map
		const markers = page.locator('.leaflet-marker-icon');
		const markerCount = await markers.count();
		console.log('Marker count:', markerCount);

		// Look for any buttons with add-to-route-btn class
		const addToRouteBtns = page.locator('.add-to-route-btn');
		const addBtnCount = await addToRouteBtns.count();
		console.log('Add to route button count:', addBtnCount);

		if (addBtnCount > 0) {
			const addBtnVisible = await addToRouteBtns.first().isVisible();
			console.log('Add to route button visible:', addBtnVisible);
			if (addBtnVisible) {
				const addBtnText = await addToRouteBtns.first().textContent();
				console.log('Add to route button text:', addBtnText);
			}
		}

		// Look for any buttons
		const buttons = page.locator('button');
		const buttonCount = await buttons.count();
		console.log('Total button count:', buttonCount);

		// Try to find the specific button by role
		const addToRouteButton = page.getByRole('button', { name: /add to route/i });
		const addButtonVisible = await addToRouteButton.isVisible().catch(() => false);
		console.log('Add to Route button (by role) visible:', addButtonVisible);

		// Take a screenshot for debugging
		await page.screenshot({ path: 'debug-map-click.png', fullPage: true });
	});
});

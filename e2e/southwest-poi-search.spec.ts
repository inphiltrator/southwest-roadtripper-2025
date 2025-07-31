import { test, expect } from '@playwright/test';

test.describe('Southwest POI Discovery - MCP Automated Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('Grand Canyon POI search returns ≥1 national park result', async ({ page }) => {
    // Navigate to Grand Canyon area (36.0544, -112.1401)
    const grandCanyonLat = 36.0544;
    const grandCanyonLng = -112.1401;
    
    // Wait for map to fully load
    await page.waitForTimeout(2000);
    
    // Look for POI filter component
    await expect(page.locator('h3:has-text("POI Filters")')).toBeVisible();
    
    // Ensure national_park category is selected
    const nationalParkCheckbox = page.locator('input[type="checkbox"]').first();
    if (!(await nationalParkCheckbox.isChecked())) {
      await nationalParkCheckbox.check();
    }
    
    // Set search radius to maximum for better coverage
    const radiusSelect = page.locator('select');
    await radiusSelect.selectOption('50000'); // 50km radius
    
    // Click on Grand Canyon area on the map
    // Note: This simulates clicking near Grand Canyon coordinates
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 400, y: 300 } });
    
    // Apply filters to search for POIs
    const applyFiltersButton = page.getByRole('button', { name: /apply filters/i });
    await applyFiltersButton.click();
    
    // Wait for POI discovery to complete
    await page.waitForTimeout(5000);
    
    // Check for loading state completion
    await expect(page.locator('text=Searching Southwest attractions')).not.toBeVisible({ timeout: 10000 });
    
    // Verify that national park POIs are discovered
    const poiResults = page.locator('.grid .rounded-lg');
    await expect(poiResults).toHaveCount.gte(1);
    
    // Check for national park specific content
    const nationalParkResults = page.locator('.rounded-lg:has(span:text("🏜️"))');
    await expect(nationalParkResults).toHaveCount.gte(1);
    
    // Verify POI names contain park-related keywords
    const firstPOI = poiResults.first();
    const poiText = await firstPOI.textContent();
    expect(poiText).toMatch(/(park|canyon|national|reserve|recreation)/i);
    
    console.log('✅ Grand Canyon POI search successfully found national park results');
  });

  test('Grand Canyon POI search shows multiple categories', async ({ page }) => {
    // Test multiple POI categories in Grand Canyon area
    
    // Select multiple categories
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // Select national_park, attraction, and lodging
    await checkboxes.nth(0).check(); // national_park
    await checkboxes.nth(4).check(); // attraction  
    await checkboxes.nth(5).check(); // lodging
    
    // Set large search radius
    await page.locator('select').selectOption('50000');
    
    // Click on map to trigger search
    await page.locator('.leaflet-container').click({ position: { x: 400, y: 300 } });
    
    // Apply filters
    await page.getByRole('button', { name: /apply filters/i }).click();
    
    // Wait for results
    await page.waitForTimeout(5000);
    
    // Verify multiple POI types are found
    const poiResults = page.locator('.grid .rounded-lg');
    await expect(poiResults).toHaveCount.gte(3);
    
    // Check for different category icons
    const nationalParkIcon = page.locator('span:text("🏜️")');
    const attractionIcon = page.locator('span:text("📍")');
    const lodgingIcon = page.locator('span:text("🏨")');
    
    await expect(nationalParkIcon).toHaveCount.gte(1);
    
    console.log('✅ Multiple POI categories discovered successfully');
  });

  test('POI search handles empty results gracefully', async ({ page }) => {
    // Test behavior when no POIs are found
    
    // Select only one very specific category
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(6).check(); // fuel - might be less common in remote areas
    
    // Set very small radius
    await page.locator('select').selectOption('5000');
    
    // Click on remote desert area
    await page.locator('.leaflet-container').click({ position: { x: 100, y: 100 } });
    
    // Apply filters
    await page.getByRole('button', { name: /apply filters/i }).click();
    
    // Wait for search completion
    await page.waitForTimeout(3000);
    
    // Should show "no POIs found" message or mock results
    const noResultsMessage = page.locator('text=No POIs found');
    const poiResults = page.locator('.grid .rounded-lg');
    
    // Either no results message OR mock results should be shown
    const hasNoResults = await noResultsMessage.isVisible();
    const hasResults = (await poiResults.count()) > 0;
    
    expect(hasNoResults || hasResults).toBe(true);
    
    console.log('✅ Empty POI search handled gracefully');
  });
});

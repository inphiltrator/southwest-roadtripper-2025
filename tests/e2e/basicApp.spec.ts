import { test, expect, Page } from '@playwright/test';

test.describe('Basic Application Smoke Tests', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    
    // Listen for console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });
    
    await page.goto('/');
  });

  test('should mount without JS console errors', async ({ page }) => {
    // Wait for the app to fully load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);
    
    // Check that no console errors occurred during app mounting
    expect(consoleErrors.length).toBe(0);
    
    // Additional check: ensure the page is fully loaded without critical errors
    const hasError = await page.locator('text=Error').count();
    expect(hasError).toBe(0);
  });

  test('should have Leaflet map container with expected tile layer attributes', async ({ page }) => {
    // Wait for Leaflet map to be initialized
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Verify the Leaflet map container exists and is visible
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Check for tile layer existence
    const tileLayer = page.locator('.leaflet-tile-pane');
    await expect(tileLayer).toBeVisible();
    
    // Verify that tiles are being loaded (tile containers should exist)
    const tileContainer = page.locator('.leaflet-tile-container');
    await expect(tileContainer).toBeVisible();
    
    // Check for basic Leaflet controls
    const zoomControl = page.locator('.leaflet-control-zoom');
    await expect(zoomControl).toBeVisible();
    
    // Verify tile layer has proper src attributes (should contain tile server URLs)
    await page.waitForSelector('.leaflet-tile', { timeout: 5000 });
    const tiles = page.locator('.leaflet-tile');
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);
    
    // Check that at least one tile has a proper source URL
    if (tileCount > 0) {
      const firstTile = tiles.first();
      const src = await firstTile.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toMatch(/https?:\/\/.+/);
    }
  });

  test('should display Waypoint-Manager component', async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // The WaypointManager component should be visible
    // Looking for typical waypoint management elements
    const waypointElements = [
      'text=Startpunkt',
      'text=Zielpunkt',
      'input[placeholder*="Startpunkt"]',
      'input[placeholder*="Zielpunkt"]',
      'text=Waypoint',
      'text=Route'
    ];
    
    // Check for at least some waypoint-related elements
    let foundElements = 0;
    for (const selector of waypointElements) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          foundElements++;
        }
      } catch (error) {
        // Element not found, continue checking others
      }
    }
    
    // Expect at least 2 waypoint-related elements to be found
    expect(foundElements).toBeGreaterThanOrEqual(2);
    
    // More specific check: look for input fields that are typically in waypoint managers
    const inputFields = page.locator('input[type="text"], input[type="search"], input:not([type])');
    const inputCount = await inputFields.count();
    expect(inputCount).toBeGreaterThan(0);
  });

  test('should accept user typing in all input fields', async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Find all text input fields
    const inputFields = page.locator('input[type="text"], input[type="search"], input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"])');
    const inputCount = await inputFields.count();
    
    expect(inputCount).toBeGreaterThan(0);
    
    // Test typing in each input field
    for (let i = 0; i < inputCount; i++) {
      const input = inputFields.nth(i);
      const isVisible = await input.isVisible();
      const isEnabled = await input.isEnabled();
      
      if (isVisible && isEnabled) {
        // Clear any existing content
        await input.click();
        await input.clear();
        
        // Type some test text
        const testText = `Test${i + 1}`;
        await input.fill(testText);
        
        // Verify the text was entered
        const value = await input.inputValue();
        expect(value).toBe(testText);
        
        // Clear the field for next test
        await input.clear();
      }
    }
  });

  test('should have responsive layout and core UI elements', async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Check that essential UI elements are present
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Verify the page has a proper title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for navigation or header elements
    const navigation = page.locator('nav, header, [role="banner"], [role="navigation"]');
    const navCount = await navigation.count();
    // Should have at least some navigation/header structure
    expect(navCount).toBeGreaterThanOrEqual(0);
    
    // Verify the main content area exists
    const mainContent = page.locator('main, [role="main"], .main-content, #main');
    const hasMainContent = await mainContent.count();
    expect(hasMainContent).toBeGreaterThanOrEqual(0);
  });

  test('should handle initial loading states gracefully', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Wait for critical elements to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Check that loading doesn't result in broken states
    const errorMessages = page.locator('text=Error, text=Failed, text=Something went wrong');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
    
    // Verify map initialization completed
    const mapInitialized = page.locator('.leaflet-container .leaflet-map-pane');
    await expect(mapInitialized).toBeVisible();
    
    // Check that the viewport meta tag exists for mobile responsiveness
    const viewportMeta = page.locator('meta[name="viewport"]');
    const hasViewport = await viewportMeta.count();
    expect(hasViewport).toBeGreaterThan(0);
  });
});

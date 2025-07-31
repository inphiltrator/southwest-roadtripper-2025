import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedPOIService } from './EnhancedPOIService';
import type { LatLng, POI } from '../types';

// Mock the environment module
vi.mock('$app/environment', () => ({
  browser: false
}));

// Mock environment variables
vi.mock('../config/env', () => ({
  env: {
    overpassApiUrl: 'https://overpass.private.coffee/api/interpreter',
    openRouteServiceApiKey: 'test-key',
    isDevelopment: true,
    isProduction: false
  }
}));

describe('EnhancedPOIService', () => {
  let poiService: EnhancedPOIService;
  const mockLocation: LatLng = { lat: 36.1699, lng: -115.1398 }; // Las Vegas
  const radius = 10000; // 10km radius

  beforeEach(() => {
    poiService = new EnhancedPOIService();
  });

  describe('buildOverpassQuery', () => {
    it('should build query for national_park category', () => {
      const categories: POI['category'][] = ['national_park'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["boundary"="national_park"]');
      expect(query).toContain('["leisure"="park"]');
      expect(query).toContain('["protection_title"]');
    });

    it('should build query for state_park category', () => {
      const categories: POI['category'][] = ['state_park'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["park_type"="state_park"]');
      expect(query).toContain('["name"~"State Park"]');
      expect(query).toContain('["boundary"="protected_area"]');
    });

    it('should build query for camping category', () => {
      const categories: POI['category'][] = ['camping'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["tourism"="camp_site"]');
      expect(query).toContain('["tourism"="caravan_site"]');
      expect(query).toContain('["amenity"="camping"]');
      expect(query).toContain('["tourism"="wilderness_hut"]');
    });

    it('should build query for dining category', () => {
      const categories: POI['category'][] = ['dining'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["amenity"="restaurant"]');
      expect(query).toContain('["amenity"="cafe"]');
      expect(query).toContain('["amenity"="fast_food"]');
      expect(query).toContain('["amenity"="food_court"]');
      expect(query).toContain('["amenity"="bar"]');
      expect(query).toContain('["amenity"="pub"]');
    });

    it('should build query for attraction category', () => {
      const categories: POI['category'][] = ['attraction'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["tourism"="attraction"]');
      expect(query).toContain('["tourism"="viewpoint"]');
      expect(query).toContain('["historic"]');
      expect(query).toContain('["tourism"="museum"]');
      expect(query).toContain('["tourism"="theme_park"]');
      expect(query).toContain('["natural"="peak"]');
    });

    it('should build query for lodging category', () => {
      const categories: POI['category'][] = ['lodging'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["tourism"="hotel"]');
      expect(query).toContain('["tourism"="motel"]');
      expect(query).toContain('["tourism"="guest_house"]');
      expect(query).toContain('["tourism"="hostel"]');
      expect(query).toContain('["tourism"="apartment"]');
      expect(query).toContain('["tourism"="resort"]');
    });

    it('should build query for fuel category', () => {
      const categories: POI['category'][] = ['fuel'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
expect(query).toContain('["amenity"="fuel"]');
      expect(query).toContain('["shop"="gas"]');
      expect(query).toContain('["amenity"="charging_station"]');
    });

    it('should build query with multiple categories', () => {
      const categories: POI['category'][] = ['national_park', 'camping', 'dining', 'fuel'];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
      expect(query).toContain('around:10000,36.1699,-115.1398');
expect(query).toContain('["boundary"="national_park"]');
      expect(query).toContain('["tourism"="camp_site"]');
      expect(query).toContain('["amenity"="restaurant"]');
      expect(query).toContain('["amenity"="fuel"]');
    });

    it('should handle unknown categories by filtering them out', () => {
      const categories: POI['category'][] = ['unknown_category' as POI['category']];
      const query = poiService['buildOverpassQuery'](mockLocation, radius, categories);
      // Should still have basic query structure but no category-specific parts
      expect(query).toContain('[out:json][timeout:25]');
      expect(query).toContain('out body');
    });
  });

  describe('mapOverpassCategory', () => {
    it('should map national park tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ boundary: 'national_park' })).toBe('national_park');
      expect(poiService['mapOverpassCategory']({ leisure: 'park', protection_title: 'National Park' })).toBe('national_park');
      expect(poiService['mapOverpassCategory']({ leisure: 'nature_reserve', name: 'Grand Canyon National Park' })).toBe('national_park');
    });

    it('should map state park tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ leisure: 'park', park_type: 'state_park' })).toBe('state_park');
      expect(poiService['mapOverpassCategory']({ leisure: 'park', name: 'Valley of Fire State Park' })).toBe('state_park');
      expect(poiService['mapOverpassCategory']({ boundary: 'protected_area', protect_class: '5' })).toBe('state_park');
    });

    it('should map camping tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ tourism: 'camp_site' })).toBe('camping');
      expect(poiService['mapOverpassCategory']({ tourism: 'caravan_site' })).toBe('camping');
      expect(poiService['mapOverpassCategory']({ amenity: 'camping' })).toBe('camping');
      expect(poiService['mapOverpassCategory']({ tourism: 'wilderness_hut' })).toBe('camping');
    });

    it('should map dining tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ amenity: 'restaurant' })).toBe('dining');
      expect(poiService['mapOverpassCategory']({ amenity: 'cafe' })).toBe('dining');
      expect(poiService['mapOverpassCategory']({ amenity: 'fast_food' })).toBe('dining');
      expect(poiService['mapOverpassCategory']({ amenity: 'food_court' })).toBe('dining');
      expect(poiService['mapOverpassCategory']({ amenity: 'bar' })).toBe('dining');
      expect(poiService['mapOverpassCategory']({ amenity: 'pub' })).toBe('dining');
    });

    it('should map attraction tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ tourism: 'attraction' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ tourism: 'viewpoint' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ tourism: 'museum' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ tourism: 'theme_park' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ historic: 'monument' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ natural: 'peak' })).toBe('attraction');
    });

    it('should map lodging tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ tourism: 'hotel' })).toBe('lodging');
      expect(poiService['mapOverpassCategory']({ tourism: 'motel' })).toBe('lodging');
      expect(poiService['mapOverpassCategory']({ tourism: 'guest_house' })).toBe('lodging');
      expect(poiService['mapOverpassCategory']({ tourism: 'hostel' })).toBe('lodging');
      expect(poiService['mapOverpassCategory']({ tourism: 'apartment' })).toBe('lodging');
      expect(poiService['mapOverpassCategory']({ tourism: 'resort' })).toBe('lodging');
    });

    it('should map fuel tags correctly', () => {
      expect(poiService['mapOverpassCategory']({ amenity: 'fuel' })).toBe('fuel');
      expect(poiService['mapOverpassCategory']({ shop: 'gas' })).toBe('fuel');
      expect(poiService['mapOverpassCategory']({ amenity: 'charging_station' })).toBe('fuel');
    });

    it('should fallback to attraction for unknown tags', () => {
      expect(poiService['mapOverpassCategory']({ amenity: 'unknown' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ shop: 'unknown' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({ some_tag: 'some_value' })).toBe('attraction');
      expect(poiService['mapOverpassCategory']({})).toBe('attraction');
    });
  });

});

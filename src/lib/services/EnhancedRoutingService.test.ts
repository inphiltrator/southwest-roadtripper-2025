import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnhancedRoutingService } from './EnhancedRoutingService';
import type { Waypoint } from '../types';

// Mock the environment module
vi.mock('$app/environment', () => ({
	browser: false
}));

// Mock environment variables - test both with and without explicit key
vi.mock('../config/env', () => ({
	env: {
		openRouteServiceApiKey: 'env-test-key-123',
		overpassApiUrl: 'https://overpass.private.coffee/api/interpreter',
		isDevelopment: true,
		isProduction: false
	}
}));

describe('EnhancedRoutingService', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	describe('constructor', () => {
		it('should use environment API key when no explicit key provided', () => {
			const service = new EnhancedRoutingService();

			expect(consoleLogSpy).toHaveBeenCalledWith('🛣️ OpenRouteService configured with API key');
			expect(service['apiKey']).toBe('env-test-key-123');
		});

		it('should use explicit API key when provided', () => {
			const explicitKey = 'explicit-api-key-456';
			const service = new EnhancedRoutingService(explicitKey);

			expect(consoleLogSpy).toHaveBeenCalledWith('🛣️ OpenRouteService configured with API key');
			expect(service['apiKey']).toBe(explicitKey);
		});

		it('should use environment key when explicit key is undefined', () => {
			const service = new EnhancedRoutingService(undefined);

			expect(consoleLogSpy).toHaveBeenCalledWith('🛣️ OpenRouteService configured with API key');
			expect(service['apiKey']).toBe('env-test-key-123');
		});

		it('should use environment key when explicit key is empty string', () => {
			const service = new EnhancedRoutingService('');

			expect(consoleLogSpy).toHaveBeenCalledWith('🛣️ OpenRouteService configured with API key');
			expect(service['apiKey']).toBe('env-test-key-123');
		});

		it('should always log the confirmation message', () => {
			new EnhancedRoutingService('test-key');

			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledWith('🛣️ OpenRouteService configured with API key');
		});
	});

	describe('calculateRoute', () => {
		const testWaypoints: Waypoint[] = [
			{ id: '1', name: 'Start', lat: 36.1699, lng: -115.1398, category: 'attraction' },
			{ id: '2', name: 'End', lat: 36.2048, lng: -115.264, category: 'attraction' }
		];

		it('should throw error for insufficient waypoints', async () => {
			const service = new EnhancedRoutingService();

			await expect(service.calculateRoute([])).rejects.toThrow(
				'At least 2 waypoints are required for routing'
			);
			await expect(service.calculateRoute([testWaypoints[0]])).rejects.toThrow(
				'At least 2 waypoints are required for routing'
			);
		});

		it('should attempt real API call and fallback to mock on failure', async () => {
			const service = new EnhancedRoutingService('test-key');
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Mock fetch to simulate API failure
			global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

			const result = await service.calculateRoute(testWaypoints);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'OpenRouteService API failed, falling back to mock:',
				expect.any(Error)
			);
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('waypoints', testWaypoints);
			expect(result).toHaveProperty('distance');
			expect(result).toHaveProperty('duration');
			expect(result).toHaveProperty('polyline');

			consoleErrorSpy.mockRestore();
		});
	});

	describe('API key property access', () => {
		it('should store the API key correctly when provided explicitly', () => {
			const testKey = 'my-test-key-789';
			const service = new EnhancedRoutingService(testKey);

			// Access private property for testing
			expect(service['apiKey']).toBe(testKey);
		});

		it('should store the environment API key correctly when no explicit key provided', () => {
			const service = new EnhancedRoutingService();

			// Access private property for testing
			expect(service['apiKey']).toBe('env-test-key-123');
		});
	});
});

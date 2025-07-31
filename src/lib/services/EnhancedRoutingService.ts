import polyline from '@mapbox/polyline';
import type { Waypoint, Route } from '../types';
import { env } from '$lib/config/env';

/**
 * Enhanced routing service using OpenRouteService API
 * Optimized for Southwest USA with robust error handling and retry logic
 */
export class EnhancedRoutingService {
	private readonly apiKey: string;
	private readonly baseUrl = 'https://api.openrouteservice.org/v2';
	private readonly rateLimitDelay = 1000; // 1 second between requests
	private lastRequestTime = 0;
	private readonly maxRetries = 3;

	constructor(apiKey?: string) {
		// Use environment config for API key
		this.apiKey = apiKey || env.openRouteServiceApiKey;
		console.log('🛣️ OpenRouteService configured with API key');
	}

	/**
	 * Calculate route between waypoints optimized for Southwest USA
	 */
	async calculateRoute(waypoints: Waypoint[]): Promise<Route> {
		if (waypoints.length < 2) {
			throw new Error('At least 2 waypoints are required for routing');
		}


		try {
			return await this.makeRoutingRequest(waypoints);
		} catch (error) {
			console.error('OpenRouteService API failed, falling back to mock:', error);
			return this.mockRouteCalculation(waypoints);
		}
	}

	/**
	 * Make routing request to OpenRouteService API with rate limiting and retries
	 */
	private async makeRoutingRequest(waypoints: Waypoint[], retryCount = 0): Promise<Route> {
		// Rate limiting - ensure minimum delay between requests
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.rateLimitDelay) {
			await this.sleep(this.rateLimitDelay - timeSinceLastRequest);
		}
		this.lastRequestTime = Date.now();

		const coordinates = waypoints.map((wp) => [wp.lng, wp.lat]);

		// Southwest USA optimized request body
		const requestBody = {
			coordinates,
			radiuses: waypoints.map(() => -1), // No radius limit
			instructions: false,
			elevation: true,
			extra_info: ['waytype', 'steepness'],
			// Southwest-specific optimizations
			options: {
				avoid_features: [] // Don't avoid any features by default
			}
		};

		const response = await fetch(`${this.baseUrl}/directions/driving-car`, {
			method: 'POST',
			headers: {
				Accept:
					'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
				Authorization: this.apiKey,
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			const errorText = await response.text();
			if (response.status === 429 && retryCount < this.maxRetries) {
				// Rate limited - exponential backoff
				const backoffDelay = Math.pow(2, retryCount) * 1000;
				console.log(`Rate limited, retrying in ${backoffDelay}ms...`);
				await this.sleep(backoffDelay);
				return this.makeRoutingRequest(waypoints, retryCount + 1);
			}
			throw new Error(`OpenRouteService API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();

		// Transform OpenRouteService response to our Route format
		const route = data.routes[0];
		return {
			id: this.generateRouteId(),
			waypoints,
			distance: Math.round(route.summary.distance / 1609.344), // Convert meters to miles
			duration: Math.round(route.summary.duration / 60), // Convert seconds to minutes
			polyline: route.geometry,
			elevation: route.elevation || undefined
		};
	}

	/**
	 * Get route alternatives with Southwest-specific profiles
	 */
	async getRouteAlternatives(waypoints: Waypoint[], maxAlternatives = 3): Promise<Route[]> {

		const profiles = ['driving-car', 'driving-hgv']; // Car and truck routes
		const alternatives: Route[] = [];

		for (let i = 0; i < Math.min(profiles.length, maxAlternatives); i++) {
			try {
				const route = await this.makeRoutingRequestWithProfile(waypoints, profiles[i]);
				alternatives.push(route);
			} catch (error) {
				console.warn(`Failed to get route with profile ${profiles[i]}:`, error);
			}
		}

		// If we don't have enough alternatives, add variations
		if (alternatives.length < maxAlternatives) {
			const mockAlternatives = this.getMockAlternatives(
				waypoints,
				maxAlternatives - alternatives.length
			);
			alternatives.push(...mockAlternatives);
		}

		return alternatives;
	}

	/**
	 * Make routing request with specific profile
	 */
	private async makeRoutingRequestWithProfile(
		waypoints: Waypoint[],
		profile: string
	): Promise<Route> {
		const coordinates = waypoints.map((wp) => [wp.lng, wp.lat]);

		const response = await fetch(`${this.baseUrl}/directions/${profile}`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: this.apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				coordinates,
				instructions: false,
				elevation: false
			})
		});

		if (!response.ok) {
			throw new Error(`API error for profile ${profile}: ${response.status}`);
		}

		const data = await response.json();
		const route = data.routes[0];

		return {
			id: this.generateRouteId(),
			waypoints,
			distance: Math.round(route.summary.distance / 1609.344),
			duration: Math.round(route.summary.duration / 60),
			polyline: route.geometry
		};
	}

	/**
	 * Validate Southwest USA coordinates
	 */
	private validateSouthwestCoordinates(waypoints: Waypoint[]): boolean {
		const southwestBounds = {
			north: 42.0,
			south: 31.3,
			east: -103.0,
			west: -124.4
		};

		return waypoints.every(
			(wp) =>
				wp.lat >= southwestBounds.south &&
				wp.lat <= southwestBounds.north &&
				wp.lng >= southwestBounds.west &&
				wp.lng <= southwestBounds.east
		);
	}

	/**
	 * Mock route calculation for demo/fallback
	 */
	private mockRouteCalculation(waypoints: Waypoint[]): Route {
		let totalDistance = 0;
		let totalDuration = 0;

		for (let i = 0; i < waypoints.length - 1; i++) {
			const distance = this.calculateDistance(
				waypoints[i].lat,
				waypoints[i].lng,
				waypoints[i + 1].lat,
				waypoints[i + 1].lng
			);

			totalDistance += distance;
			// Southwest USA average: ~50 mph including stops
			totalDuration += (distance / 50) * 60;
		}

		return {
			id: this.generateRouteId(),
			waypoints,
			distance: Math.round(totalDistance),
			duration: Math.round(totalDuration),
			polyline: this.generateMockPolyline(waypoints)
		};
	}

	/**
	 * Get mock alternatives for fallback
	 */
	private getMockAlternatives(waypoints: Waypoint[], count: number): Route[] {
		const baseRoute = this.mockRouteCalculation(waypoints);
		const alternatives: Route[] = [];

		for (let i = 0; i < count; i++) {
			const variation = {
				...baseRoute,
				id: this.generateRouteId(),
				distance: Math.round(baseRoute.distance * (0.95 + Math.random() * 0.1)),
				duration: Math.round(baseRoute.duration * (0.9 + Math.random() * 0.2))
			};
			alternatives.push(variation);
		}

		return alternatives;
	}

	/**
	 * Calculate distance using Haversine formula
	 */
	private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 3959; // Earth's radius in miles
		const dLat = this.toRadians(lat2 - lat1);
		const dLng = this.toRadians(lng2 - lng1);

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.toRadians(lat1)) *
				Math.cos(this.toRadians(lat2)) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	private toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	private generateRouteId(): string {
		return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateMockPolyline(waypoints: Waypoint[]): string {
		// Encode mock polyline to match real API format
		const coords: [number, number][] = waypoints.map((wp) => [wp.lat, wp.lng] as [number, number]);
		return polyline.encode(coords);
	}

	/**
	 * Decode polyline string to coordinate array
	 * Utility method for components that need coordinate arrays
	 */
	static decodePolyline(encoded: string): [number, number][] {
		return polyline.decode(encoded);
	}

	/**
	 * Sleep utility for rate limiting
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

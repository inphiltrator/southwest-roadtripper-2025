import type { Waypoint, Route, RouteResponse } from '../types';

/**
 * Service for routing calculations using OpenRouteService API
 * Optimized for Southwest USA travel
 */
export class RoutingService {
	private readonly apiKey: string;
	private readonly baseUrl = 'https://api.openrouteservice.org/v2';

	constructor(apiKey?: string) {
		// For demo purposes, we'll use a mock implementation
		// In production, you would pass a real OpenRouteService API key
		this.apiKey = apiKey || 'demo-key';
	}

	/**
	 * Calculate route between waypoints optimized for Southwest USA
	 */
	async calculateRoute(waypoints: Waypoint[]): Promise<Route> {
		if (waypoints.length < 2) {
			throw new Error('At least 2 waypoints are required for routing');
		}

		try {
			// Mock implementation for demo - replace with real API call
			if (this.apiKey === 'demo-key') {
				return this.mockRouteCalculation(waypoints);
			}

			// Real API implementation would go here
			const coordinates = waypoints.map((wp) => [wp.lng, wp.lat]);

			const response = await fetch(`${this.baseUrl}/directions/driving-car`, {
				method: 'POST',
				headers: {
					Accept:
						'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
					Authorization: this.apiKey,
					'Content-Type': 'application/json; charset=utf-8'
				},
				body: JSON.stringify({
					coordinates,
					radiuses: waypoints.map(() => -1), // No radius limit
					instructions: false,
					elevation: true,
					extra_info: ['waytype', 'steepness']
				})
			});

			if (!response.ok) {
				throw new Error(`Routing API error: ${response.status}`);
			}

			const data: RouteResponse = await response.json();

			return {
				id: this.generateRouteId(),
				waypoints,
				distance: data.distance,
				duration: data.duration,
				polyline: data.polyline,
				elevation: data.elevation
			};
		} catch (error) {
			console.error('Route calculation failed:', error);
			// Fallback to mock calculation
			return this.mockRouteCalculation(waypoints);
		}
	}

	/**
	 * Mock route calculation for demo purposes
	 * Provides realistic Southwest USA travel estimates
	 */
	private mockRouteCalculation(waypoints: Waypoint[]): Route {
		let totalDistance = 0;
		let totalDuration = 0;

		// Calculate approximate distances between waypoints
		for (let i = 0; i < waypoints.length - 1; i++) {
			const distance = this.calculateDistance(
				waypoints[i].lat,
				waypoints[i].lng,
				waypoints[i + 1].lat,
				waypoints[i + 1].lng
			);

			totalDistance += distance;
			// Southwest USA average: ~50 mph including stops
			totalDuration += (distance / 50) * 60; // Convert to minutes
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
	 * Calculate distance between two coordinates using Haversine formula
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
		// Simplified polyline generation for demo
		const coords = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join('|');
		return `mock_polyline_${coords}`;
	}

	/**
	 * Get route alternatives (requires premium API key)
	 */
	async getRouteAlternatives(waypoints: Waypoint[], maxAlternatives = 3): Promise<Route[]> {
		// For demo, return single route with variations
		const baseRoute = await this.calculateRoute(waypoints);
		const alternatives: Route[] = [baseRoute];

		// Generate mock alternatives with slight variations
		for (let i = 1; i < maxAlternatives; i++) {
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
}

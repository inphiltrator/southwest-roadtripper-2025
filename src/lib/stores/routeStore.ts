import { writable, derived } from 'svelte/store';
import type { Route, Waypoint, LatLng } from '$lib/types';
import { EnhancedRoutingService } from '$lib/services';

const routingService = new EnhancedRoutingService();

// Core Route State
export const activeRoute = writable<Route | null>(null);
export const routeAlternatives = writable<Route[]>([]);
export const routeLoading = writable(false);
export const routeError = writable<string | null>(null);

// Route Planning State
export const routeWaypoints = writable<Waypoint[]>([]);
export const routeProfile = writable<'driving-car' | 'driving-hgv'>('driving-car');
export const routeOptions = writable({
	avoidTolls: false,
	avoidFerries: true,
	preferScenic: false
});

// Southwest-specific routing preferences
export const southwestRoutePreferences = writable({
	preferInterstates: false, // I-15, I-40, I-10
	includeScenicroutes: true, // Route 66, etc.
	avoidUnpavedRoads: true, // Desert safety
	maxDetourDistance: 50 // miles
});

// Derived stores
export const routeDistance = derived(activeRoute, ($activeRoute) => {
	return $activeRoute?.distance || 0;
});

export const routeDuration = derived(activeRoute, ($activeRoute) => {
	return $activeRoute?.duration || 0;
});

export const routePolyline = derived(activeRoute, ($activeRoute) => {
	return $activeRoute?.polyline || '';
});

export const routeElevation = derived(activeRoute, ($activeRoute) => {
	return $activeRoute?.elevation || [];
});

export const hasActiveRoute = derived(activeRoute, ($activeRoute) => {
	return $activeRoute !== null;
});

export const routeSummary = derived(
	[routeDistance, routeDuration, routeWaypoints],
	([$distance, $duration, $waypoints]) => ({
		distance: $distance,
		duration: $duration,
		waypoints: $waypoints.length,
		estimatedFuelCost: Math.round(($distance / 25) * 3.5), // ~25 MPG, $3.50/gallon
		estimatedDrivingTime: Math.round($duration / 60) // hours
	})
);

// Route Store Actions
export const routeStore = {
	// Calculate route between waypoints
	async calculateRoute(waypoints: Waypoint[]) {
		if (waypoints.length < 2) {
			routeError.set('At least 2 waypoints are required');
			return;
		}

		routeLoading.set(true);
		routeError.set(null);

		try {
			routeWaypoints.set(waypoints);
			const route = await routingService.calculateRoute(waypoints);
			activeRoute.set(route);

			console.log(`🗺️ Route calculated: ${route.distance} miles, ${route.duration} minutes`);
		} catch (error) {
			console.error('Failed to calculate route:', error);
			routeError.set(error instanceof Error ? error.message : 'Failed to calculate route');
		} finally {
			routeLoading.set(false);
		}
	},

	// Get route alternatives
	async getAlternatives(waypoints: Waypoint[], maxAlternatives = 3) {
		if (waypoints.length < 2) return;

		routeLoading.set(true);

		try {
			const alternatives = await routingService.getRouteAlternatives(waypoints, maxAlternatives);
			routeAlternatives.set(alternatives);

			console.log(`🛣️ Found ${alternatives.length} route alternatives`);
		} catch (error) {
			console.error('Failed to get route alternatives:', error);
		} finally {
			routeLoading.set(false);
		}
	},

	// Select alternative route
	selectAlternative(route: Route) {
		activeRoute.set(route);
		console.log('🔄 Switched to alternative route');
	},

	// Add waypoint to route
	async addWaypoint(waypoint: Waypoint, index?: number) {
		routeWaypoints.update((current) => {
			const newWaypoints = [...current];
			if (index !== undefined) {
				newWaypoints.splice(index, 0, waypoint);
			} else {
				newWaypoints.push(waypoint);
			}
			return newWaypoints;
		});

		// Recalculate route with new waypoint
		routeWaypoints.subscribe((wp) => {
			if (wp.length >= 2) {
				this.calculateRoute(wp);
			}
		})();
	},

	// Remove waypoint from route
	async removeWaypoint(waypointId: string) {
		routeWaypoints.update((current) => current.filter((wp) => wp.id !== waypointId));

		// Recalculate route without waypoint
		routeWaypoints.subscribe((wp) => {
			if (wp.length >= 2) {
				this.calculateRoute(wp);
			} else {
				activeRoute.set(null);
			}
		})();
	},

	// Reorder waypoints
	async reorderWaypoints(newOrder: Waypoint[]) {
		routeWaypoints.set(newOrder);

		if (newOrder.length >= 2) {
			await this.calculateRoute(newOrder);
		}
	},

	// Update route profile (car vs RV)
	async updateProfile(profile: 'driving-car' | 'driving-hgv') {
		routeProfile.set(profile);

		// Recalculate with new profile if we have waypoints
		routeWaypoints.subscribe(async (waypoints) => {
			if (waypoints.length >= 2) {
				await this.calculateRoute(waypoints);
			}
		})();
	},

	// Update route options
	async updateOptions(options: {
		avoidTolls?: boolean;
		avoidFerries?: boolean;
		preferScenic?: boolean;
	}) {
		routeOptions.update((current) => ({ ...current, ...options }));

		// Recalculate with new options
		routeWaypoints.subscribe(async (waypoints) => {
			if (waypoints.length >= 2) {
				await this.calculateRoute(waypoints);
			}
		})();
	},

	// Update Southwest-specific preferences
	updateSouthwestPreferences(preferences: {
		preferInterstates?: boolean;
		includeScenicroutes?: boolean;
		avoidUnpavedRoads?: boolean;
		maxDetourDistance?: number;
	}) {
		southwestRoutePreferences.update((current) => ({ ...current, ...preferences }));
	},

	// Clear route and waypoints
	clearRoute() {
		activeRoute.set(null);
		routeAlternatives.set([]);
		routeWaypoints.set([]);
		routeError.set(null);
		console.log('🗑️ Route cleared');
	},

	// Southwest-specific: Find scenic route
	async findScenicRoute(start: LatLng, end: LatLng) {
		routeLoading.set(true);

		try {
			// Create waypoints for scenic route calculation
			const waypoints: Waypoint[] = [
				{
					id: 'start',
					name: 'Start',
					lat: start.lat,
					lng: start.lng,
					type: 'custom'
				},
				{
					id: 'end',
					name: 'End',
					lat: end.lat,
					lng: end.lng,
					type: 'custom'
				}
			];

			// Update preferences for scenic routing
			southwestRoutePreferences.update((prefs) => ({
				...prefs,
				includeScenicroutes: true,
				preferInterstates: false
			}));

			await this.calculateRoute(waypoints);
		} catch (error) {
			console.error('Failed to find scenic route:', error);
			routeError.set('Failed to find scenic route');
		} finally {
			routeLoading.set(false);
		}
	}
};

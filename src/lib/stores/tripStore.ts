import { writable } from 'svelte/store';
import type { Trip, Waypoint } from '$lib/types';
import { RoutingService, CostCalculatorService } from '$lib/services';

const routingService = new RoutingService();
const costCalculatorService = new CostCalculatorService();

// Default empty state for a new trip
const createNewTrip = (): Trip => ({
	id: `trip_${Date.now()}`,
	name: 'My Southwest Adventure',
	description: 'A new journey through the American Southwest',
	route: {
		id: `route_${Date.now()}`,
		waypoints: [],
		distance: 0,
		duration: 0
	},
	estimatedCost: 0,
	createdAt: new Date(),
	updatedAt: new Date()
});

// Simple trip store for now (localStorage integration can be added later)
const tripStore = writable(createNewTrip());

// Create a reactive trip store
export function useTripStore() {
	// Check if we're in a Svelte component context
	let trip: Trip;
	let isLoading: boolean;

	try {
		// Try to use $state if available (in Svelte context)
		trip = $state(createNewTrip());
		isLoading = $state(false);
	} catch {
		// Fallback for testing environment
		trip = createNewTrip();
		isLoading = false;
	}

	const costFactors = costCalculatorService.getSouthwestCostFactors();

	// Subscribe to store changes
	tripStore.subscribe((value) => {
		trip = value;
	});

	async function addWaypoint(waypoint: Waypoint) {
		const updatedWaypoints = [...trip.route.waypoints, waypoint];
		await recalculateRoute(updatedWaypoints);
	}

	async function removeWaypoint(waypointId: string) {
		const updatedWaypoints = trip.route.waypoints.filter((wp) => wp.id !== waypointId);
		await recalculateRoute(updatedWaypoints);
	}

	async function reorderWaypoints(newWaypoints: Waypoint[]) {
		await recalculateRoute(newWaypoints);
	}

	async function clearWaypoints() {
		await recalculateRoute([]);
	}

	async function recalculateRoute(waypoints: Waypoint[]) {
		if (waypoints.length < 2) {
			// Update trip with new waypoints but no route calculation
			const updatedTrip = {
				...trip,
				route: {
					...trip.route,
					waypoints,
					distance: 0,
					duration: 0
				},
				estimatedCost: 0,
				updatedAt: new Date()
			};
			tripStore.set(updatedTrip);
			return;
		}

		isLoading = true;
		try {
			const route = await routingService.calculateRoute(waypoints);
			const newTrip = { ...trip, route };
			const estimatedCost = costCalculatorService.calculateTripCost(newTrip, costFactors);
			const updatedTrip = { ...newTrip, estimatedCost, updatedAt: new Date() };
			tripStore.set(updatedTrip);
		} catch (error) {
			console.error('Failed to recalculate route:', error);
			// Update with waypoints but keep old route data
			const updatedTrip = {
				...trip,
				route: { ...trip.route, waypoints },
				updatedAt: new Date()
			};
			tripStore.set(updatedTrip);
		} finally {
			isLoading = false;
		}
	}

	function updateTripDetails(details: { name?: string; description?: string }) {
		tripStore.update((t) => ({ ...t, ...details, updatedAt: new Date() }));
	}

	return {
		get trip() {
			return trip;
		},
		get isLoading() {
			return isLoading;
		},
		get costFactors() {
			return costFactors;
		},
		addWaypoint,
		removeWaypoint,
		reorderWaypoints,
		clearWaypoints,
		updateTripDetails
	};
}

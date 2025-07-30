import { persisted } from 'svelte-local-storage-store';
import type { Trip, Waypoint, Route, CostFactors } from '$lib/types';
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
    duration: 0,
  },
  estimatedCost: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Persisted state for the current trip
export const currentTrip = persisted('vronis-roadtripper-trip', createNewTrip());

// Derived state and actions for managing the trip
export function useTripStore() {
  let trip = $state(currentTrip.get());
  let costFactors = $state(costCalculatorService.getSouthwestCostFactors());
  let isLoading = $state(false);

  // Sync local state with persisted store
  currentTrip.subscribe(value => {
    trip = value;
  });

  async function addWaypoint(waypoint: Waypoint) {
    const updatedWaypoints = [...trip.route.waypoints, waypoint];
    await recalculateRoute(updatedWaypoints);
  }

  async function removeWaypoint(waypointId: string) {
    const updatedWaypoints = trip.route.waypoints.filter(wp => wp.id !== waypointId);
    await recalculateRoute(updatedWaypoints);
  }

  async function reorderWaypoints(newWaypoints: Waypoint[]) {
    await recalculateRoute(newWaypoints);
  }

  async function clearWaypoints() {
    await recalculateRoute([]);
  }

  async function recalculateRoute(waypoints: Waypoint[]) {
    isLoading = true;
    try {
      const route = await routingService.calculateRoute(waypoints);
      const newTrip = { ...trip, route };
      const estimatedCost = costCalculatorService.calculateTripCost(newTrip, costFactors);
      currentTrip.set({ ...newTrip, estimatedCost, updatedAt: new Date() });
    } catch (error) {
      console.error('Failed to recalculate route:', error);
      // Optionally, show an error to the user
    } finally {
      isLoading = false;
    }
  }

  function updateTripDetails(details: { name?: string; description?: string }) {
    currentTrip.update(t => ({ ...t, ...details, updatedAt: new Date() }));
  }

  function updateCostFactors(factors: Partial<CostFactors>) {
    costFactors = { ...costFactors, ...factors };
    recalculateRoute(trip.route.waypoints); // Recalculate cost after factors change
  }

  return {
    get trip() { return trip; },
    get isLoading() { return isLoading; },
    get costFactors() { return costFactors; },
    addWaypoint,
    removeWaypoint,
    reorderWaypoints,
    clearWaypoints,
    updateTripDetails,
    updateCostFactors,
  };
}


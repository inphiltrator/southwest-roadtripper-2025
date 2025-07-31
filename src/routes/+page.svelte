<script lang="ts">
	import {
		NavigationBar,
		MapContainer,
		WaypointManager,
		GlassCard,
		GlassButton,
		POIFilter,
		RouteAlternatives
	} from '$lib/components';
	import { useTripStore } from '$lib/stores/tripStore';
	import { poiStore, discoveredPOIs, poiLoading } from '$lib/stores/poiStore';
	import { EnhancedRoutingService } from '$lib/services/EnhancedRoutingService';
	import type { Waypoint, POI, Route } from '$lib/types';

	const tripStore = useTripStore();
	const routingService = new EnhancedRoutingService();

	// State
	let selectedPOICategories = $state<POI['category'][]>(['national_park', 'attraction']);
	let searchRadius = $state(10000);
	let routeAlternatives = $state<Route[]>([]);
	let selectedRoute = $state<Route | null>(null);
	let routeLoading = $state(false);

	// Calculate routes when waypoints change
	$effect(() => {
		if (tripStore.trip.route.waypoints.length >= 2) {
			calculateRoutes();
		} else {
			routeAlternatives = [];
			selectedRoute = null;
		}
	});

	async function calculateRoutes() {
		routeLoading = true;
		try {
			const alternatives = await routingService.getRouteAlternatives(
				tripStore.trip.route.waypoints,
				3
			);
			routeAlternatives = alternatives;
			selectedRoute = alternatives[0];
		} catch (error) {
			console.error('Route calculation failed:', error);
		} finally {
			routeLoading = false;
		}
	}

	async function handlePOISearch() {
		const center = tripStore.trip.route.waypoints[0] || { lat: 36.1699, lng: -115.1398 };
		await poiStore.discoverPOIs(
			{ lat: center.lat, lng: center.lng },
			searchRadius,
			selectedPOICategories
		);
	}

	function handlePOICategoryToggle(category: POI['category']) {
		if (selectedPOICategories.includes(category)) {
			selectedPOICategories = selectedPOICategories.filter((c) => c !== category);
		} else {
			selectedPOICategories = [...selectedPOICategories, category];
		}
	}

	function handleAddPOIAsWaypoint(poi: POI) {
		const waypoint: Waypoint = {
			id: `poi_${poi.id}`,
			name: poi.name,
			lat: poi.lat,
			lng: poi.lng,
			icon: getCategoryIcon(poi.category),
			type: 'attraction'
		};
		tripStore.addWaypoint(waypoint);
	}

	function getCategoryIcon(category: POI['category']): string {
		const icons = {
			national_park: '🏜️',
			state_park: '🏞️',
			camping: '🏕️',
			dining: '🍽️',
			attraction: '📍',
			lodging: '🏨',
			fuel: '⛽'
		};
		return icons[category] || '📍';
	}
</script>

<div class="min-h-screen bg-southwest-sand text-gray-800">
	<NavigationBar />

	<main class="container mx-auto px-4 py-24">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<MapContainer />

				<!-- POI Results -->
				<GlassCard class="mt-8 p-4">
					<h3 class="mb-4 text-lg font-bold text-southwest-canyon">
						Discovered Points of Interest
					</h3>

					{#if $poiLoading}
						<div class="py-8 text-center">
							<svg
								class="mx-auto mb-2 h-8 w-8 animate-spin text-southwest-sunset"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<p class="text-gray-500">Searching Southwest attractions...</p>
						</div>
					{:else if $discoveredPOIs.length === 0}
						<p class="py-4 text-center text-gray-500">
							No POIs found. Try adjusting filters or search radius.
						</p>
					{:else}
						<div class="grid max-h-96 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2">
							{#each $discoveredPOIs as poi (poi.id)}
								<div
									class="flex items-center justify-between rounded-lg bg-white/50 p-3 transition hover:bg-white/70"
								>
									<div class="flex items-start space-x-3">
										<span class="text-2xl">{getCategoryIcon(poi.category)}</span>
										<div>
											<div class="font-medium text-gray-800">{poi.name}</div>
											<div class="text-xs text-gray-500">
												{#if poi.rating}
													<span>★ {poi.rating}</span>
												{/if}
												{#if poi.description}
													<span class="ml-2">{poi.description.slice(0, 50)}...</span>
												{/if}
											</div>
										</div>
									</div>
									<GlassButton
										variant="accent"
										size="sm"
										onclick={() => handleAddPOIAsWaypoint(poi)}
									>
										Add to Route
									</GlassButton>
								</div>
							{/each}
						</div>
					{/if}
				</GlassCard>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- POI Filters -->
				<POIFilter
					selectedCategories={selectedPOICategories}
					onCategoryToggle={handlePOICategoryToggle}
					onApplyFilters={handlePOISearch}
					radius={searchRadius}
					onRadiusChange={(r) => (searchRadius = r)}
					loading={$poiLoading}
				/>

				<!-- Route Alternatives -->
				{#if tripStore.trip.route.waypoints.length >= 2}
					<RouteAlternatives
						alternatives={routeAlternatives}
						selectedRouteId={selectedRoute?.id}
						onSelect={(route: Route) => (selectedRoute = route)}
						loading={routeLoading}
					/>
				{/if}

				<!-- Waypoint Manager -->
				<WaypointManager
					waypoints={tripStore.trip.route.waypoints}
					onRemove={(wp) => tripStore.removeWaypoint(wp.id)}
					onReorder={tripStore.reorderWaypoints}
					onClear={tripStore.clearWaypoints}
				/>

				<!-- Trip Summary -->
				<GlassCard class="p-4">
					<h3 class="mb-4 text-lg font-bold text-southwest-sage">Trip Summary</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Distance:</span>
							<span class="font-medium">
								{selectedRoute ? selectedRoute.distance : tripStore.trip.route.distance} mi
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Duration:</span>
							<span class="font-medium">
								{selectedRoute
									? `${Math.floor(selectedRoute.duration / 60)}h ${selectedRoute.duration % 60}m`
									: `${(tripStore.trip.route.duration / 60).toFixed(1)} hrs`}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Est. Fuel Cost:</span>
							<span class="font-bold text-southwest-canyon">
								${selectedRoute
									? Math.round(selectedRoute.distance * 0.15) // $0.15/mile estimate
									: tripStore.trip.estimatedCost}
							</span>
						</div>
					</div>
				</GlassCard>
			</div>
		</div>
	</main>
</div>

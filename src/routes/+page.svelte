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
	import { routeStore, routeAlternatives, routeLoading, activeRoute } from '$lib/stores/routeStore';
	import type { Waypoint, POI, Route } from '$lib/types';

	const tripStore = useTripStore();

	// POI Discovery State
	let selectedPOICategories = $state<POI['category'][]>([
		'national_park',
		'camping',
		'dining',
		'attraction'
	]);
	let poiRadius = $state(10000); // 10km radius

	// Route state
	let showRouteAlternatives = $state(false);

	// Load POIs around a location with multiple categories and radius
	async function loadPOIsAroundLocation(lat: number, lng: number) {
		await poiStore.discoverPOIs({ lat, lng }, poiRadius, selectedPOICategories);
	}

	// Load POIs on component mount
	$effect(() => {
		loadPOIsAroundLocation(36.1699, -115.1398); // Las Vegas
	});

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

	// Handle POI filter changes
	function handlePOIFilterChange(data: { categories: POI['category'][]; radius: number }) {
		selectedPOICategories = data.categories;
		poiRadius = data.radius;
		loadPOIsAroundLocation(36.1699, -115.1398); // Re-load POIs with new filters
	}

	// Handle route alternative selection
	function handleRouteSelect(route: Route) {
		routeStore.selectAlternative(route);
	}

	// Load route alternatives when waypoints change
	$effect(() => {
		const waypoints = tripStore.trip.route.waypoints;
		if (waypoints.length >= 2) {
			routeStore.getAlternatives(waypoints, 3);
			showRouteAlternatives = true;
		} else {
			showRouteAlternatives = false;
		}
	});
</script>

<div class="min-h-screen bg-southwest-sand text-gray-800">
	<NavigationBar />

	<main class="container mx-auto px-4 py-24">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<MapContainer />

				<!-- POI Discovery Section -->
				<GlassCard class="mt-8 p-4">
					<h3 class="mb-4 text-lg font-bold text-southwest-canyon">Discover Southwest POIs</h3>

					<!-- POI Filter Component -->
					<div class="mb-4">
						<POIFilter onChange={handlePOIFilterChange} />
					</div>

					{#if $poiLoading}
						<div class="py-4 text-center text-gray-500">Loading POIs...</div>
					{:else}
						<ul class="h-64 space-y-2 overflow-y-auto">
							{#each $discoveredPOIs as poi (poi.id)}
								<li
									class="flex items-center rounded-lg bg-white/50 p-2 transition hover:bg-white/70"
								>
									<span class="mr-3 text-xl">{getCategoryIcon(poi.category)}</span>
									<div class="flex-1">
										<div class="font-medium text-gray-800">{poi.name}</div>
										<div class="text-xs text-gray-500">
											Rating: {poi.rating?.toFixed(1) || 'N/A'}
										</div>
									</div>
									<GlassButton
										variant="accent"
										size="sm"
										onclick={() => handleAddPOIAsWaypoint(poi)}
									>
										+
									</GlassButton>
								</li>
							{/each}
						</ul>
					{/if}
				</GlassCard>
			</div>

			<div>
				<!-- Route Alternatives Section -->
				{#if showRouteAlternatives}
					<div class="mb-8">
						<RouteAlternatives
							alternatives={$routeAlternatives}
							selectedRouteId={$activeRoute?.id}
							loading={$routeLoading}
							onSelect={handleRouteSelect}
						/>
					</div>
				{/if}
				<WaypointManager
					waypoints={tripStore.trip.route.waypoints}
					onRemove={(wp) => tripStore.removeWaypoint(wp.id)}
					onReorder={tripStore.reorderWaypoints}
					onClear={tripStore.clearWaypoints}
				/>

				<!-- Trip Summary -->
				<GlassCard class="mt-8 p-4">
					<h3 class="mb-4 text-lg font-bold text-southwest-sage">Trip Summary</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Distance:</span>
							<span class="font-medium">{tripStore.trip.route.distance} mi</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Duration:</span>
							<span class="font-medium">{(tripStore.trip.route.duration / 60).toFixed(1)} hrs</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Est. Cost:</span>
							<span class="font-bold text-southwest-canyon">${tripStore.trip.estimatedCost}</span>
						</div>
					</div>
				</GlassCard>
			</div>
		</div>
	</main>
</div>

<script lang="ts">
	import {
		NavigationBar,
		MapContainer,
		WaypointManager,
		GlassCard,
		GlassButton
	} from '$lib/components';
	import { useTripStore } from '$lib/stores/tripStore';
	import { poiStore, discoveredPOIs, poiLoading } from '$lib/stores/poiStore';
	import type { Waypoint, POI } from '$lib/types';

	const tripStore = useTripStore();

	// Use reactive stores
	let selectedPOICategory = $state<POI['category']>('national_park');

	// Load initial POIs around Las Vegas using the POI store
	async function loadPOIsAroundLocation(lat: number, lng: number) {
		await poiStore.discoverPOIs(
			{ lat, lng },
			10000, // 10km radius for better coverage
			[selectedPOICategory]
		);
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

	async function handlePOICategoryChange(category: POI['category']) {
		selectedPOICategory = category;
		await loadPOIsAroundLocation(36.1699, -115.1398);
	}
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
					<div class="mb-4 flex gap-2">
						{#each ['national_park', 'camping', 'dining', 'attraction', 'lodging', 'fuel'] as POI['category'][] as category (category)}
							<GlassButton
								variant={selectedPOICategory === category ? 'primary' : 'secondary'}
								size="sm"
								onclick={() => handlePOICategoryChange(category)}
							>
								{getCategoryIcon(category)}
								{category.replace('_', ' ')}
							</GlassButton>
						{/each}
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
										<div class="text-xs text-gray-500">Rating: {poi.rating || 'N/A'}</div>
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

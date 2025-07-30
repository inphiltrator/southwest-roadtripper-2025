<script lang="ts">
  import { NavigationBar, MapContainer, WaypointManager, GlassCard, GlassButton } from '$lib/components';
  import { POIService } from '$lib/services';
  import { useTripStore } from '$lib/stores/tripStore';
  import type { Waypoint, POI } from '$lib/types';

  const tripStore = useTripStore();
  const poiService = new POIService();
  
  let pois: POI[] = $state([]);
  let isLoadingPOIs = $state(false);
  let selectedPOICategory = $state<POI['category']>('national_park');

  // Load initial POIs around Las Vegas
  async function loadPOIsAroundLocation(lat: number, lng: number) {
    isLoadingPOIs = true;
    try {
      const discoveredPOIs = await poiService.discoverPOIs(
        { lat, lng }, 
        5000, // 5km radius
        [selectedPOICategory]
      );
      pois = discoveredPOIs;
    } catch (error) {
      console.error('Failed to load POIs:', error);
    } finally {
      isLoadingPOIs = false;
    }
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <MapContainer />
        
        <!-- POI Discovery Section -->
        <GlassCard class="mt-8 p-4">
          <h3 class="text-lg font-bold text-southwest-canyon mb-4">Discover Southwest POIs</h3>
          <div class="flex gap-2 mb-4">
            {#each ['national_park', 'camping', 'dining', 'attraction', 'lodging', 'fuel'] as category}
              <GlassButton 
                variant={selectedPOICategory === category ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => handlePOICategoryChange(category)}
              >
                {#snippet children()}
                  {getCategoryIcon(category)} {category.replace('_', ' ')}
                {/snippet}
              </GlassButton>
            {/each}
          </div>
          
          {#if isLoadingPOIs}
            <div class="text-center py-4 text-gray-500">Loading POIs...</div>
          {:else}
            <ul class="space-y-2 h-64 overflow-y-auto">
              {#each pois as poi (poi.id)}
                <li class="flex items-center p-2 rounded-lg bg-white/50 hover:bg-white/70 transition">
                  <span class="text-xl mr-3">{getCategoryIcon(poi.category)}</span>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">{poi.name}</div>
                    <div class="text-xs text-gray-500">Rating: {poi.rating || 'N/A'}</div>
                  </div>
                  <GlassButton variant="accent" size="sm" onclick={() => handleAddPOIAsWaypoint(poi)}>
                    {#snippet children()}
                      +
                    {/snippet}
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
          <h3 class="text-lg font-bold text-southwest-sage mb-4">Trip Summary</h3>
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

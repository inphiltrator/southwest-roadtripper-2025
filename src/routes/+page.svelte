<script lang="ts">
  import { NavigationBar, MapContainer, WaypointManager } from '$lib/components';
  import type { Waypoint } from '$lib/types';

  let waypoints: Waypoint[] = $state([
    { id: 'lv', name: 'Las Vegas, NV', lat: 36.1699, lng: -115.1398, icon: '🎰' },
    { id: 'gc', name: 'Grand Canyon, AZ', lat: 36.0544, lng: -112.1401, icon: '🏜️' },
  ]);

  function handleRemove(waypoint: Waypoint) {
    waypoints = waypoints.filter(w => w.id !== waypoint.id);
  }

  function handleReorder(newWaypoints: Waypoint[]) {
    waypoints = newWaypoints;
  }

  function handleClear() {
    waypoints = [];
  }
</script>

<div class="min-h-screen bg-southwest-sand text-gray-800">
  <NavigationBar />

  <main class="container mx-auto px-4 py-24">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <MapContainer />
      </div>
      <div>
        <WaypointManager 
          {waypoints}
          onRemove={handleRemove}
          onReorder={handleReorder}
          onClear={handleClear}
        />
      </div>
    </div>
  </main>
</div>

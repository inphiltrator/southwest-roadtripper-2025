<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import GlassCard from './GlassCard.svelte';

  type Props = {
    class?: string;
    center?: [number, number];
    zoom?: number;
    style?: string;
  };
  
  let { 
    class: className = '', 
    center = [36.1699, -115.1398], // Las Vegas, NV - Southwest USA center
    zoom = 8,
    style = 'height: 400px; width: 100%;'
  }: Props = $props();

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let L: any = null;

  // Southwest bounds: CA/NV/UT/AZ
  const southwestBounds = [
    [31.0, -125.0], // Southwest corner (Baja California border)
    [42.0, -103.0]  // Northeast corner (Colorado border)
  ];

  onMount(async () => {
    if (browser && mapContainer) {
      try {
        // Dynamic import for SSR-safe loading
        L = await import('leaflet');
        
        // Initialize map
        map = new L.Map(mapContainer, {
          center,
          zoom,
          maxBounds: southwestBounds,
          maxBoundsViscosity: 0.7
        });

        // Add Southwest-themed tile layer
        const tileLayer = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        
        tileLayer.addTo(map);

        // Add sample Southwest waypoints
        const waypoints = [
          { lat: 36.1069, lng: -115.1398, name: 'Las Vegas, NV', icon: '🌵' },
          { lat: 36.0544, lng: -112.1401, name: 'Grand Canyon South Rim', icon: '🏜️' },
          { lat: 37.2968, lng: -113.0261, name: 'Zion National Park', icon: '🗻' },
          { lat: 37.6283, lng: -112.1677, name: 'Bryce Canyon', icon: '🏔️' },
          { lat: 33.4734, lng: -111.8910, name: 'Phoenix, AZ', icon: '🌵' }
        ];

        waypoints.forEach(waypoint => {
          const marker = new L.Marker([waypoint.lat, waypoint.lng]);
          
          // Create popup with Southwest styling
          const popupContent = `
            <div class="p-3">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">${waypoint.icon}</span>
                <strong class="text-southwest-sunset">${waypoint.name}</strong>
              </div>
              <p class="text-sm text-gray-600">Click to add to your route!</p>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          marker.addTo(map);
          
          // Add click handler for waypoint selection
          marker.on('click', () => {
            console.log('Selected waypoint:', waypoint.name);
            // TODO: Dispatch custom event for parent component
          });
        });

        // Add click handler for adding custom waypoints
        map.on('click', (e: any) => {
          const customMarker = new L.Marker([e.latlng.lat, e.latlng.lng]);
          
          const customPopup = `
            <div class="p-3">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">📍</span>
                <strong class="text-southwest-canyon">Custom Waypoint</strong>
              </div>
              <p class="text-sm text-gray-600">
                Lat: ${e.latlng.lat.toFixed(4)}<br>
                Lng: ${e.latlng.lng.toFixed(4)}
              </p>
              <button class="mt-2 px-3 py-1 bg-southwest-sage/20 text-southwest-sage rounded text-sm">
                Add to Route
              </button>
            </div>
          `;
          
          customMarker.bindPopup(customPopup).openPopup();
          customMarker.addTo(map);
          
          console.log('Added custom waypoint at:', e.latlng);
        });

      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<GlassCard class="overflow-hidden {className}">
  <div class="relative">
    <!-- Map Container -->
    <div 
      bind:this={mapContainer} 
      {style}
      class="w-full"
    ></div>
    
    <!-- Loading State -->
    {#if !browser}
      <div 
        class="absolute inset-0 flex items-center justify-center bg-southwest-sand/80 backdrop-blur-sm"
        {style}
      >
        <div class="text-center">
          <div class="text-4xl mb-2">🗺️</div>
          <p class="text-southwest-canyon font-medium">Loading Southwest Map...</p>
        </div>
      </div>
    {/if}
    
    <!-- Map Controls Overlay -->
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <div class="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
        <div class="text-southwest-sunset font-bold">Southwest USA</div>
        <div class="text-xs text-gray-600">Click to add waypoints</div>
      </div>
    </div>
  </div>
</GlassCard>

<style>
  /* Leaflet CSS will be loaded dynamically */
  :global(.leaflet-container) {
    background: var(--color-southwest-sand) !important;
  }
  
  :global(.leaflet-popup-content-wrapper) {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(8px) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  }
  
  :global(.leaflet-popup-tip) {
    background: rgba(255, 255, 255, 0.95) !important;
  }
</style>

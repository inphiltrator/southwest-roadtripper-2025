<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import GlassButton from './GlassButton.svelte';

  type Waypoint = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    icon?: string;
  };

  type Props = {
    waypoints: Waypoint[];
    class?: string;
    onRemove?: (waypoint: Waypoint) => void;
    onReorder?: (waypoints: Waypoint[]) => void;
    onClear?: () => void;
  };

  let { 
    waypoints = [], 
    class: className = '',
    onRemove,
    onReorder,
    onClear
  }: Props = $props();

  let isDragging = false;
  let dragStartIndex = -1;

  function handleDragStart(index: number) {
    isDragging = true;
    dragStartIndex = index;
  }

  function handleDrop(targetIndex: number) {
    if (!isDragging || dragStartIndex === -1) return;

    const draggedItem = waypoints[dragStartIndex];
    const newWaypoints = [...waypoints];
    newWaypoints.splice(dragStartIndex, 1);
    newWaypoints.splice(targetIndex, 0, draggedItem);

    onReorder?.(newWaypoints);

    // Reset drag state
    isDragging = false;
    dragStartIndex = -1;
  }

</script>

<GlassCard class="p-4 {className}">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-bold text-southwest-sage">Trip Route</h3>
    <GlassButton variant="accent" size="sm" onclick={onClear} disabled={waypoints.length === 0}>
        {#snippet children()}
          Clear All
        {/snippet}
    </GlassButton>
  </div>

  <ul class="space-y-2">
    {#each waypoints as waypoint, index (waypoint.id)}
      <li 
        draggable="true"
        ondragstart={() => handleDragStart(index)}
        ondragover={(e) => e.preventDefault()}
        ondrop={() => handleDrop(index)}
        class="flex items-center p-3 rounded-lg bg-white/50 cursor-move transition-all"
        class:opacity-50={isDragging && dragStartIndex === index}
      >
        <span class="text-xl mr-3">{waypoint.icon || '📍'}</span>
        <span class="flex-1 font-medium text-gray-700">{waypoint.name}</span>
        <button 
          class="text-red-500 hover:text-red-700 ml-2"
          onclick={() => onRemove?.(waypoint)}
        >
          &times;
        </button>
      </li>
    {/each}
  </ul>
  
  {#if waypoints.length === 0}
    <div class="text-center py-8 text-gray-500">
        <p>Click on the map to add waypoints to your trip.</p>
    </div>
  {/if}
</GlassCard>

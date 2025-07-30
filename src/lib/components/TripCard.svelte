<script lang="ts">
	import GlassCard from './GlassCard.svelte';
	import GlassButton from './GlassButton.svelte';

	type Trip = {
		id: string;
		name: string;
		description?: string;
		waypoints: number;
		distance: number;
		duration: number;
		estimatedCost: number;
		thumbnail?: string;
	};

	type Props = {
		trip: Trip;
		class?: string;
		onSelect?: (trip: Trip) => void;
		onEdit?: (trip: Trip) => void;
		onDelete?: (trip: Trip) => void;
	};

	let { trip, class: className = '', onSelect, onEdit, onDelete }: Props = $props();

	function formatDistance(distance: number): string {
		return distance > 1000 ? `${(distance / 1000).toFixed(1)}k mi` : `${distance} mi`;
	}

	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	}

	function formatCost(cost: number): string {
		return `$${cost.toFixed(0)}`;
	}
</script>

<GlassCard class="cursor-pointer overflow-hidden transition-transform hover:scale-105 {className}">
	<div class="p-6" onclick={() => onSelect?.(trip)}>
		<!-- Trip Header -->
		<div class="mb-4 flex items-start justify-between">
			<div>
				<h3 class="mb-1 text-lg font-bold text-southwest-sunset">{trip.name}</h3>
				{#if trip.description}
					<p class="line-clamp-2 text-sm text-gray-600">{trip.description}</p>
				{/if}
			</div>
			<div class="text-right">
				<div class="text-lg font-bold text-southwest-canyon">{formatCost(trip.estimatedCost)}</div>
				<div class="text-xs text-gray-500">estimated</div>
			</div>
		</div>

		<!-- Trip Stats -->
		<div class="mb-4 grid grid-cols-3 gap-4">
			<div class="text-center">
				<div class="text-sm font-medium text-southwest-sage">{trip.waypoints}</div>
				<div class="text-xs text-gray-500">stops</div>
			</div>
			<div class="text-center">
				<div class="text-sm font-medium text-southwest-sage">{formatDistance(trip.distance)}</div>
				<div class="text-xs text-gray-500">distance</div>
			</div>
			<div class="text-center">
				<div class="text-sm font-medium text-southwest-sage">{formatDuration(trip.duration)}</div>
				<div class="text-xs text-gray-500">drive time</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			<GlassButton variant="primary" size="sm" class="flex-1" onclick={() => onSelect?.(trip)}>
				🗺️ View
			</GlassButton>
			{#if onEdit}
				<GlassButton variant="secondary" size="sm" onclick={() => onEdit?.(trip)}>✏️</GlassButton>
			{/if}
			{#if onDelete}
				<GlassButton variant="accent" size="sm" onclick={() => onDelete?.(trip)}>🗑️</GlassButton>
			{/if}
		</div>
	</div>
</GlassCard>

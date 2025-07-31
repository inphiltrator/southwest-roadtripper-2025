<script lang="ts">
	import { GlassCard, GlassButton } from '$lib/components';
	import type { Route } from '$lib/types';

	interface Props {
		alternatives: Route[];
		selectedRouteId?: string;
		loading?: boolean;
		onSelect?: (route: Route) => void;
	}

	let { alternatives = [], selectedRouteId, loading = false, onSelect }: Props = $props();

	function handleRouteSelect(route: Route) {
		if (onSelect) {
			onSelect(route);
		}
	}

	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}
</script>

<GlassCard class="p-4">
	<h3 class="mb-4 text-lg font-bold text-southwest-canyon">Route Options</h3>

	{#if loading}
		<div class="py-8 text-center text-gray-500">
			<div class="animate-spin text-2xl">🚗</div>
			<p class="mt-2">Finding route alternatives...</p>
		</div>
	{:else if alternatives.length === 0}
		<div class="py-8 text-center text-gray-500">
			<p>No route alternatives available.</p>
			<p class="text-sm">Add waypoints to see route options.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each alternatives as route, index (route.id)}
				<div
					class="cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md"
					class:border-southwest-sage={selectedRouteId === route.id}
					class:bg-southwest-sage-light={selectedRouteId === route.id}
					class:border-gray-200={selectedRouteId !== route.id}
					class:bg-white={selectedRouteId !== route.id}
					onclick={() => handleRouteSelect(route)}
				>
					<div class="mb-2 flex items-center justify-between">
						<div class="font-medium text-gray-800">
							Route {index + 1}
							{#if selectedRouteId === route.id}
								<span class="ml-2 text-sm text-southwest-sage">✓ Selected</span>
							{/if}
						</div>
						{#if selectedRouteId !== route.id}
							<GlassButton variant="secondary" size="sm" onclick={() => handleRouteSelect(route)}>
								Select
							</GlassButton>
						{/if}
					</div>

					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="text-gray-600">Distance:</span>
							<span class="ml-1 font-medium">{route.distance} mi</span>
						</div>
						<div>
							<span class="text-gray-600">Duration:</span>
							<span class="ml-1 font-medium">{formatDuration(route.duration)}</span>
						</div>
					</div>

					{#if route.elevation}
						<div class="mt-2 text-xs text-gray-500">
							<span>Elevation data available</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</GlassCard>

<script lang="ts">
	import type { POI } from '$lib/types';

	interface Props {
		onChange?: (data: { categories: POI['category'][]; radius: number }) => void;
	}

	let { onChange }: Props = $props();

	let selectedCategories = $state<POI['category'][]>([
		'national_park',
		'camping',
		'dining',
		'attraction'
	]);
	let radius = $state(10000);

	function handleCategoryChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedCategories = Array.from(target.selectedOptions).map(
			(option) => option.value as POI['category']
		);
		if (onChange) {
			onChange({ categories: selectedCategories, radius });
		}
	}

	function handleRadiusChange(event: Event) {
		const target = event.target as HTMLInputElement;
		radius = parseInt(target.value);
		if (onChange) {
			onChange({ categories: selectedCategories, radius });
		}
	}

	// Initialize on mount
	$effect(() => {
		if (onChange) {
			onChange({ categories: selectedCategories, radius });
		}
	});
</script>

<div class="space-y-4">
	<div>
		<label for="categories" class="mb-2 block text-sm font-medium text-gray-700"
			>Select Categories:</label
		>
		<select
			id="categories"
			multiple
			size="4"
			class="w-full rounded-lg border border-gray-300 bg-white/80 p-2 text-sm focus:border-southwest-sage focus:ring-2 focus:ring-southwest-sage/20 focus:outline-none"
			onchange={handleCategoryChange}
		>
			<option value="national_park" selected={selectedCategories.includes('national_park')}
				>🏜️ National Parks</option
			>
			<option value="state_park" selected={selectedCategories.includes('state_park')}
				>🏞️ State Parks</option
			>
			<option value="camping" selected={selectedCategories.includes('camping')}>🏕️ Camping</option>
			<option value="dining" selected={selectedCategories.includes('dining')}>🍽️ Dining</option>
			<option value="attraction" selected={selectedCategories.includes('attraction')}
				>📍 Attractions</option
			>
			<option value="lodging" selected={selectedCategories.includes('lodging')}>🏨 Lodging</option>
			<option value="fuel" selected={selectedCategories.includes('fuel')}>⛽ Fuel</option>
		</select>
		<p class="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple categories</p>
	</div>

	<div>
		<label for="radius" class="mb-2 block text-sm font-medium text-gray-700">
			Search Radius: {(radius / 1000).toFixed(1)} km
		</label>
		<input
			id="radius"
			type="range"
			min="1000"
			max="50000"
			step="1000"
			value={radius}
			class="w-full accent-southwest-sage"
			oninput={handleRadiusChange}
		/>
		<div class="mt-1 flex justify-between text-xs text-gray-500">
			<span>1 km</span>
			<span>50 km</span>
		</div>
	</div>
</div>

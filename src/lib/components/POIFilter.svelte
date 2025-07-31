<script lang="ts">
	import type { POI } from '$lib/types';

	interface Props {
		selectedCategories: POI['category'][];
		onCategoryToggle: (category: POI['category']) => void;
		onApplyFilters: () => void;
		radius: number;
		onRadiusChange: (radius: number) => void;
		loading?: boolean;
	}

	let {
		selectedCategories = [],
		onCategoryToggle,
		onApplyFilters,
		radius = 10000,
		onRadiusChange,
		loading = false
	}: Props = $props();

	function handleCategoryChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedValues = Array.from(select.selectedOptions).map(
			(option) => option.value as POI['category']
		);
		// Toggle categories based on selection
		categories.forEach((category) => {
			const isSelected = selectedCategories.includes(category.value);
			const shouldBeSelected = selectedValues.includes(category.value);
			if (isSelected !== shouldBeSelected) {
				onCategoryToggle(category.value);
			}
		});
	}

	function handleRadiusChange(event: Event) {
		const input = event.target as HTMLInputElement;
		onRadiusChange(parseInt(input.value));
	}

	const categories: { value: POI['category']; label: string; icon: string; description: string }[] =
		[
			{
				value: 'national_park',
				label: 'National Parks',
				icon: '🏜️',
				description: 'Grand Canyon, Zion, etc.'
			},
			{
				value: 'state_park',
				label: 'State Parks',
				icon: '🏞️',
				description: 'Valley of Fire, Red Rock'
			},
			{ value: 'camping', label: 'Camping', icon: '🏕️', description: 'Campgrounds, RV Parks' },
			{ value: 'dining', label: 'Dining', icon: '🍽️', description: 'Restaurants, Cafes' },
			{ value: 'attraction', label: 'Attractions', icon: '📍', description: 'Viewpoints, Museums' },
			{ value: 'lodging', label: 'Lodging', icon: '🏨', description: 'Hotels, Motels' },
			{ value: 'fuel', label: 'Fuel & Charging', icon: '⛽', description: 'Gas, EV Charging' }
		];

	// Radius options for reference (not currently used in UI)

	// Toggle all function (currently unused but kept for potential future use)
	// function toggleAll(select: boolean) {
	//	if (select) {
	//		categories.forEach((c) => {
	//			if (!selectedCategories.includes(c.value)) {
	//				onCategoryToggle(c.value);
	//			}
	//		});
	//	} else {
	//		categories.forEach((c) => {
	//			if (selectedCategories.includes(c.value)) {
	//				onCategoryToggle(c.value);
	//			}
	//		});
	//	}
	// }
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

	<div class="mt-4">
		<button
			type="button"
			class="w-full rounded-lg bg-southwest-sage px-4 py-2 text-white hover:bg-southwest-sage/90 focus:ring-2 focus:ring-southwest-sage/20 focus:outline-none disabled:opacity-50"
			disabled={loading}
			onclick={onApplyFilters}
		>
			{#if loading}
				<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
						fill="none"
						opacity="0.25"
					></circle>
					<path
						fill="currentColor"
						d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						opacity="0.75"
					></path>
				</svg>
				Applying Filters...
			{:else}
				Apply Filters
			{/if}
		</button>
	</div>
</div>

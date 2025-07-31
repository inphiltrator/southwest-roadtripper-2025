<script lang="ts">
	import type { POI } from '$lib/types';
	import GlassCard from './GlassCard.svelte';
	import GlassButton from './GlassButton.svelte';

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

	const categories: { value: POI['category']; label: string; icon: string; description: string }[] = [
		{ value: 'national_park', label: 'National Parks', icon: '🏜️', description: 'Grand Canyon, Zion, etc.' },
		{ value: 'state_park', label: 'State Parks', icon: '🏞️', description: 'Valley of Fire, Red Rock' },
		{ value: 'camping', label: 'Camping', icon: '🏕️', description: 'Campgrounds, RV Parks' },
		{ value: 'dining', label: 'Dining', icon: '🍽️', description: 'Restaurants, Cafes' },
		{ value: 'attraction', label: 'Attractions', icon: '📍', description: 'Viewpoints, Museums' },
		{ value: 'lodging', label: 'Lodging', icon: '🏨', description: 'Hotels, Motels' },
		{ value: 'fuel', label: 'Fuel & Charging', icon: '⛽', description: 'Gas, EV Charging' }
	];

	const radiusOptions = [
		{ value: 5000, label: '5 km', miles: '3 mi' },
		{ value: 10000, label: '10 km', miles: '6 mi' },
		{ value: 25000, label: '25 km', miles: '15 mi' },
		{ value: 50000, label: '50 km', miles: '31 mi' }
	];

	function toggleAll(select: boolean) {
		if (select) {
			categories.forEach(c => {
				if (!selectedCategories.includes(c.value)) {
					onCategoryToggle(c.value);
				}
			});
		} else {
			categories.forEach(c => {
				if (selectedCategories.includes(c.value)) {
					onCategoryToggle(c.value);
				}
			});
		}
	}
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

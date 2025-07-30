import { writable, derived } from 'svelte/store';
import type { POI, LatLng } from '$lib/types';
import { EnhancedPOIService } from '$lib/services';

const poiService = new EnhancedPOIService();

// Core POI State
export const discoveredPOIs = writable<POI[]>([]);
export const selectedPOIs = writable<POI[]>([]);
export const poiLoading = writable(false);
export const poiError = writable<string | null>(null);

// POI Category Selection
export const activePOICategories = writable<POI['category'][]>([
	'national_park',
	'camping',
	'dining'
]);

// Southwest-specific POI categories
export const southwestPOICategories: POI['category'][] = [
	'national_park',
	'state_park',
	'camping',
	'dining',
	'attraction',
	'fuel',
	'lodging'
];

// Current search location and radius
export const poiSearchLocation = writable<LatLng | null>(null);
export const poiSearchRadius = writable(10000); // 10km default

// Derived stores
export const filteredPOIs = derived(
	[discoveredPOIs, activePOICategories],
	([$discoveredPOIs, $activePOICategories]) => {
		return $discoveredPOIs.filter((poi) => $activePOICategories.includes(poi.category));
	}
);

export const poiStats = derived(discoveredPOIs, ($discoveredPOIs) => {
	const stats: Record<POI['category'], number> = {
		national_park: 0,
		state_park: 0,
		camping: 0,
		dining: 0,
		attraction: 0,
		fuel: 0,
		lodging: 0
	};

	$discoveredPOIs.forEach((poi) => {
		stats[poi.category]++;
	});

	return stats;
});

// POI Store Actions
export const poiStore = {
	// Discover POIs around a location
	async discoverPOIs(location: LatLng, radius?: number, categories?: POI['category'][]) {
		poiLoading.set(true);
		poiError.set(null);

		try {
			const searchRadius = radius || 10000;
			const searchCategories = categories || ['national_park', 'camping', 'dining'];

			poiSearchLocation.set(location);
			poiSearchRadius.set(searchRadius);

			const pois = await poiService.discoverPOIs(location, searchRadius, searchCategories);
			discoveredPOIs.set(pois);

			console.log(`🏞️ Discovered ${pois.length} POIs around location`);
		} catch (error) {
			console.error('Failed to discover POIs:', error);
			poiError.set(error instanceof Error ? error.message : 'Failed to discover POIs');
		} finally {
			poiLoading.set(false);
		}
	},

	// Add POI to selection
	selectPOI(poi: POI) {
		selectedPOIs.update((current) => {
			if (!current.find((p) => p.id === poi.id)) {
				return [...current, poi];
			}
			return current;
		});
	},

	// Remove POI from selection
	deselectPOI(poiId: string) {
		selectedPOIs.update((current) => current.filter((p) => p.id !== poiId));
	},

	// Clear all selections
	clearSelection() {
		selectedPOIs.set([]);
	},

	// Update active categories
	updateCategories(categories: POI['category'][]) {
		activePOICategories.set(categories);
	},

	// Toggle category
	toggleCategory(category: POI['category']) {
		activePOICategories.update((current) => {
			if (current.includes(category)) {
				return current.filter((c) => c !== category);
			}
			return [...current, category];
		});
	},

	// Clear discovered POIs
	clearPOIs() {
		discoveredPOIs.set([]);
		poiError.set(null);
	}
};

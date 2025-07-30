import type { LatLng, POI, SouthwestState } from '../types';

/**
 * Service for discovering Points of Interest using Overpass API
 * Specialized for Southwest USA (CA, NV, UT, AZ)
 */
export class POIService {
	private readonly baseUrl = 'https://overpass-api.de/api/interpreter';

	/**
	 * Discover POIs around a location for Southwest USA
	 */
	async discoverPOIs(
		location: LatLng,
		_radius = 10000, // 10km radius - intentionally unused in mock implementation
		categories: POI['category'][] = ['national_park', 'camping', 'dining', 'attraction']
	): Promise<POI[]> {
		try {
			// Mock implementation for demo - replace with real API call
			return this.mockPOIDiscovery(location, categories);

			// Real Overpass API implementation would be more complex
			// const query = this.buildOverpassQuery(location, radius, categories);
			// const response = await fetch(this.baseUrl, {
			//   method: 'POST',
			//   body: `data=${encodeURIComponent(query)}`
			// });
			// const data: POIResponse = await response.json();
			// return data.pois;
		} catch (error) {
			console.error('POI discovery failed:', error);
			return this.mockPOIDiscovery(location, categories);
		}
	}

	/**
	 * Build Overpass API query for Southwest POIs
	 */
	private buildOverpassQuery(
		location: LatLng,
		radius: number,
		categories: POI['category'][]
	): string {
		const around = `(around:${radius},${location.lat},${location.lng})`;
		const queryParts = categories
			.map((category) => {
				switch (category) {
					case 'national_park':
						return `node["leisure"="park"]["protection_title"="National Park"]${around};`;
					case 'camping':
						return `node["tourism"="camp_site"]${around};`;
					case 'dining':
						return `node["amenity"="restaurant"]${around};`;
					case 'attraction':
						return `node["tourism"="attraction"]${around};`;
					case 'lodging':
						return `node["tourism"="hotel"]${around};`;
					case 'fuel':
						return `node["amenity"="fuel"]${around};`;
					default:
						return '';
				}
			})
			.join('');

		return `[out:json];(${queryParts});out body;>;out skel qt;`;
	}

	/**
	 * Mock POI discovery for demo purposes
	 * Returns realistic Southwest USA POIs
	 */
	private mockPOIDiscovery(location: LatLng, categories: POI['category'][]): POI[] {
		const pois: POI[] = [];
		const baseId = `poi_${Date.now()}`.slice(0, 15);

		categories.forEach((category, i) => {
			for (let j = 0; j < 3; j++) {
				const randomLat = location.lat + (Math.random() - 0.5) * 0.1;
				const randomLng = location.lng + (Math.random() - 0.5) * 0.1;

				pois.push({
					id: `${baseId}_${i}_${j}`,
					name: this.getMockPOIName(category, j),
					lat: randomLat,
					lng: randomLng,
					category,
					rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
					description: 'A must-see for any Southwest roadtripper.',
					website: 'https://example.com/southwest-poi'
				});
			}
		});

		return pois;
	}

	private getMockPOIName(category: POI['category'], index: number): string {
		const names = {
			national_park: ['Red Rock Canyon', 'Valley of Fire', 'Death Valley'],
			camping: ['Desert Oasis Campground', 'Starlight Mesa', 'Cactus Flats RV Park'],
			dining: ['Southwest Grill', 'Route 66 Diner', 'Canyon Coffee House'],
			attraction: ['Hoover Dam', 'Area 51 Gateway', 'Meteor Crater'],
			lodging: ['The Oasis Motel', 'Desert Rose Inn', 'Canyon View Lodge'],
			fuel: ['Last Chance Gas', 'Desert Fuel Stop', 'Route 66 Gas & Go']
		};
		return names[category]?.[index] || `Generic ${category}`;
	}

	/**
	 * Get top-rated POIs in a Southwest state
	 */
	async getTopRatedPOIsInState(
		state: SouthwestState,
		category: POI['category'],
		limit = 5
	): Promise<POI[]> {
		// Mock implementation for demo
		const center = this.getStateCenter(state);
		const pois = await this.mockPOIDiscovery(center, [category]);
		return pois.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, limit);
	}

	private getStateCenter(state: SouthwestState): LatLng {
		const centers = {
			CA: { lat: 36.7783, lng: -119.4179 },
			NV: { lat: 38.8026, lng: -116.4194 },
			UT: { lat: 39.321, lng: -111.0937 },
			AZ: { lat: 34.0489, lng: -111.0937 }
		};
		return centers[state];
	}
}

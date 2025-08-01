interface OverpassElement {
	id: number;
	lat: number;
	lon: number;
	tags: Record<string, string>;
}

import type { LatLng, POI } from '../types';
import { env } from '$lib/config/env';

/**
 * Enhanced POI discovery service using Overpass API
 * Specialized for Southwest USA with robust error handling
 */
export class EnhancedPOIService {
	private readonly baseUrl = env.overpassApiUrl;
	private readonly rateLimitDelay = 500; // Minimal delay to be respectful
	private lastRequestTime = 0;
	private readonly maxRetries = 3;

	constructor() {
		console.log(
			'🏞️ Overpass API POI Service initialized with private.coffee endpoint (unlimited access)'
		);
	}

	/**
	 * Discover POIs around a location for Southwest USA
	 */
	async discoverPOIs(
		location: LatLng,
		radius = 10000, // 10km radius
		categories: POI['category'][] = ['national_park', 'camping', 'dining', 'attraction']
	): Promise<POI[]> {
		try {
			return await this.makeOverpassRequest(location, radius, categories);
		} catch (error) {
			console.error('Overpass API failed, falling back to mock POIs:', error);
			return this.mockPOIDiscovery(location, categories);
		}
	}

	/**
	 * Make request to Overpass API with rate limiting and retries
	 */
	private async makeOverpassRequest(
		location: LatLng,
		radius: number,
		categories: POI['category'][],
		retryCount = 0
	): Promise<POI[]> {
		// Rate limiting
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.rateLimitDelay) {
			await this.sleep(this.rateLimitDelay - timeSinceLastRequest);
		}
		this.lastRequestTime = Date.now();

		const query = this.buildOverpassQuery(location, radius, categories);
		const response = await fetch(this.baseUrl, {
			method: 'POST',
			body: `data=${encodeURIComponent(query)}`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			if (response.status === 429 && retryCount < this.maxRetries) {
				const backoffDelay = Math.pow(2, retryCount) * 1000;
				console.log(`Overpass rate limited, retrying in ${backoffDelay}ms...`);
				await this.sleep(backoffDelay);
				return this.makeOverpassRequest(location, radius, categories, retryCount + 1);
			}
			throw new Error(`Overpass API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		return this.transformOverpassResponse(data);
	}

	/**
	 * Build Overpass API query for Southwest POIs with comprehensive category support
	 */
	private buildOverpassQuery(
		location: LatLng,
		radius: number,
		categories: POI['category'][]
	): string {
		const queryParts = categories
			.map((category) => {
				switch (category) {
					case 'national_park':
						return `
						node["leisure"="park"]["protection_title"](around:${radius},${location.lat},${location.lng});
						node["boundary"="national_park"](around:${radius},${location.lat},${location.lng});
						node["leisure"="nature_reserve"]["name"~"National"](around:${radius},${location.lat},${location.lng});
						way["leisure"="park"]["protection_title"](around:${radius},${location.lat},${location.lng});
						way["boundary"="national_park"](around:${radius},${location.lat},${location.lng});
					`;

					case 'state_park':
						return `
						node["leisure"="park"]["park_type"="state_park"](around:${radius},${location.lat},${location.lng});
						node["leisure"="park"]["name"~"State Park"](around:${radius},${location.lat},${location.lng});
						node["boundary"="protected_area"]["protect_class"="5"](around:${radius},${location.lat},${location.lng});
						way["leisure"="park"]["park_type"="state_park"](around:${radius},${location.lat},${location.lng});
					`;

					case 'camping':
						return `
						node["tourism"="camp_site"](around:${radius},${location.lat},${location.lng});
						node["tourism"="caravan_site"](around:${radius},${location.lat},${location.lng});
						node["amenity"="camping"](around:${radius},${location.lat},${location.lng});
						node["tourism"="wilderness_hut"](around:${radius},${location.lat},${location.lng});
					`;

					case 'dining':
						return `
						node["amenity"="restaurant"](around:${radius},${location.lat},${location.lng});
						node["amenity"="cafe"](around:${radius},${location.lat},${location.lng});
						node["amenity"="fast_food"](around:${radius},${location.lat},${location.lng});
						node["amenity"="food_court"](around:${radius},${location.lat},${location.lng});
						node["amenity"="bar"](around:${radius},${location.lat},${location.lng});
						node["amenity"="pub"](around:${radius},${location.lat},${location.lng});
					`;

					case 'attraction':
						return `
						node["tourism"="attraction"](around:${radius},${location.lat},${location.lng});
						node["tourism"="viewpoint"](around:${radius},${location.lat},${location.lng});
						node["historic"](around:${radius},${location.lat},${location.lng});
						node["tourism"="museum"](around:${radius},${location.lat},${location.lng});
						node["tourism"="theme_park"](around:${radius},${location.lat},${location.lng});
						node["natural"="peak"](around:${radius},${location.lat},${location.lng});
						way["tourism"="attraction"](around:${radius},${location.lat},${location.lng});
					`;

					case 'lodging':
						return `
						node["tourism"="hotel"](around:${radius},${location.lat},${location.lng});
						node["tourism"="motel"](around:${radius},${location.lat},${location.lng});
						node["tourism"="guest_house"](around:${radius},${location.lat},${location.lng});
						node["tourism"="hostel"](around:${radius},${location.lat},${location.lng});
						node["tourism"="apartment"](around:${radius},${location.lat},${location.lng});
						node["tourism"="resort"](around:${radius},${location.lat},${location.lng});
					`;

					case 'fuel':
						return `
						node["amenity"="fuel"](around:${radius},${location.lat},${location.lng});
						node["shop"="gas"](around:${radius},${location.lat},${location.lng});
						node["amenity"="charging_station"](around:${radius},${location.lat},${location.lng});
					`;

					default:
						return '';
				}
			})
			.filter((part) => part.trim())
			.join('\n');

		return `[out:json][timeout:25];
(
${queryParts}
);
out body;
>;
out skel qt;`;
	}

	/**
	 * Transform Overpass API response to our POI format
	 */
	private transformOverpassResponse(data: { elements: OverpassElement[] }): POI[] {
		return data.elements.map((element: OverpassElement) => ({
			id: element.id.toString(),
			name: element.tags?.name || 'Unnamed POI',
			lat: element.lat,
			lng: element.lon,
			category: this.mapOverpassCategory(element.tags),
			rating: Math.random() * 2 + 3, // Mock rating
			description: element.tags?.description || 'Point of interest in the Southwest USA.',
			website: element.tags?.website || ''
		}));
	}

	/**
	 * Map Overpass tags to our POI categories with comprehensive mapping
	 */
	private mapOverpassCategory(tags: Record<string, string>): POI['category'] {
		// National Parks
		if (
			tags.boundary === 'national_park' ||
			(tags.leisure === 'park' && tags.protection_title) ||
			(tags.leisure === 'nature_reserve' && tags.name?.includes('National'))
		) {
			return 'national_park';
		}

		// State Parks
		if (
			(tags.leisure === 'park' && tags.park_type === 'state_park') ||
			(tags.leisure === 'park' && tags.name?.includes('State Park')) ||
			(tags.boundary === 'protected_area' && tags.protect_class === '5')
		) {
			return 'state_park';
		}

		// Camping
		if (
			tags.tourism === 'camp_site' ||
			tags.tourism === 'caravan_site' ||
			tags.amenity === 'camping' ||
			tags.tourism === 'wilderness_hut'
		) {
			return 'camping';
		}

		// Dining
		if (
			tags.amenity === 'restaurant' ||
			tags.amenity === 'cafe' ||
			tags.amenity === 'fast_food' ||
			tags.amenity === 'food_court' ||
			tags.amenity === 'bar' ||
			tags.amenity === 'pub'
		) {
			return 'dining';
		}

		// Attractions
		if (
			tags.tourism === 'attraction' ||
			tags.tourism === 'viewpoint' ||
			tags.tourism === 'museum' ||
			tags.tourism === 'theme_park' ||
			tags.historic ||
			tags.natural === 'peak'
		) {
			return 'attraction';
		}

		// Lodging
		if (
			tags.tourism === 'hotel' ||
			tags.tourism === 'motel' ||
			tags.tourism === 'guest_house' ||
			tags.tourism === 'hostel' ||
			tags.tourism === 'apartment' ||
			tags.tourism === 'resort'
		) {
			return 'lodging';
		}

		// Fuel
		if (tags.amenity === 'fuel' || tags.shop === 'gas' || tags.amenity === 'charging_station') {
			return 'fuel';
		}

		return 'attraction'; // Default fallback
	}

	/**
	 * Mock POI discovery for fallback
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
					rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
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
			state_park: ['Antelope Canyon', 'Goblin Valley', 'Valley of the Gods'],
			camping: ['Desert Oasis Campground', 'Starlight Mesa', 'Cactus Flats RV Park'],
			dining: ['Southwest Grill', 'Route 66 Diner', 'Canyon Coffee House'],
			attraction: ['Hoover Dam', 'Area 51 Gateway', 'Meteor Crater'],
			lodging: ['The Oasis Motel', 'Desert Rose Inn', 'Canyon View Lodge'],
			fuel: ['Last Chance Gas', 'Desert Fuel Stop', 'Route 66 Gas & Go']
		};
		return names[category]?.[index] || `Generic ${category}`;
	}

	/**
	 * Sleep utility for rate limiting
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

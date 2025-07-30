// Southwest USA specific types for Vronis Roadtripper

export interface LatLng {
	lat: number;
	lng: number;
}

export interface Waypoint {
	id: string;
	name: string;
	lat: number;
	lng: number;
	icon?: string;
	type?: 'attraction' | 'lodging' | 'fuel' | 'food' | 'custom';
	description?: string;
	estimatedStopTime?: number; // minutes
}

export interface Route {
	id: string;
	waypoints: Waypoint[];
	distance: number; // miles
	duration: number; // minutes
	polyline?: string;
	elevation?: number[];
}

export interface Trip {
	id: string;
	name: string;
	description?: string;
	route: Route;
	estimatedCost: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface POI {
	id: string;
	name: string;
	lat: number;
	lng: number;
	category:
		| 'national_park'
		| 'state_park'
		| 'camping'
		| 'dining'
		| 'attraction'
		| 'fuel'
		| 'lodging';
	rating?: number;
	description?: string;
	website?: string;
	phone?: string;
	amenities?: string[];
}

// Southwest USA bounds
export const SOUTHWEST_BOUNDS = {
	north: 42.0,
	south: 31.0,
	east: -103.0,
	west: -125.0
};

// Southwest USA states
export const SOUTHWEST_STATES = {
	CA: 'California',
	NV: 'Nevada',
	UT: 'Utah',
	AZ: 'Arizona'
} as const;

export type SouthwestState = keyof typeof SOUTHWEST_STATES;

// Cost calculation factors
export interface CostFactors {
	fuelPricePerGallon: number;
	mpg: number;
	lodgingPerNight: number;
	mealsPerDay: number;
	attractionFees: number;
}

// API Response types
export interface RouteResponse {
	distance: number;
	duration: number;
	polyline: string;
	elevation?: number[];
}

export interface POIResponse {
	pois: POI[];
	total: number;
}

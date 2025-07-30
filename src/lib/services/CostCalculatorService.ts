import type { Trip, CostFactors } from '../types';

/**
 * Service for calculating estimated trip costs for Southwest USA
 */
export class CostCalculatorService {
	/**
	 * Calculate estimated cost for a given trip
	 */
	calculateTripCost(trip: Trip, factors: CostFactors): number {
		const { route } = trip;
		const { fuelPricePerGallon, mpg, lodgingPerNight, mealsPerDay, attractionFees } = factors;

		// Fuel cost
		const fuelCost = (route.distance / mpg) * fuelPricePerGallon;

		// Lodging cost (assuming one night per 8 hours of driving)
		const drivingDays = Math.ceil(route.duration / (8 * 60));
		const lodgingCost = (drivingDays - 1) * lodgingPerNight; // -1 for the last day

		// Food cost
		const foodCost = drivingDays * mealsPerDay;

		// Total estimated cost
		const totalCost = fuelCost + lodgingCost + foodCost + attractionFees;

		return Math.round(totalCost);
	}

	/**
	 * Get recommended cost factors for Southwest USA
	 */
	getSouthwestCostFactors(): CostFactors {
		return {
			fuelPricePerGallon: 4.5, // Average for CA/NV/AZ/UT
			mpg: 25, // Average car MPG
			lodgingPerNight: 150, // Mid-range motel/hotel
			mealsPerDay: 75, // Mix of restaurants and groceries
			attractionFees: 100 // Estimate for park passes etc.
		};
	}
}

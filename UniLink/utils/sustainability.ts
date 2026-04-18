import { Ride } from "../types/Ride";

export const CO2_PER_KM = 0.12; // 120g/km is the industry average for passenger cars

/**
 * Calculates the CO2 saved for a specific user in a collection of rides.
 * 
 * @param rides List of completed rides
 * @param userId Unique identifier of the user (uid or email)
 * @returns Total kg of CO2 saved
 */
export function calculateUserCO2Saved(rides: Ride[], userId: string | undefined): number {
  if (!userId) return 0;
  
  let totalCO2 = 0;

  rides.forEach(r => {
    // Only count completed rides that have a pre-calculated distance
    if (!r.completed || !r.distanceKm) return;

    const isDriver = r.driverId === userId;
    const isPassenger = r.passengers.includes(userId);

    const co2SavedPerPassenger = r.distanceKm * CO2_PER_KM;

    if (isDriver && r.passengers.length > 0) {
      // Driver saves the sum of all their passengers' emissions
      totalCO2 += co2SavedPerPassenger * r.passengers.length;
    } else if (isPassenger) {
      // Passenger saves their own emissions
      totalCO2 += co2SavedPerPassenger;
    }
  });

  return totalCO2;
}

/**
 * Formats the CO2 value to a readable string with units.
 */
export function formatCO2(value: number): string {
  return `${value.toFixed(2)} kg`;
}

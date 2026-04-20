import { Ride } from "../types/Ride";

export const CO2_PER_KM = 0.12; 

export function calculateUserCO2Saved(rides: Ride[], userId: string | undefined): number {
  if (!userId) return 0;
  
  let totalCO2 = 0;

  rides.forEach(r => {
    if (!r.completed || !r.distanceKm) return;

    const isDriver = r.driverId === userId;
    const isPassenger = r.passengers.includes(userId);

    const co2SavedPerPassenger = r.distanceKm * CO2_PER_KM;

    if (isDriver && r.passengers.length > 0) {
      totalCO2 += co2SavedPerPassenger * r.passengers.length;
    } else if (isPassenger) {
      totalCO2 += co2SavedPerPassenger;
    }
  });

  return totalCO2;
}

export function formatCO2(value: number): string {
  return `${value.toFixed(2)} kg`;
}

import type { Car } from "../entities/Car";
import { areRequiredFieldsFilled, isValidSeatCount } from "./validation";

type RuleResult =
  | { ok: true; seats: number }
  | { ok: false; error: string };

export interface RideCreateInput {
  origin: string;
  destination: string;
  originCoords: { latitude: number; longitude: number } | null;
  destinationCoords: { latitude: number; longitude: number } | null;
  seats: string;
  car: Car;
  departure: Date;
}

export function canCreateRide(input: RideCreateInput): RuleResult {
  const { origin, destination, originCoords, destinationCoords, seats, car, departure } = input;

  if (!areRequiredFieldsFilled({ origin, destination, seats }))
    return { ok: false, error: "Fill all fields" };

  if (!originCoords || !destinationCoords)
    return { ok: false, error: "Please select a real location." };

  if (origin.trim().toLowerCase() === destination.trim().toLowerCase())
    return { ok: false, error: "Origin and destination must differ" };

  const seatCheck = isValidSeatCount(seats, car.seatCapacity - 1);
  if (!seatCheck.ok)
    return { ok: false, error: seatCheck.error ?? "Invalid seat count" };

  if (departure < new Date())
    return { ok: false, error: "Cannot create ride in past" };

  return { ok: true, seats: seatCheck.seats };
}

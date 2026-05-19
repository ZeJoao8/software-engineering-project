import type { Car } from "../entities/Car";

type RuleResult = { ok: true } | { ok: false; error: string };

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

  if (!origin.trim() || !destination.trim())
    return { ok: false, error: "Fill all fields" };

  if (!originCoords || !destinationCoords)
    return { ok: false, error: "Please select a real location." };

  if (origin.trim().toLowerCase() === destination.trim().toLowerCase())
    return { ok: false, error: "Origin and destination must differ" };

  const seatsNumber = Number(seats);
  if (!Number.isInteger(seatsNumber))
    return { ok: false, error: "Seats must be integer" };

  if (seatsNumber < 1)
    return { ok: false, error: "Must allow at least 1 passenger" };

  if (seatsNumber > car.seatCapacity - 1)
    return { ok: false, error: `Max passengers ${car.seatCapacity - 1}` };

  if (departure < new Date())
    return { ok: false, error: "Cannot create ride in past" };

  return { ok: true };
}

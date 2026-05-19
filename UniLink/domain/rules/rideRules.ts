import type { Ride } from "../entities/Ride";
import type { User } from "../entities/User";

type RuleResult = { ok: true } | { ok: false; error: string };

export function generateBoardingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function canReserveSeat(ride: Ride, user: User, now: Date): RuleResult {
  if (ride.completed) return { ok: false, error: "Ride already completed." };
  if (new Date(ride.departureDateTime) < now) return { ok: false, error: "Ride already started." };
  if (ride.womenOnly && user.gender !== "Female") return { ok: false, error: "Ride restricted to women." };
  if (ride.availableSeats <= 0) return { ok: false, error: "No seats available." };
  return { ok: true };
}

export function canCancelSeat(ride: Ride, now: Date): RuleResult {
  if (new Date(ride.departureDateTime) < now || ride.completed)
    return { ok: false, error: "Ride already started." };
  return { ok: true };
}

export function canCancelRide(ride: Ride, now: Date): RuleResult {
  if (new Date(ride.departureDateTime) < now || ride.completed)
    return { ok: false, error: "Ride already started." };
  return { ok: true };
}

export function canCompleteRide(ride: Ride, userId: string): RuleResult {
  if (ride.driverId !== userId) return { ok: false, error: "Only the driver can complete the ride." };
  if (ride.completed) return { ok: false, error: "Ride already completed." };
  const allVerified =
    ride.passengers.length > 0 &&
    ride.passengers.every(pid => (ride.verifiedPassengers ?? []).includes(pid));
  if (!allVerified) return { ok: false, error: "Not all passengers have been verified." };
  return { ok: true };
}

export function canRemovePassenger(ride: Ride, now: Date): RuleResult {
  if (new Date(ride.departureDateTime) < now || ride.completed)
    return { ok: false, error: "Ride already started." };
  return { ok: true };
}

export function shouldAutoDeleteRide(ride: Ride, now: Date): boolean {
  return !ride.completed && ride.passengers.length === 0 && new Date(ride.departureDateTime) < now;
}
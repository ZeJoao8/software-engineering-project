import type { Ride } from "../entities/Ride";
import type { User } from "../entities/User";
import type { Review } from "../entities/Review";
import type { Report } from "../entities/Report";

type RuleResult = { ok: true } | { ok: false; error: string };

export function generateBoardingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isRideStarted(ride: Ride, now: Date): boolean {
  return new Date(ride.departureDateTime) < now || ride.completed;
}

export function canReserveSeat(ride: Ride, user: User, now: Date): RuleResult {
  if (ride.completed) return { ok: false, error: "Ride already completed." };
  if (new Date(ride.departureDateTime) < now) return { ok: false, error: "Ride already started." };
  if (ride.womenOnly && user.gender !== "Female") return { ok: false, error: "Ride restricted to women." };
  if (ride.availableSeats <= 0) return { ok: false, error: "No seats available." };
  return { ok: true };
}

export function canCancelSeat(ride: Ride, now: Date): RuleResult {
  if (isRideStarted(ride, now)) return { ok: false, error: "Ride already started." };
  return { ok: true };
}

export function canCancelRide(ride: Ride, now: Date): RuleResult {
  if (isRideStarted(ride, now)) return { ok: false, error: "Ride already started." };
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
  if (isRideStarted(ride, now)) return { ok: false, error: "Ride already started." };
  return { ok: true };
}

export function canChangeCar(ride: Ride, newCarSeats: number, now: Date): RuleResult {
  if (isRideStarted(ride, now)) return { ok: false, error: "Ride already started." };
  const newLimit = Math.min(ride.totalSeats, newCarSeats - 1);
  if (ride.passengers.length > newLimit)
    return { ok: false, error: "New car is too small for current passengers." };
  return { ok: true };
}

export function shouldAutoDeleteRide(ride: Ride, now: Date): boolean {
  return !ride.completed && ride.passengers.length === 0 && new Date(ride.departureDateTime) < now;
}

export function canRateDriver(ride: Ride, userId: string, reviews: Review[]): boolean {
  const isPassenger = ride.passengers.includes(userId);
  const isDriver = ride.driverId === userId;
  if (!isPassenger || isDriver || !ride.completed) return false;
  return !reviews.some(
    r => r.rideId === ride.id && r.reviewerId === userId && r.revieweeId === ride.driverId
  );
}

export function canReportUser(
  ride: Ride,
  currentUserId: string,
  targetId: string,
  reports: Report[]
): boolean {
  const isDriver = ride.driverId === currentUserId;
  const joined = ride.passengers.includes(currentUserId);
  return (
    ride.completed &&
    (isDriver || joined) &&
    targetId !== currentUserId &&
    !reports.some(
      rep => rep.rideId === ride.id && rep.reporterId === currentUserId && rep.reportedUserId === targetId
    )
  );
}
import * as RideRepo from "../repositories/RideRepository";
import * as MessageRepo from "../repositories/MessageRepository";
import { getRides } from "../store/rideStore";
import { getCurrentUser } from "../store/authStore";
import {
  canReserveSeat,
  canCancelSeat,
  canCancelRide,
  canCompleteRide,
  canRemovePassenger,
  generateBoardingCode,
  shouldAutoDeleteRide,
} from "../domain/rules/rideRules";
import { getRoute } from "../infra/routing";
import type { Ride } from "../domain/entities/Ride";
import type { User } from "../domain/entities/User";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

function findRide(rideId: string): Ride | undefined {
  return getRides().find(r => r.id === rideId);
}

export async function createRide(ride: Ride): Promise<Result> {
  try {
    await RideRepo.save(ride);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the ride. Please try again." };
  }
}

export async function reserveSeat(
  rideId: string,
  user: User
): Promise<Result<{ boardingCode: string }>> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  const check = canReserveSeat(ride, user, new Date());
  if (!check.ok) return check;

  const boardingCode = generateBoardingCode();
  try {
    await RideRepo.save({
      ...ride,
      availableSeats: ride.availableSeats - 1,
      passengers: [...ride.passengers, user.uid],
      passengerCodes: { ...(ride.passengerCodes ?? {}), [user.uid]: boardingCode },
    });
    return { ok: true, data: { boardingCode } };
  } catch {
    return { ok: false, error: "Could not reserve the seat. Please try again." };
  }
}

export async function cancelSeat(
  rideId: string,
  userId: string
): Promise<Result> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  const check = canCancelSeat(ride, new Date());
  if (!check.ok) return check;

  const updatedCodes = { ...(ride.passengerCodes ?? {}) };
  delete updatedCodes[userId];
  try {
    await RideRepo.save({
      ...ride,
      availableSeats: Math.min(ride.availableSeats + 1, ride.totalSeats),
      passengers: ride.passengers.filter(p => p !== userId),
      passengerCodes: updatedCodes,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not cancel the reservation. Please try again." };
  }
}

export async function cancelRide(rideId: string): Promise<Result> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  const check = canCancelRide(ride, new Date());
  if (!check.ok) return check;

  try {
    await MessageRepo.deleteByRide(rideId);
    await RideRepo.remove(rideId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not cancel the ride. Please try again." };
  }
}

export async function completeRide(
  rideId: string,
  userId: string
): Promise<Result> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  const check = canCompleteRide(ride, userId);
  if (!check.ok) return check;

  let distanceKm = ride.distanceKm;
  if (!distanceKm && ride.originCoords && ride.destinationCoords) {
    const route = await getRoute(ride.originCoords, ride.destinationCoords);
    if (route) distanceKm = route.distanceKm;
  }

  try {
    await RideRepo.save({ ...ride, completed: true, distanceKm });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not complete the ride. Please try again." };
  }
}

export async function removePassenger(
  rideId: string,
  passengerId: string
): Promise<Result> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  const check = canRemovePassenger(ride, new Date());
  if (!check.ok) return check;

  const updatedCodes = { ...(ride.passengerCodes ?? {}) };
  delete updatedCodes[passengerId];
  const updatedVerified = (ride.verifiedPassengers ?? []).filter(pid => pid !== passengerId);
  try {
    await RideRepo.save({
      ...ride,
      passengers: ride.passengers.filter(pid => pid !== passengerId),
      availableSeats: Math.min(ride.availableSeats + 1, ride.totalSeats),
      passengerCodes: updatedCodes,
      verifiedPassengers: updatedVerified,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not remove the passenger. Please try again." };
  }
}

export async function verifyPassengerCode(
  rideId: string,
  code: string
): Promise<Result<{ verifiedPassengerId: string }>> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  const entered = code.trim();
  const matchId = Object.entries(ride.passengerCodes ?? {}).find(
    ([pid, c]) => c === entered && !(ride.verifiedPassengers ?? []).includes(pid)
  )?.[0];

  if (!matchId) return { ok: false, error: "No unverified passenger matches this code." };

  try {
    await RideRepo.save({
      ...ride,
      verifiedPassengers: [...(ride.verifiedPassengers ?? []), matchId],
    });
    return { ok: true, data: { verifiedPassengerId: matchId } };
  } catch {
    return { ok: false, error: "Could not verify the code. Please try again." };
  }
}

export async function changeCar(
  rideId: string,
  newCarId: string,
  newCarSeatCapacity: number
): Promise<Result> {
  const ride = findRide(rideId);
  if (!ride) return { ok: false, error: "Ride not found." };

  if (new Date(ride.departureDateTime) < new Date() || ride.completed)
    return { ok: false, error: "Ride already started." };

  const newLimit = Math.min(ride.totalSeats, newCarSeatCapacity - 1);
  if (ride.passengers.length > newLimit)
    return { ok: false, error: "New car is too small for current passengers." };

  try {
    await RideRepo.save({
      ...ride,
      carId: newCarId,
      totalSeats: newLimit,
      availableSeats: newLimit - ride.passengers.length,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not change car. Please try again." };
  }
}

export function removeEmptyPastRides(now = new Date()): void {
  const user = getCurrentUser();
  if (!user) return;
  getRides()
    .filter(r => r.driverId === user.uid && shouldAutoDeleteRide(r, now))
    .forEach(r => {
      void MessageRepo.deleteByRide(r.id).then(() => RideRepo.remove(r.id));
    });
}

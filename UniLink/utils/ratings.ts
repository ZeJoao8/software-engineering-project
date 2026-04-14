import type { Ride } from "../types/Ride";

export function sameIdentity(
  storedId: string,
  uid: string,
  email: string
): boolean {
  return storedId === uid || storedId === email;
}

export function wasPassengerOnRide(
  ride: Ride,
  uid: string,
  email: string
): boolean {
  return ride.passengers.some(p =>
    sameIdentity(p, uid, email)
  );
}

export function isDriverOfRide(
  ride: Ride,
  uid: string,
  email: string
): boolean {
  return sameIdentity(ride.driverId, uid, email);
}

export function wasParticipantInRide(
  ride: Ride,
  uid: string,
  email: string
): boolean {
  return (
    isDriverOfRide(ride, uid, email) ||
    wasPassengerOnRide(ride, uid, email)
  );
}

export function canPassengerRateDriver(
  ride: Ride,
  uid: string,
  email: string
): boolean {
  if (!ride.completed) {
    return false;
  }
  if (isDriverOfRide(ride, uid, email)) {
    return false;
  }
  return wasPassengerOnRide(ride, uid, email);
}

export function canDriverRatePassenger(
  ride: Ride,
  passengerId: string,
  uid: string,
  email: string
): boolean {
  if (!ride.completed) {
    return false;
  }
  if (!isDriverOfRide(ride, uid, email)) {
    return false;
  }
  if (sameIdentity(passengerId, uid, email)) {
    return false;
  }
  return ride.passengers.includes(passengerId);
}

export function ratingAlreadySubmitted(
  ratings: { fromUserId: string; toUserId: string }[],
  fromUid: string,
  fromEmail: string,
  toUserId: string
): boolean {
  return ratings.some(
    r =>
      sameIdentity(r.fromUserId, fromUid, fromEmail) &&
      r.toUserId === toUserId
  );
}

export function isSelfRating(
  toUserId: string,
  uid: string,
  email: string
): boolean {
  return sameIdentity(toUserId, uid, email);
}

export function normalizeStars(stars: number): number {
  const n = Math.round(stars);
  return Math.min(5, Math.max(1, n));
}

export type ReceivedRatingStats = {
  average: number;
  count: number;
};

export function getReceivedRatingStats(
  rides: Ride[],
  userUid: string,
  userEmail: string
): ReceivedRatingStats | null {
  const list = rides.flatMap(ride =>
    (ride.ratings ?? []).filter(r =>
      sameIdentity(r.toUserId, userUid, userEmail)
    )
  );
  if (list.length === 0) {
    return null;
  }
  const sum = list.reduce((s, r) => s + r.stars, 0);
  return {
    average: sum / list.length,
    count: list.length
  };
}

export function findMyRatingToUser(
  ride: Ride,
  fromUid: string,
  fromEmail: string,
  toUserId: string
): number | undefined {
  const hit = (ride.ratings ?? []).find(
    r =>
      sameIdentity(r.fromUserId, fromUid, fromEmail) &&
      r.toUserId === toUserId
  );
  return hit?.stars;
}

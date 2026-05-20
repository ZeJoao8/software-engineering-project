import type { Ride } from "../entities/Ride";
import type { User } from "../entities/User";
import { formatDate } from "../../utils/date";

export interface FilterCriteria {
  origin: string;
  destination: string;
  date: string;
  womenOnly: boolean;
  minSeats: string;
  friendsOnly?: boolean;
  friendIds?: string[];
}

export function filterRides(
  rides: Ride[],
  user: User,
  filters: FilterCriteria,
  now: Date
): Ride[] {
  const { origin, destination, date, womenOnly, minSeats, friendsOnly, friendIds } = filters;

  return rides.filter(r => {
    const rideDate = new Date(r.departureDateTime);
    const isFuture = rideDate >= now;
    const hasSeats = r.availableSeats > 0;
    const notCompleted = !r.completed;
    const isNotDriver = r.driverId !== user.uid;
    const isNotPassenger = !r.passengers.includes(user.uid);

    if (!isFuture || !hasSeats || !notCompleted || !isNotDriver || !isNotPassenger)
      return false;

    const matchesOrigin = r.origin.toLowerCase().includes(origin.toLowerCase());
    const matchesDestination = r.destination.toLowerCase().includes(destination.toLowerCase());
    const matchesDate = formatDate(r.departureDateTime).toLowerCase().includes(date.toLowerCase());
    const matchesMinSeats = !minSeats || r.availableSeats >= Number(minSeats);
    const canJoinGenderWise = user.gender === "Female" || !r.womenOnly;
    const matchesWomenOnlyFilter = !womenOnly || r.womenOnly;
    const matchesFriendsOnly = !friendsOnly || (friendIds ?? []).includes(r.driverId);

    return (
      matchesOrigin &&
      matchesDestination &&
      matchesDate &&
      matchesMinSeats &&
      canJoinGenderWise &&
      matchesWomenOnlyFilter &&
      matchesFriendsOnly
    );
  });
}
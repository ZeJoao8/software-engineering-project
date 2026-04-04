import { Ride } from "../types/Ride";
import { User } from "../types/User";
import { formatDate } from "./date";

export interface FilterCriteria {
  origin: string;
  destination: string;
  date: string;
  womenOnly: boolean;
  minSeats: string;
}

/**
 * Filters rides based on user preferences and search criteria.
 * This is a pure function, making it easy to unit test.
 */
export function filterRides(
  rides: Ride[],
  user: User,
  filters: FilterCriteria,
  now: Date
): Ride[] {
  const { origin, destination, date, womenOnly, minSeats } = filters;

  return rides.filter(r => {
    // 1. Basic Availability
    // We use the provided 'now' date to ensure consistency during testing
    const isFuture = new Date(r.departureDateTime) >= now;
    const hasSeats = r.availableSeats > 0;
    
    // 2. Personal Restriction (Not the driver, not already a passenger)
    const isNotDriver = r.driverId !== user.uid && r.driverId !== user.email;
    const isNotPassenger = !r.passengers.includes(user.uid) && !r.passengers.includes(user.email);

    if (!isFuture || !hasSeats || !isNotDriver || !isNotPassenger) {
      return false;
    }

    // 3. Search Filters
    const matchesOrigin = r.origin.toLowerCase().includes(origin.toLowerCase());
    const matchesDestination = r.destination.toLowerCase().includes(destination.toLowerCase());
    const matchesDate = formatDate(r.departureDateTime).toLowerCase().includes(date.toLowerCase());
    
    const matchesMinSeats = !minSeats || r.availableSeats >= Number(minSeats);
    
    // 4. Gender Restrictions
    // If the ride is womenOnly, only female users can see/join it.
    const canJoinGenderWise = user.gender === "Female" || !r.womenOnly;
    
    // If the user explicitly checks "Women Only" filter, only show women-only rides.
    const matchesWomenOnlyFilter = !womenOnly || r.womenOnly;

    return (
      matchesOrigin &&
      matchesDestination &&
      matchesDate &&
      matchesMinSeats &&
      canJoinGenderWise &&
      matchesWomenOnlyFilter
    );
  });
}

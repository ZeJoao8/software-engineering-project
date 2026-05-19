import { Ride } from "../types/Ride";
import { User } from "../types/User";
import { formatDate } from "./date";

export interface FilterCriteria {
  origin: string;
  destination: string;
  date: string;
  womenOnly: boolean;
  minSeats: string;
  friendsOnly: boolean;
  friendIds: string[];
}

/**
 * Filters rides based on user preferences and search criteria.
 */
export function filterRides(
  rides: Ride[],
  user: User,
  filters: FilterCriteria,
  now: Date
): Ride[] {

  const {
    origin,
    destination,
    date,
    womenOnly,
    minSeats,
    friendsOnly,
    friendIds,
  } = filters;

  return rides.filter(r => {

    // 1. availability
    const rideDate =
      new Date(r.departureDateTime);

    const isFuture =
      rideDate >= now;

    const hasSeats =
      r.availableSeats > 0;

    const notCompleted =
      !r.completed;


    // 2. user restrictions
    const isNotDriver = r.driverId !== user.uid;

    const isNotPassenger = !r.passengers.includes(user.uid);


    if (
      !isFuture ||
      !hasSeats ||
      !notCompleted ||
      !isNotDriver ||
      !isNotPassenger
    ) {

      return false;

    }


    // 3. search filters

    const matchesOrigin =
      r.origin
        .toLowerCase()
        .includes(
          origin.toLowerCase()
        );

    const matchesDestination =
      r.destination
        .toLowerCase()
        .includes(
          destination.toLowerCase()
        );

    const matchesDate =
      formatDate(
        r.departureDateTime
      )
        .toLowerCase()
        .includes(
          date.toLowerCase()
        );


    const matchesMinSeats =
      !minSeats ||
      r.availableSeats >= Number(minSeats);


    // 4. gender logic

    const canJoinGenderWise =
      user.gender === "Female" ||
      !r.womenOnly;


    const matchesWomenOnlyFilter =
      !womenOnly ||
      r.womenOnly;


    const matchesFriendsOnly =
      !friendsOnly ||
      friendIds.includes(r.driverId);

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
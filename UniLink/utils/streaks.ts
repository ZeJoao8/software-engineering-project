import type { Ride } from "../domain/entities/Ride";

function isSameWeek(date1: Date, date2: Date) {

  const first = new Date(date1);
  const second = new Date(date2);

  first.setHours(0,0,0,0);
  second.setHours(0,0,0,0);

  const diff =
    Math.abs(first.getTime() - second.getTime());

  const days =
    diff / (1000 * 60 * 60 * 24);

  return days < 7;
}

export function calculateWeeklyStreak(
  rides: Ride[],
  userId: string
) {

  const completedRides = rides.filter(ride => {

    const participated =
      ride.driverId === userId ||
      ride.passengers.includes(userId);

    const completed =
      ride.completed ||
      new Date(ride.departureDateTime) < new Date();

    return participated && completed;

  });

  let streak = 0;

  let currentWeek = new Date();

  while (true) {

    const foundRide =
      completedRides.some(ride => {

        return isSameWeek(
          new Date(ride.departureDateTime),
          currentWeek
        );

      });

    if (!foundRide) {
      break;
    }

    streak++;

    currentWeek.setDate(
      currentWeek.getDate() - 7
    );

  }

  return streak;

}
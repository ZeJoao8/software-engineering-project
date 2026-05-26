import type { Ride } from "../entities/Ride";

function getWeekStart(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // rewind to Monday
  return d.getTime();
}

function isSameWeek(date1: Date, date2: Date): boolean {
  return getWeekStart(date1) === getWeekStart(date2);
}

export function calculateWeeklyStreak(rides: Ride[], userId: string): number {
  const completedRides = rides.filter(ride => {
    const participated =
      ride.driverId === userId || ride.passengers.includes(userId);
    const completed =
      ride.completed || new Date(ride.departureDateTime) < new Date();
    return participated && completed;
  });

  let streak = 0;
  const currentWeek = new Date();

  while (true) {
    const foundRide = completedRides.some(ride =>
      isSameWeek(new Date(ride.departureDateTime), currentWeek)
    );

    if (!foundRide) break;

    streak++;
    currentWeek.setDate(currentWeek.getDate() - 7);
  }

  return streak;
}
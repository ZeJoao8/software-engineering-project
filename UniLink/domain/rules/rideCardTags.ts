import type { Ride } from "../entities/Ride";
import type { Review } from "../entities/Review";
import type { Report } from "../entities/Report";
import { hasUserReported } from "./reportRules";

export type RideCardTag =
  | { kind: "womenOnly" }
  | { kind: "driverRating"; average: number; hasComments: boolean }
  | { kind: "driverNoRating" }
  | { kind: "reportedInRide" }
  | { kind: "passengerRating"; rating: number; hasComment: boolean }
  | { kind: "passengerNoRating" };

export function buildRideCardTags(
  ride: Ride,
  userId: string,
  reviews: Review[],
  reports: Report[]
): RideCardTag[] {
  const tags: RideCardTag[] = [];

  if (ride.womenOnly) tags.push({ kind: "womenOnly" });

  const isPassenger = ride.passengers.includes(userId);
  const isDriver = ride.driverId === userId;

  if (isDriver && ride.completed) {
    const rideReviews = reviews.filter(
      r => r.rideId === ride.id && r.revieweeId === userId
    );
    if (rideReviews.length > 0) {
      const avg = rideReviews.reduce((s, r) => s + r.rating, 0) / rideReviews.length;
      const hasComments = rideReviews.some(r => r.comment.trim().length > 0);
      tags.push({
        kind: "driverRating",
        average: Number(avg.toFixed(1)),
        hasComments,
      });
    } else {
      tags.push({ kind: "driverNoRating" });
    }
  }

  const reportedInRide = [...ride.passengers, ride.driverId].some(
    targetId => targetId !== userId && hasUserReported(reports, userId, targetId)
  );
  if (reportedInRide) tags.push({ kind: "reportedInRide" });

  if (isPassenger && !isDriver && ride.completed) {
    const myReview = reviews.find(
      r =>
        r.rideId === ride.id &&
        r.reviewerId === userId &&
        r.revieweeId === ride.driverId
    );
    if (myReview) {
      tags.push({
        kind: "passengerRating",
        rating: myReview.rating,
        hasComment: myReview.comment.trim().length > 0,
      });
    } else {
      tags.push({ kind: "passengerNoRating" });
    }
  }

  return tags;
}

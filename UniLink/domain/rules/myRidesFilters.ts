import type { Ride } from "../entities/Ride";
import type { Review } from "../entities/Review";
import type { Report } from "../entities/Report";
import { hasReportedAnyoneInRide } from "./reportRules";

export type StatusFilter = "all" | "active" | "completed";
export type ExtraFilter = "womenOnly" | "hasFeedback" | "hasReport";
export type RatingFilter = "none" | "1-2" | "3" | "4-5";

export function matchesRating(
  ride: Ride,
  role: "driver" | "passenger",
  userId: string,
  reviews: Review[],
  ratingFilter: RatingFilter | null
): boolean {
  if (!ratingFilter) return true;
  if (role === "driver") {
    const rideReviews = reviews.filter(
      rev => rev.rideId === ride.id && rev.revieweeId === userId
    );
    if (ratingFilter === "none") return ride.completed && rideReviews.length === 0;
    if (rideReviews.length === 0) return false;
    const avg = rideReviews.reduce((s, rev) => s + rev.rating, 0) / rideReviews.length;
    if (ratingFilter === "1-2") return avg < 3;
    if (ratingFilter === "3") return avg >= 3 && avg < 4;
    return avg >= 4;
  }
  const myReview = reviews.find(
    rev => rev.rideId === ride.id && rev.reviewerId === userId
  );
  if (ratingFilter === "none") return ride.completed && !myReview;
  if (!myReview) return false;
  if (ratingFilter === "1-2") return myReview.rating <= 2;
  if (ratingFilter === "3") return myReview.rating === 3;
  return myReview.rating >= 4;
}

export function applyMyRidesFilters(
  list: Ride[],
  role: "driver" | "passenger",
  userId: string,
  reviews: Review[],
  reports: Report[],
  statusFilter: StatusFilter,
  extraFilters: Set<ExtraFilter>,
  ratingFilter: RatingFilter | null
): Ride[] {
  return list.filter(r => {
    if (statusFilter === "active" && r.completed) return false;
    if (statusFilter === "completed" && !r.completed) return false;
    if (extraFilters.has("womenOnly") && !r.womenOnly) return false;
    if (extraFilters.has("hasFeedback")) {
      const hasFeedback = role === "driver"
        ? reviews.some(rev => rev.rideId === r.id && rev.revieweeId === userId && rev.comment.trim().length > 0)
        : reviews.some(rev => rev.rideId === r.id && rev.reviewerId === userId && rev.comment.trim().length > 0);
      if (!hasFeedback) return false;
    }
    if (extraFilters.has("hasReport")) {
      const reported = hasReportedAnyoneInRide(r, reports, userId);
      if (!reported) return false;
    }
    if (!matchesRating(r, role, userId, reviews, ratingFilter)) return false;
    return true;
  });
}

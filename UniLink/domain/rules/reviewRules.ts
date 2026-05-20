import type { Review } from "../entities/Review";

type RuleResult = { ok: true } | { ok: false; error: string };

export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return Number((total / reviews.length).toFixed(1));
}

export function validateReviewRating(rating: number): RuleResult {
  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Choose a rating between 1 and 5 stars." };
  }

  return { ok: true };
}

export function getVisibleFeedback(
  reviews: Review[],
  rideId: string,
  isDriver: boolean,
  userId: string
): Review[] {
  return reviews.filter(
    r =>
      r.rideId === rideId &&
      r.comment.trim().length > 0 &&
      (isDriver ? r.revieweeId === userId : r.reviewerId === userId)
  );
}

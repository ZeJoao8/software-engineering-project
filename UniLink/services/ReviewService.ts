import * as ReviewRepo from "../repositories/ReviewRepository";
import { createNotification } from "./NotificationService";
import type { Review } from "../domain/entities/Review";
import { validateReviewRating } from "../domain/rules/reviewRules";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function addReview(review: Review): Promise<Result> {
  const check = validateReviewRating(review.rating);
  if (!check.ok) return check;

  try {
    await ReviewRepo.save({
      ...review,
      comment: review.comment.trim(),
    });
    await createNotification({
      userId: review.revieweeId,
      type: "passenger_review",
      title: "New review",
      body: review.comment.trim()
        ? `A passenger rated you ${review.rating}/5 and left feedback.`
        : `A passenger rated you ${review.rating}/5.`,
      rideId: review.rideId,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the review. Please try again." };
  }
}

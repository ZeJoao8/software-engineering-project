import * as ReviewRepo from "../repositories/ReviewRepository";
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
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the review. Please try again." };
  }
}

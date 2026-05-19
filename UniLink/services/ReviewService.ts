import * as ReviewRepo from "../repositories/ReviewRepository";
import type { Review } from "../domain/entities/Review";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function addReview(review: Review): Promise<Result> {
  try {
    await ReviewRepo.save(review);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the review. Please try again." };
  }
}

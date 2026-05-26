import { useEffect, useState } from "react";
import {
  getReviews,
  getReviewsForUser,
  hasReviewForRide,
  subscribeToReviewsChanges,
} from "../store/reviewStore";
import type { Review } from "../domain/entities/Review";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(getReviews);

  useEffect(() => {
    return subscribeToReviewsChanges(() => setReviews(getReviews()));
  }, []);

  return { reviews, getReviewsForUser, hasReviewForRide };
}

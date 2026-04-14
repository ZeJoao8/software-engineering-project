import { Alert } from "react-native";

import {
  collection,
  doc,
  onSnapshot,
  type Unsubscribe,
  setDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import {
  getCurrentUser,
  isAuthReady,
  subscribeToAuthChanges,
} from "./user";

export type Review = {
  id: string;
  rideId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

let reviews: Review[] = [];

const listeners = new Set<() => void>();
let unsubscribeReviewsSnapshot:
  | Unsubscribe
  | null = null;

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function stopReviewsSync() {
  unsubscribeReviewsSnapshot?.();
  unsubscribeReviewsSnapshot = null;
}

function syncReviewsWithAuth() {
  if (!isAuthReady()) {
    return;
  }

  if (!getCurrentUser()) {
    stopReviewsSync();
    reviews = [];
    notifyListeners();
    return;
  }

  if (unsubscribeReviewsSnapshot) {
    return;
  }

  unsubscribeReviewsSnapshot = onSnapshot(
    collection(db, "reviews"),
    snapshot => {
      reviews = snapshot.docs.map(document =>
        document.data() as Review
      );
      notifyListeners();
    },
    error => {
      stopReviewsSync();
      console.error("Reviews sync failed", error);
    }
  );
}

subscribeToAuthChanges(syncReviewsWithAuth);
syncReviewsWithAuth();

export function getReviews() {
  return reviews;
}

export function getReviewsForUser(
  userId: string,
  legacyId?: string
) {
  return reviews.filter(
    review =>
      review.revieweeId === userId ||
      (!!legacyId &&
        review.revieweeId === legacyId)
  );
}

export function hasReviewForRide(
  rideId: string,
  reviewerId: string,
  revieweeId: string,
  reviewerLegacyId?: string,
  revieweeLegacyId?: string
) {
  return reviews.some(
    review =>
      review.rideId === rideId &&
      (
        review.reviewerId === reviewerId ||
        (!!reviewerLegacyId &&
          review.reviewerId === reviewerLegacyId)
      ) &&
      (
        review.revieweeId === revieweeId ||
        (!!revieweeLegacyId &&
          review.revieweeId === revieweeLegacyId)
      )
  );
}

export function getAverageRatingForUser(
  userId: string,
  legacyId?: string
) {
  const userReviews =
    getReviewsForUser(userId, legacyId);

  if (userReviews.length === 0) {
    return 0;
  }

  const total =
    userReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

  return Number(
    (total / userReviews.length).toFixed(1)
  );
}

export function subscribeToReviewsChanges(
  listener: () => void
) {
  listeners.add(listener);
  syncReviewsWithAuth();

  return () => {
    listeners.delete(listener);
  };
}

export async function addReview(review: Review) {
  const previousReviews = reviews;
  reviews = [review, ...reviews];
  notifyListeners();

  try {
    await setDoc(
      doc(db, "reviews", review.id),
      review
    );
  } catch (error) {
    reviews = previousReviews;
    notifyListeners();
    console.error("Add review failed", error);
    Alert.alert(
      "Review save failed",
      "Could not save the review in Firestore."
    );
  }
}
import { Alert } from "react-native";

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  type Unsubscribe,
  setDoc,
  where,
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

  const user = getCurrentUser();

  let reviewsAsReviewer: Review[] = [];
  let reviewsAsReviewee: Review[] = [];

  function mergeReviews() {
    const merged = [...reviewsAsReviewer];
    const ids = new Set(merged.map(r => r.id));
    reviewsAsReviewee.forEach(r => {
      if (!ids.has(r.id)) merged.push(r);
    });
    reviews = merged;
    notifyListeners();
  }

  const qAsReviewer = query(
    collection(db, "reviews"),
    where("reviewerId", "==", user!.uid)
  );
  const qAsReviewee = query(
    collection(db, "reviews"),
    where("revieweeId", "==", user!.uid)
  );

  const unsubA = onSnapshot(
    qAsReviewer,
    snapshot => {
      reviewsAsReviewer = snapshot.docs.map(d => d.data() as Review);
      mergeReviews();
    },
    error => { stopReviewsSync(); console.error("Reviews sync (reviewer) failed", error); }
  );
  const unsubB = onSnapshot(
    qAsReviewee,
    snapshot => {
      reviewsAsReviewee = snapshot.docs.map(d => d.data() as Review);
      mergeReviews();
    },
    error => { stopReviewsSync(); console.error("Reviews sync (reviewee) failed", error); }
  );

  unsubscribeReviewsSnapshot = () => { unsubA(); unsubB(); };
}

subscribeToAuthChanges(syncReviewsWithAuth);
syncReviewsWithAuth();

export function getReviews() {
  return reviews;
}

export function getReviewsForUser(userId: string) {
  return reviews.filter(review => review.revieweeId === userId);
}

export function hasReviewForRide(
  rideId: string,
  reviewerId: string,
  revieweeId: string
) {
  return reviews.some(
    review =>
      review.rideId === rideId &&
      review.reviewerId === reviewerId &&
      review.revieweeId === revieweeId
  );
}

export function getAverageRatingForUser(userId: string) {
  const userReviews = getReviewsForUser(userId);

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

/**
 * Fetches all reviews for a given user (as reviewee) directly from Firestore.
 * Use this in public profiles where the target user may not be in the local cache.
 */
export async function fetchReviewsForUser(userId: string): Promise<Review[]> {
  const snapshot = await getDocs(
    query(collection(db, "reviews"), where("revieweeId", "==", userId))
  );
  return snapshot.docs.map(d => d.data() as Review);
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
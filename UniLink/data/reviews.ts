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

  // Load reviews where the current user is the reviewer OR the reviewee.
  // Two separate queries are merged because Firestore doesn't support OR across fields.
  let mergedReviews: Review[] = [];
  let pendingSnapshots = 0;

  function onPartialSnapshot(partial: Review[]) {
    // Merge the two query results, deduplicating by id
    const ids = new Set(mergedReviews.map(r => r.id));
    partial.forEach(r => { if (!ids.has(r.id)) mergedReviews.push(r); });
    pendingSnapshots--;
    if (pendingSnapshots === 0) {
      reviews = [...mergedReviews];
      notifyListeners();
    }
  }

  pendingSnapshots = 2;
  mergedReviews = [];

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
    snapshot => onPartialSnapshot(snapshot.docs.map(d => d.data() as Review)),
    error => { stopReviewsSync(); console.error("Reviews sync (reviewer) failed", error); }
  );
  const unsubB = onSnapshot(
    qAsReviewee,
    snapshot => onPartialSnapshot(snapshot.docs.map(d => d.data() as Review)),
    error => { stopReviewsSync(); console.error("Reviews sync (reviewee) failed", error); }
  );

  // Wrap both unsubscribes into one
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
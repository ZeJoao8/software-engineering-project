import * as ReviewRepo from "../repositories/ReviewRepository";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./authStore";
import type { Review } from "../domain/entities/Review";

let reviews: Review[] = [];
const listeners = new Set<() => void>();
let unsubReviews: (() => void) | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsubReviews?.();
  unsubReviews = null;
}

function mergeAndSet(asReviewer: Review[], asReviewee: Review[]) {
  const seen = new Set(asReviewer.map(r => r.id));
  reviews = [...asReviewer, ...asReviewee.filter(r => !seen.has(r.id))];
  notifyListeners();
}

function syncWithAuth() {
  if (!isAuthReady()) return;

  if (!getCurrentUser()) {
    stopSync();
    reviews = [];
    notifyListeners();
    return;
  }

  if (unsubReviews) return;

  const user = getCurrentUser()!;
  let asReviewer: Review[] = [];
  let asReviewee: Review[] = [];

  unsubReviews = ReviewRepo.subscribeForUser(
    user.uid,
    updated => { asReviewer = updated; mergeAndSet(asReviewer, asReviewee); },
    updated => { asReviewee = updated; mergeAndSet(asReviewer, asReviewee); },
    error => { stopSync(); console.error("Reviews sync failed", error); }
  );
}

subscribeToAuthChanges(syncWithAuth);
syncWithAuth();

export function getReviews(): Review[] {
  return reviews;
}

export function getReviewsForUser(userId: string): Review[] {
  return reviews.filter(r => r.revieweeId === userId);
}

export function hasReviewForRide(
  rideId: string,
  reviewerId: string,
  revieweeId: string
): boolean {
  return reviews.some(
    r => r.rideId === rideId && r.reviewerId === reviewerId && r.revieweeId === revieweeId
  );
}

export function subscribeToReviewsChanges(listener: () => void): () => void {
  listeners.add(listener);
  syncWithAuth();
  return () => { listeners.delete(listener); };
}

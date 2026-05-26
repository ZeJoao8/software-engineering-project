import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  where,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Review } from "../domain/entities/Review";

export async function save(review: Review): Promise<void> {
  await setDoc(doc(db, "reviews", review.id), review);
}

export async function fetchByReviewee(userId: string): Promise<Review[]> {
  const snapshot = await getDocs(
    query(collection(db, "reviews"), where("revieweeId", "==", userId))
  );
  return snapshot.docs.map(d => d.data() as Review);
}

export function subscribeForUser(
  userId: string,
  onAsReviewer: (reviews: Review[]) => void,
  onAsReviewee: (reviews: Review[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const unsubA = onSnapshot(
    query(collection(db, "reviews"), where("reviewerId", "==", userId)),
    snapshot => onAsReviewer(snapshot.docs.map(d => d.data() as Review)),
    onError
  );
  const unsubB = onSnapshot(
    query(collection(db, "reviews"), where("revieweeId", "==", userId)),
    snapshot => onAsReviewee(snapshot.docs.map(d => d.data() as Review)),
    onError
  );
  return () => { unsubA(); unsubB(); };
}

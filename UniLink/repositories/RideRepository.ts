import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Ride } from "../domain/entities/Ride";

export async function save(ride: Ride): Promise<void> {
  await setDoc(doc(db, "rides", ride.id), ride);
}

export async function remove(id: string): Promise<void> {
  await deleteDoc(doc(db, "rides", id));
}

export function subscribeAll(
  onUpdate: (rides: Ride[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "rides"),
    snapshot => onUpdate(snapshot.docs.map(d => d.data() as Ride)),
    onError
  );
}

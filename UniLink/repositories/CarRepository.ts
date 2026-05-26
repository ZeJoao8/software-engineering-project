import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  where,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Car } from "../domain/entities/Car";

export async function save(car: Car): Promise<void> {
  await setDoc(doc(db, "cars", car.id), car);
}

export async function remove(id: string): Promise<void> {
  await deleteDoc(doc(db, "cars", id));
}

export async function getById(id: string): Promise<Car | null> {
  const snapshot = await getDoc(doc(db, "cars", id));
  if (!snapshot.exists()) return null;
  return snapshot.data() as Car;
}

export function subscribeByOwner(
  ownerId: string,
  onUpdate: (cars: Car[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, "cars"), where("ownerId", "==", ownerId)),
    snapshot => onUpdate(snapshot.docs.map(d => d.data() as Car)),
    onError
  );
}

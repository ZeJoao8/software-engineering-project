import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Friendship } from "../domain/entities/Friendship";

export async function save(friendship: Omit<Friendship, "id"> & { id: string }): Promise<void> {
  await setDoc(doc(db, "friendships", friendship.id), {
    senderId: friendship.senderId,
    receiverId: friendship.receiverId,
    status: friendship.status,
    createdAt: friendship.createdAt,
  });
}

export async function updateStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, "friendships", id), { status });
}

export async function remove(id: string): Promise<void> {
  await deleteDoc(doc(db, "friendships", id));
}

export function subscribeForUser(
  userId: string,
  onUpdate: (asSender: Friendship[], asReceiver: Friendship[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  let asSender: Friendship[] = [];
  let asReceiver: Friendship[] = [];

  const unsubA = onSnapshot(
    query(collection(db, "friendships"), where("senderId", "==", userId)),
    snap => {
      asSender = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
      onUpdate(asSender, asReceiver);
    },
    err => onError(err)
  );

  const unsubB = onSnapshot(
    query(collection(db, "friendships"), where("receiverId", "==", userId)),
    snap => {
      asReceiver = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
      onUpdate(asSender, asReceiver);
    },
    err => onError(err)
  );

  return () => { unsubA(); unsubB(); };
}

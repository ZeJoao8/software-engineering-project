import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  where,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Message } from "../domain/entities/Message";

export async function send(message: Message): Promise<void> {
  await setDoc(doc(db, "chat_messages", message.id), message);
}

export function subscribeByRide(
  rideId: string,
  onMessages: (messages: Message[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "chat_messages"),
    where("rideId", "==", rideId)
  );
  return onSnapshot(
    q,
    snapshot => {
      const msgs = snapshot.docs.map(d => d.data() as Message);
      msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onMessages(msgs);
    },
    onError
  );
}

export async function deleteByRide(rideId: string): Promise<void> {
  const q = query(
    collection(db, "chat_messages"),
    where("rideId", "==", rideId)
  );
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
}

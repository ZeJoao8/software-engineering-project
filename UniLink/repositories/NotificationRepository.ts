import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Notification } from "../domain/entities/Notification";

export function subscribeUnreadByUser(
  userId: string,
  onNotifications: (notifications: Notification[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );

  return onSnapshot(
    q,
    snapshot => {
      const next = snapshot.docs.map(d => d.data() as Notification);
      next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onNotifications(next);
    },
    onError
  );
}

export async function save(notification: Notification): Promise<void> {
  await setDoc(doc(db, "notifications", notification.id), notification);
}

export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

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

import { db, generateId } from "../lib/firebase";
import { type Notification, type NotificationType } from "../types/Notification";
import {
  getCurrentUser,
  isAuthReady,
  subscribeToAuthChanges,
} from "./user";

let notifications: Notification[] = [];
const listeners = new Set<() => void>();
let unsubscribeSnapshot: Unsubscribe | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsubscribeSnapshot?.();
  unsubscribeSnapshot = null;
}

function syncWithAuth() {
  if (!isAuthReady()) return;

  const user = getCurrentUser();
  if (!user) {
    stopSync();
    notifications = [];
    notifyListeners();
    return;
  }

  if (unsubscribeSnapshot) return;

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", user.uid),
    where("read", "==", false)
  );

  unsubscribeSnapshot = onSnapshot(
    q,
    snapshot => {
      notifications = snapshot.docs.map(d => d.data() as Notification);
      notifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      notifyListeners();
    },
    error => {
      stopSync();
      console.error("Notifications sync failed", error);
    }
  );
}

subscribeToAuthChanges(syncWithAuth);
syncWithAuth();

export function getNotifications() {
  return notifications;
}

export function subscribeToNotificationsChanges(listener: () => void) {
  listeners.add(listener);
  syncWithAuth();
  return () => { listeners.delete(listener); };
}

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  rideId: string;
  route: string;
}) {
  const notification: Notification = {
    ...params,
    id: generateId("notifications"),
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "notifications", notification.id), notification);
  } catch (error) {
    console.error("Failed to create notification", error);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  notifications = notifications.filter(n => n.id !== notificationId);
  notifyListeners();

  try {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  } catch (error) {
    console.error("Failed to mark notification as read", error);
  }
}

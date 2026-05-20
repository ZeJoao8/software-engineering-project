import {
  type Unsubscribe,
} from "firebase/firestore";

import * as NotificationRepo from "../repositories/NotificationRepository";
import type { Notification } from "../domain/entities/Notification";
import {
  getCurrentUser,
  isAuthReady,
  subscribeToAuthChanges,
} from "./authStore";

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

  unsubscribeSnapshot = NotificationRepo.subscribeUnreadByUser(
    user.uid,
    next => {
      notifications = next;
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

export function removeNotificationLocally(notificationId: string): void {
  notifications = notifications.filter(n => n.id !== notificationId);
  notifyListeners();
}

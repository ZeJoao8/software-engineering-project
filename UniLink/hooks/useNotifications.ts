import { useEffect, useState } from "react";

import {
  getNotifications,
  subscribeToNotificationsChanges,
} from "../store/notifications";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/NotificationService";
import type { Notification } from "../domain/entities/Notification";

export function useNotifications(): {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (ids: string[]) => Promise<void>;
} {
  const [notifications, setNotifications] = useState<Notification[]>(
    getNotifications
  );

  useEffect(() => {
    return subscribeToNotificationsChanges(() => {
      setNotifications([...getNotifications()]);
    });
  }, []);

  return {
    notifications,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
  };
}

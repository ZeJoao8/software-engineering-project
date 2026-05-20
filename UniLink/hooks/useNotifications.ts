import { useEffect, useState } from "react";

import {
  getNotifications,
  subscribeToNotificationsChanges,
} from "../store/notifications";
import type { Notification } from "../domain/entities/Notification";

export function useNotifications(): Notification[] {
  const [notifications, setNotifications] = useState<Notification[]>(
    getNotifications
  );

  useEffect(() => {
    return subscribeToNotificationsChanges(() => {
      setNotifications([...getNotifications()]);
    });
  }, []);

  return notifications;
}

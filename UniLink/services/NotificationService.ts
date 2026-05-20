import * as NotificationRepo from "../repositories/NotificationRepository";
import { removeNotificationLocally } from "../store/notifications";
import { generateId } from "../infra/firebase";
import type {
  Notification,
  NotificationType,
} from "../domain/entities/Notification";

type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  rideId: string;
};

function buildNotification(
  params: CreateNotificationParams
): Notification {
  return {
    ...params,
    id: generateId("notifications"),
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  try {
    await NotificationRepo.save(buildNotification(params));
  } catch (error) {
    console.error("Failed to create notification", error);
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  removeNotificationLocally(notificationId);

  try {
    await NotificationRepo.markAsRead(notificationId);
  } catch (error) {
    console.error("Failed to mark notification as read", error);
  }
}

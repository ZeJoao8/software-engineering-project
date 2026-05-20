import type { Notification } from "../domain/entities/Notification";

export function getNotificationRoute(notification: Notification): string {
  switch (notification.type) {
    case "chat_message":
      return `/chat/${notification.rideId}`;
    case "ride_cancelled":
    case "passenger_removed":
      return "/(tabs)/myRides";
    case "ride_join":
    case "ride_cancel":
    case "ride_completed":
      return `/ride/${notification.rideId}`;
  }
}

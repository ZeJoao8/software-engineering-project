export type NotificationType =
  | "ride_join"
  | "ride_cancel"
  | "passenger_removed"
  | "ride_completed"
  | "ride_cancelled"
  | "chat_message";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  rideId: string;
  read: boolean;
  createdAt: string;
}

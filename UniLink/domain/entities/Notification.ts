export type NotificationType =
  | "ride_join"
  | "ride_cancel"
  | "passenger_removed"
  | "ride_completed"
  | "ride_cancelled"
  | "chat_message"
  | "friend_request"
  | "friend_accepted"
  | "passenger_review";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  rideId?: string;
  friendshipId?: string;
  read: boolean;
  createdAt: string;
}

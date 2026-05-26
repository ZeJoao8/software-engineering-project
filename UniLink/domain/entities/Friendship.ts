export type FriendshipStatus = "pending" | "accepted";

export type Friendship = {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
};

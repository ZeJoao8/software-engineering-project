import * as FriendshipRepo from "../repositories/FriendshipRepository";
import { getCurrentUser } from "../store/authStore";
import { getFriendshipWith } from "../store/friends";
import type { Friendship } from "../domain/entities/Friendship";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function sendFriendRequest(targetUid: string): Promise<Result> {
  const me = getCurrentUser();
  if (!me) return { ok: false, error: "Not authenticated." };

  const id = `${me.uid}_${targetUid}`;
  const friendship: Friendship = {
    id,
    senderId: me.uid,
    receiverId: targetUid,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    await FriendshipRepo.save(friendship);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send friend request." };
  }
}

export async function acceptFriendRequest(friendshipId: string): Promise<Result> {
  try {
    await FriendshipRepo.updateStatus(friendshipId, "accepted");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not accept friend request." };
  }
}

export async function removeFriend(targetUid: string): Promise<Result> {
  const f = getFriendshipWith(targetUid);
  if (!f) return { ok: false, error: "No friendship found." };

  try {
    await FriendshipRepo.remove(f.id);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not remove friend." };
  }
}

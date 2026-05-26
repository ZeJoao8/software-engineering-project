import * as FriendshipRepo from "../repositories/FriendshipRepository";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./authStore";
import type { Friendship, FriendshipStatus } from "../domain/entities/Friendship";

export type { Friendship, FriendshipStatus };

let friendships: Friendship[] = [];
const listeners = new Set<() => void>();
let unsubSnapshot: (() => void) | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsubSnapshot?.();
  unsubSnapshot = null;
}

function syncWithAuth() {
  if (!isAuthReady()) return;
  const user = getCurrentUser();

  if (!user) {
    stopSync();
    friendships = [];
    notifyListeners();
    return;
  }

  if (unsubSnapshot) return;

  unsubSnapshot = FriendshipRepo.subscribeForUser(
    user.uid,
    (asSender, asReceiver) => {
      const merged = [...asSender];
      const ids = new Set(merged.map(f => f.id));
      asReceiver.forEach(f => { if (!ids.has(f.id)) merged.push(f); });
      friendships = merged;
      notifyListeners();
    },
    err => { stopSync(); console.error("Friends sync failed", err); }
  );
}

subscribeToAuthChanges(syncWithAuth);
syncWithAuth();

export function getFriendships() {
  return friendships;
}

export function getFriendshipWith(targetUid: string): Friendship | null {
  const me = getCurrentUser()?.uid;
  if (!me) return null;
  return friendships.find(
    f =>
      (f.senderId === me && f.receiverId === targetUid) ||
      (f.senderId === targetUid && f.receiverId === me)
  ) ?? null;
}

export function getFriendshipStatus(
  targetUid: string
): "none" | "pending_sent" | "pending_received" | "friends" {
  const me = getCurrentUser()?.uid;
  if (!me) return "none";
  const f = getFriendshipWith(targetUid);
  if (!f) return "none";
  if (f.status === "accepted") return "friends";
  if (f.senderId === me) return "pending_sent";
  return "pending_received";
}

export function getAcceptedFriendIds(): string[] {
  const me = getCurrentUser()?.uid;
  if (!me) return [];
  return friendships
    .filter(f => f.status === "accepted")
    .map(f => (f.senderId === me ? f.receiverId : f.senderId));
}

export function getPendingReceivedRequests(): Friendship[] {
  const me = getCurrentUser()?.uid;
  if (!me) return [];
  return friendships.filter(f => f.receiverId === me && f.status === "pending");
}

export function subscribeToFriendshipsChanges(listener: () => void) {
  listeners.add(listener);
  syncWithAuth();
  return () => { listeners.delete(listener); };
}

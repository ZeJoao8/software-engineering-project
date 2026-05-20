import { Alert } from "react-native";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./user";

export type FriendshipStatus = "pending" | "accepted";

export type Friendship = {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
};

let friendships: Friendship[] = [];
const listeners = new Set<() => void>();
let unsubSnapshot: Unsubscribe | null = null;

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

  let asSender: Friendship[] = [];
  let asReceiver: Friendship[] = [];

  function merge() {
    const merged = [...asSender];
    const ids = new Set(merged.map(f => f.id));
    asReceiver.forEach(f => { if (!ids.has(f.id)) merged.push(f); });
    friendships = merged;
    notifyListeners();
  }

  const qSender = query(collection(db, "friendships"), where("senderId", "==", user.uid));
  const qReceiver = query(collection(db, "friendships"), where("receiverId", "==", user.uid));

  const unsubA = onSnapshot(qSender, snap => {
    asSender = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
    merge();
  }, err => { stopSync(); console.error("Friends sync (sender) failed", err); });

  const unsubB = onSnapshot(qReceiver, snap => {
    asReceiver = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
    merge();
  }, err => { stopSync(); console.error("Friends sync (receiver) failed", err); });

  unsubSnapshot = () => { unsubA(); unsubB(); };
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

export async function sendFriendRequest(targetUid: string) {
  const me = getCurrentUser();
  if (!me) return;

  const id = `${me.uid}_${targetUid}`;
  const friendship: Friendship = {
    id,
    senderId: me.uid,
    receiverId: targetUid,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const prev = [...friendships];
  friendships = [friendship, ...friendships.filter(f => f.id !== id)];
  notifyListeners();

  try {
    await setDoc(doc(db, "friendships", id), {
      senderId: me.uid,
      receiverId: targetUid,
      status: "pending",
      createdAt: friendship.createdAt,
    });
  } catch (error) {
    friendships = prev;
    notifyListeners();
    Alert.alert("Error", "Could not send friend request.");
    console.error("sendFriendRequest failed", error);
  }
}

export async function acceptFriendRequest(friendshipId: string) {
  const prev = [...friendships];
  friendships = friendships.map(f =>
    f.id === friendshipId ? { ...f, status: "accepted" as FriendshipStatus } : f
  );
  notifyListeners();

  try {
    await updateDoc(doc(db, "friendships", friendshipId), { status: "accepted" });
  } catch (error) {
    friendships = prev;
    notifyListeners();
    Alert.alert("Error", "Could not accept friend request.");
    console.error("acceptFriendRequest failed", error);
  }
}

export async function removeFriend(targetUid: string) {
  const f = getFriendshipWith(targetUid);
  if (!f) return;

  const prev = [...friendships];
  friendships = friendships.filter(fr => fr.id !== f.id);
  notifyListeners();

  try {
    await deleteDoc(doc(db, "friendships", f.id));
  } catch (error) {
    friendships = prev;
    notifyListeners();
    Alert.alert("Error", "Could not remove friend.");
    console.error("removeFriend failed", error);
  }
}

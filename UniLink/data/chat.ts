import { Alert } from "react-native";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { isAuthReady, getCurrentUser } from "./user";
import type { Message } from "../domain/entities/Message";

/**
 * Subscribes to chat messages for a specific ride.
 * Sorts them locally by `createdAt` to avoid needing complex Firestore indexes.
 */
export function subscribeToRideChat(
  rideId: string,
  onMessages: (messages: Message[]) => void
): Unsubscribe | null {
  if (!isAuthReady() || !getCurrentUser()) return null;

  const q = query(
    collection(db, "chat_messages"),
    where("rideId", "==", rideId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs = snapshot.docs.map(
        (document) => document.data() as Message
      );

      msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      onMessages(msgs);
    },
    (error) => {
      console.error("Chat sync failed", error);
    }
  );
}

export async function sendMessage(message: Message) {
  const user = getCurrentUser();
  if (!user || message.senderId !== user.uid) {
    console.error("Security violation: Sender ID mismatch");
    return;
  }

  try {
    await setDoc(doc(db, "chat_messages", message.id), message);
  } catch (error) {
    console.error("Failed to send message", error);
    Alert.alert("Error", "Could not send the message.");
  }
}

export async function deleteMessagesForRide(rideId: string) {
  try {
    const q = query(
      collection(db, "chat_messages"),
      where("rideId", "==", rideId)
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((document) =>
      deleteDoc(document.ref)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Failed to delete messages for ride", error);
  }
}

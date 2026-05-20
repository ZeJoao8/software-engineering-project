import type { Unsubscribe } from "firebase/firestore";

import * as MessageRepo from "../repositories/MessageRepository";
import type { Message } from "../domain/entities/Message";

let activeRideId: string | null = null;
let messages: Message[] = [];
const listeners = new Set<() => void>();
let unsub: Unsubscribe | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsub?.();
  unsub = null;
  activeRideId = null;
  messages = [];
}

export function syncMessagesForRide(rideId: string): void {
  if (activeRideId === rideId && unsub) return;

  stopSync();
  activeRideId = rideId;
  unsub = MessageRepo.subscribeByRide(
    rideId,
    msgs => { messages = msgs; notifyListeners(); },
    err => { console.error("Messages sync failed", err); }
  );
}

export function stopMessagesSync(): void {
  stopSync();
  notifyListeners();
}

export function getMessages(): Message[] {
  return messages;
}

export function subscribeToMessageChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

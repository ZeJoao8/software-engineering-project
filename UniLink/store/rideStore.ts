import type { Unsubscribe } from "firebase/firestore";

import * as RideRepo from "../repositories/RideRepository";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./authStore";
import type { Ride } from "../domain/entities/Ride";

let rides: Ride[] = [];
const listeners = new Set<() => void>();
let unsubRides: Unsubscribe | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsubRides?.();
  unsubRides = null;
}

function syncWithAuth() {
  if (!isAuthReady()) return;

  if (!getCurrentUser()) {
    stopSync();
    rides = [];
    notifyListeners();
    return;
  }

  if (unsubRides) return;

  unsubRides = RideRepo.subscribeAll(
    newRides => { rides = newRides; notifyListeners(); },
    error => { stopSync(); console.error("Rides sync failed", error); }
  );
}

subscribeToAuthChanges(syncWithAuth);
syncWithAuth();

export function getRides(): Ride[] {
  return rides;
}

export function subscribeToRidesChanges(listener: () => void): () => void {
  listeners.add(listener);
  syncWithAuth();
  return () => { listeners.delete(listener); };
}

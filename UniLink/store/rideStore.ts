import type { Unsubscribe } from "firebase/firestore";

import * as RideRepo from "../repositories/RideRepository";
import * as MessageRepo from "../repositories/MessageRepository";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./authStore";
import { shouldAutoDeleteRide } from "../domain/rules/rideRules";
import type { Ride } from "../domain/entities/Ride";

let rides: Ride[] = [];
const listeners = new Set<() => void>();
let unsubRides: Unsubscribe | null = null;
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function cleanupEmptyPastRides() {
  const user = getCurrentUser();
  if (!user) return;
  const now = new Date();
  rides
    .filter(r => r.driverId === user.uid && shouldAutoDeleteRide(r, now))
    .forEach(r => {
      void MessageRepo.deleteByRide(r.id).then(() => RideRepo.remove(r.id));
    });
}

function stopSync() {
  unsubRides?.();
  unsubRides = null;
  if (cleanupInterval) { clearInterval(cleanupInterval); cleanupInterval = null; }
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
    newRides => { rides = newRides; notifyListeners(); cleanupEmptyPastRides(); },
    error => { stopSync(); console.error("Rides sync failed", error); }
  );

  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupEmptyPastRides, 10_000);
  }
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

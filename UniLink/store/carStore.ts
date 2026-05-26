import type { Unsubscribe } from "firebase/firestore";

import * as CarRepo from "../repositories/CarRepository";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./authStore";
import type { Car } from "../domain/entities/Car";

let cars: Car[] = [];
const listeners = new Set<() => void>();
let unsubCars: Unsubscribe | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsubCars?.();
  unsubCars = null;
}

function syncWithAuth() {
  if (!isAuthReady()) return;

  if (!getCurrentUser()) {
    stopSync();
    cars = [];
    notifyListeners();
    return;
  }

  if (unsubCars) return;

  const user = getCurrentUser()!;

  unsubCars = CarRepo.subscribeByOwner(
    user.uid,
    newCars => { cars = newCars; notifyListeners(); },
    error => { stopSync(); console.error("Cars sync failed", error); }
  );
}

subscribeToAuthChanges(syncWithAuth);
syncWithAuth();

export function getCars(): Car[] {
  return cars;
}

export function getUserCars(userId: string): Car[] {
  return cars.filter(c => c.ownerId === userId);
}

export function subscribeToCarsChanges(listener: () => void): () => void {
  listeners.add(listener);
  syncWithAuth();
  return () => { listeners.delete(listener); };
}

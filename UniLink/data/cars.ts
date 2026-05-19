import { Alert } from "react-native";

import {
 collection,
 deleteDoc,
 doc,
 getDoc,
 onSnapshot,
 query,
 type Unsubscribe,
 setDoc,
 where,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type { Car } from "../domain/entities/Car";
import {
 getCurrentUser,
 isAuthReady,
 subscribeToAuthChanges,
} from "./user";

let cars: Car[] = [];

const listeners = new Set<() => void>();
let unsubscribeCarsSnapshot:
 | Unsubscribe
 | null = null;

function notifyListeners() {
 listeners.forEach(listener => listener());
}

function stopCarsSync() {
 unsubscribeCarsSnapshot?.();
 unsubscribeCarsSnapshot = null;
}

function syncCarsWithAuth() {
 if (!isAuthReady()) {
  return;
 }

 if (!getCurrentUser()) {
  stopCarsSync();
  cars = [];
  notifyListeners();
  return;
 }

 if (unsubscribeCarsSnapshot) {
  return;
 }

 const user = getCurrentUser()!;

 unsubscribeCarsSnapshot = onSnapshot(
  query(
   collection(db, "cars"),
   where("ownerId", "==", user.uid)
  ),
  snapshot => {
   cars = snapshot.docs.map(document =>
    document.data() as Car
   );
   notifyListeners();
  },
  error => {
   stopCarsSync();
   console.error("Cars sync failed", error);
  }
 );
}

subscribeToAuthChanges(syncCarsWithAuth);
syncCarsWithAuth();

export function getCars() {
 return cars;
}

export function getUserCars(userId: string) {
 return cars.filter(car => car.ownerId === userId);
}

/**
 * Fetches a single car by ID directly from Firestore.
 * Used to look up another driver's car (e.g. in ride details)
 * without downloading the entire cars collection.
 */
export async function fetchCarById(carId: string): Promise<Car | null> {
 const snapshot = await getDoc(doc(db, "cars", carId));
 if (!snapshot.exists()) return null;
 return snapshot.data() as Car;
}

export function subscribeToCarsChanges(
 listener: () => void
) {
 listeners.add(listener);
 syncCarsWithAuth();

 return () => {
  listeners.delete(listener);
 };
}

export async function addCar(car: Car) {
 const previousCars = cars;
 cars = [...cars, car];
 notifyListeners();

 try {
  await setDoc(doc(db, "cars", car.id), car);
 } catch (error) {
  cars = previousCars;
  notifyListeners();
  console.error("Add car failed", error);
  Alert.alert(
   "Car save failed",
   "Could not save the car in Firestore."
  );
 }
}

export async function deleteCar(id: string) {
 const previousCars = cars;
 cars = cars.filter(
  car => car.id !== id
 );
 notifyListeners();

 try {
  await deleteDoc(doc(db, "cars", id));
 } catch (error) {
  cars = previousCars;
  notifyListeners();
  console.error("Delete car failed", error);
  Alert.alert(
   "Car delete failed",
   "Could not remove the car from Firestore."
  );
 }
}

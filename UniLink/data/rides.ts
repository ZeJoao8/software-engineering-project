import { Alert } from "react-native";

import {
 collection,
 deleteDoc,
 doc,
 onSnapshot,
 type Unsubscribe,
 setDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { Ride } from "../types/Ride";
import {
 getCurrentUser,
 isAuthReady,
 subscribeToAuthChanges,
} from "./user";
import { deleteMessagesForRide } from "./chat";

let rides: Ride[] = [];

const listeners = new Set<() => void>();
let unsubscribeRidesSnapshot:
 | Unsubscribe
 | null = null;

function notifyListeners() {
 listeners.forEach(listener => listener());
}

function stopRidesSync() {
 unsubscribeRidesSnapshot?.();
 unsubscribeRidesSnapshot = null;
}

function syncRidesWithAuth() {
 if (!isAuthReady()) {
  return;
 }

 if (!getCurrentUser()) {
  stopRidesSync();
  rides = [];
  notifyListeners();
  return;
 }

 if (unsubscribeRidesSnapshot) {
  return;
 }

 unsubscribeRidesSnapshot = onSnapshot(
  collection(db, "rides"),
  snapshot => {
   rides = snapshot.docs.map(document =>
    document.data() as Ride
   );
   notifyListeners();
  },
  error => {
   stopRidesSync();
   console.error("Rides sync failed", error);
  }
 );
}

subscribeToAuthChanges(syncRidesWithAuth);
syncRidesWithAuth();

export function getRides() {
 return rides;
}

export function subscribeToRidesChanges(
 listener: () => void
) {
 listeners.add(listener);
 syncRidesWithAuth();

 return () => {
  listeners.delete(listener);
 };
}

export async function addRide(ride: Ride) {
 const previousRides = rides;
 rides = [...rides, ride];
 notifyListeners();

 try {
  await setDoc(doc(db, "rides", ride.id), ride);
 } catch (error) {
  rides = previousRides;
  notifyListeners();
  console.error("Add ride failed", error);
  Alert.alert(
   "Ride save failed",
   "Could not save the ride in Firestore."
  );
 }
}

export async function updateRide(updatedRide: Ride) {
 const previousRides = rides;
 rides = rides.map(ride =>
  ride.id === updatedRide.id
   ? updatedRide
   : ride
 );
 notifyListeners();

 try {
  await setDoc(
   doc(db, "rides", updatedRide.id),
   updatedRide
  );
 } catch (error) {
  rides = previousRides;
  notifyListeners();
  console.error("Update ride failed", error);
  Alert.alert(
   "Ride update failed",
   "Could not update the ride in Firestore."
  );
 }
}

export async function deleteRide(id: string) {
 const previousRides = rides;
 rides = rides.filter(
  ride => ride.id !== id
 );
 notifyListeners();

 try {
  await deleteMessagesForRide(id);
  await deleteDoc(doc(db, "rides", id));
 } catch (error) {
  rides = previousRides;
  notifyListeners();
  console.error("Delete ride failed", error);
  Alert.alert(
   "Ride delete failed",
   "Could not remove the ride from Firestore."
  );
 }
}

export function removeEmptyPastRides(now = new Date()) {

 const rides = getRides();
 const user = getCurrentUser();
 if (!user) return;

 rides.forEach(ride => {

  const rideDate =
   new Date(ride.departureDateTime);

  const isPast =
   rideDate < now;

  const hasNoPassengers =
   ride.passengers.length === 0;

  const isDriver =
   ride.driverId === user.uid ||
   ride.driverId === user.email;

  if (
   isPast &&
   hasNoPassengers &&
   isDriver
  ){

   deleteRide(ride.id);

  }

 });

}
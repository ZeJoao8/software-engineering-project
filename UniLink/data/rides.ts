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
import { createNotification } from "./notifications";

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
 const oldRide = rides.find(r => r.id === updatedRide.id);

 rides = rides.map(ride =>
  ride.id === updatedRide.id
   ? updatedRide
   : ride
 );
 notifyListeners();

 if (oldRide) {
  const currentUser = getCurrentUser();
  const oldPassengerSet = new Set(oldRide.passengers);
  const newPassengerSet = new Set(updatedRide.passengers);

  for (const pid of updatedRide.passengers) {
   if (!oldPassengerSet.has(pid)) {
    void createNotification({
     userId: updatedRide.driverId,
     type: "ride_join",
     title: "Novo passageiro",
     body: `Alguém reservou um lugar: ${updatedRide.origin} → ${updatedRide.destination}`,
     rideId: updatedRide.id,
     route: `/ride/${updatedRide.id}`,
    });
   }
  }

  for (const pid of oldRide.passengers) {
   if (!newPassengerSet.has(pid)) {
    if (currentUser?.uid === pid) {
     void createNotification({
      userId: updatedRide.driverId,
      type: "ride_cancel",
      title: "Passageiro cancelou",
      body: `Um passageiro cancelou a reserva: ${updatedRide.origin} → ${updatedRide.destination}`,
      rideId: updatedRide.id,
      route: `/ride/${updatedRide.id}`,
     });
    } else if (currentUser?.uid === updatedRide.driverId) {
     void createNotification({
      userId: pid,
      type: "passenger_removed",
      title: "Foste removido",
      body: `O condutor removeu-te da viagem: ${updatedRide.origin} → ${updatedRide.destination}`,
      rideId: updatedRide.id,
      route: "/(tabs)/myRides",
     });
    }
   }
  }

  if (!oldRide.completed && updatedRide.completed) {
   for (const pid of updatedRide.passengers) {
    void createNotification({
     userId: pid,
     type: "ride_completed",
     title: "Viagem concluída",
     body: `A tua viagem ${updatedRide.origin} → ${updatedRide.destination} foi concluída`,
     rideId: updatedRide.id,
     route: `/ride/${updatedRide.id}`,
    });
   }
  }
 }

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
 const rideToDelete = rides.find(r => r.id === id);
 const currentUser = getCurrentUser();

 rides = rides.filter(ride => ride.id !== id);
 notifyListeners();

 if (rideToDelete && currentUser?.uid === rideToDelete.driverId) {
  for (const pid of rideToDelete.passengers) {
   void createNotification({
    userId: pid,
    type: "ride_cancelled",
    title: "Viagem cancelada",
    body: `O condutor cancelou a viagem: ${rideToDelete.origin} → ${rideToDelete.destination}`,
    rideId: id,
    route: "/(tabs)/myRides",
   });
  }
 }

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

  const isDriver = ride.driverId === user.uid;

  if (
   isPast &&
   hasNoPassengers &&
   isDriver
  ){

   deleteRide(ride.id);

  }

 });

}
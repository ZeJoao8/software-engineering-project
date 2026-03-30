import { Ride } from "../types/Ride";

let rides: Ride[] = [];

export function getRides() {
  return rides;
}

export function addRide(ride: Ride) {
  rides = [...rides, ride];
}

export function updateRide(updatedRide: Ride) {
  rides = rides.map(r =>
    r.id === updatedRide.id ? updatedRide : r
  );
}

export function deleteRide(id:string){
 rides = rides.filter(
  r => r.id !== id
 );
}

export function removeEmptyPastRides(){
 const now = new Date();
 rides = rides.filter(r => {
  const rideDate =
   new Date(r.departureDateTime);
  const isPast =
   rideDate <= now;
  const hasPassengers =
   r.passengers.length > 0;
  const isCompleted =
   r.completed;
  if(
   isPast &&
   !hasPassengers &&
   !isCompleted
  ){
   return false;
  }
  return true;
 });
}
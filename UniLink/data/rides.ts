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
import { Ride } from "../types/Ride";

let rides: Ride[] = [
  {
    id: "1",
    driverId: "joao@feup.pt",
    carId: "1",
    origin: "FEUP",
    destination: "Braga",
    originCoords: { latitude: 41.1780, longitude: -8.5980 },
    destinationCoords: { latitude: 41.5614, longitude: -8.3973 },
    departureDateTime: new Date(Date.now() + 3600000).toISOString(),
    availableSeats: 3,
    totalSeats: 4,
    womenOnly: false,
    passengers: [],
    completed: false
  },
  {
    id: "2",
    driverId: "maria@feup.pt",
    carId: "2",
    origin: "Porto",
    destination: "Lisboa",
    originCoords: { latitude: 41.1579, longitude: -8.6291 },
    destinationCoords: { latitude: 38.7223, longitude: -9.1393 },
    departureDateTime: new Date(Date.now() + 7200000).toISOString(),
    availableSeats: 2,
    totalSeats: 3,
    womenOnly: true,
    passengers: [],
    completed: false
  }
];

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
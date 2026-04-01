export interface Ride {

  id: string;

  driverId: string;

  carId: string;

  origin: string;

  destination: string;

  originCoords?: {
    latitude: number;
    longitude: number;
  };

  destinationCoords?: {
    latitude: number;
    longitude: number;
  };

  departureDateTime: string;

  availableSeats: number;

  totalSeats: number;

  womenOnly: boolean;

  passengers: string[];

  completed: boolean;

}
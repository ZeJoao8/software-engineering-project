export interface Ride {

  id: string;

  driverId: string;

  carId: string;

  origin: string;

  destination: string;

  departureDateTime: string;

  availableSeats: number;

  totalSeats: number;

  womenOnly: boolean;

  friendsOnly: boolean;

  passengers: string[];

  completed: boolean;

  originCoords?: { latitude: number; longitude: number };

  destinationCoords?: { latitude: number; longitude: number };
  distanceKm?: number;

  passengerCodes?: Record<string, string>;
  verifiedPassengers?: string[];
}

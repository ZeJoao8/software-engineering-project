export interface Ride {

  id: string;

  driverId: string;

  carId: string;

  origin: string;

  destination: string;

  departureDateTime: string;

  availableSeats: number;

  womenOnly: boolean;

  passengers: string[];

}
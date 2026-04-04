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

  passengers: string[];

  completed: boolean;

}
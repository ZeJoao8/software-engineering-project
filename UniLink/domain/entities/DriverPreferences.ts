export interface DriverPreferences {
  noSmoking: boolean;
  acceptLuggage: boolean;
  acceptPets: boolean;
  passengerMusic: boolean;
}

export const DEFAULT_DRIVER_PREFERENCES: DriverPreferences = {
  noSmoking: true,
  acceptLuggage: true,
  acceptPets: false,
  passengerMusic: false,
};
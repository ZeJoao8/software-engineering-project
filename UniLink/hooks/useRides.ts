import { useEffect, useState } from "react";
import { getRides, subscribeToRidesChanges } from "../store/rideStore";
import type { Ride } from "../domain/entities/Ride";

export function useRides() {
  const [rides, setRides] = useState<Ride[]>(getRides);

  useEffect(() => {
    return subscribeToRidesChanges(() => setRides(getRides()));
  }, []);

  return rides;
}
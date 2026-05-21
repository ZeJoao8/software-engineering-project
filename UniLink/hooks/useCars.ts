import { useEffect, useState } from "react";
import { getCars, getUserCars, subscribeToCarsChanges } from "../store/carStore";
import type { Car } from "../domain/entities/Car";

export function useCars() {
  const [cars, setCars] = useState<Car[]>(getCars);

  useEffect(() => {
    return subscribeToCarsChanges(() => setCars(getCars()));
  }, []);

  return { cars, getUserCars };
}

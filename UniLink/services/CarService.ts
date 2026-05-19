import * as CarRepo from "../repositories/CarRepository";
import * as RideRepo from "../repositories/RideRepository";
import * as MessageRepo from "../repositories/MessageRepository";
import { getCars, getUserCars } from "../store/carStore";
import { getRides } from "../store/rideStore";
import { isValidPlate } from "../domain/rules/validation";
import { generateId } from "../infra/firebase";
import type { Car } from "../domain/entities/Car";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function addCar(
  model: string,
  color: string,
  plate: string,
  seats: string,
  ownerId: string
): Promise<Result<Car>> {
  if (!model.trim() || !color.trim() || !plate.trim() || !seats.trim())
    return { ok: false, error: "Fill all fields." };

  if (model.trim().length > 40)
    return { ok: false, error: "Model max 40 characters." };

  const seatsNumber = Number(seats);
  if (!Number.isInteger(seatsNumber) || seatsNumber < 2 || seatsNumber > 9)
    return { ok: false, error: "Seats must be an integer between 2 and 9." };

  const formattedPlate = plate.toUpperCase().replace(/\s/g, "");
  if (!isValidPlate(formattedPlate))
    return { ok: false, error: "Invalid plate format." };

  const duplicate = getUserCars(ownerId).some(c => c.licensePlate === formattedPlate);
  if (duplicate)
    return { ok: false, error: "A car with this plate already exists." };

  const car: Car = {
    id: generateId("cars"),
    model: model.trim(),
    color: color.trim(),
    licensePlate: formattedPlate,
    seatCapacity: seatsNumber,
    ownerId,
  };

  try {
    await CarRepo.save(car);
    return { ok: true, data: car };
  } catch {
    return { ok: false, error: "Could not save the car. Please try again." };
  }
}

export async function removeCarCascade(
  carId: string
): Promise<Result<{ cancelledRides: number }>> {
  const now = new Date();
  const affectedRides = getRides().filter(
    r => r.carId === carId && !r.completed && new Date(r.departureDateTime) > now
  );

  try {
    await Promise.all(
      affectedRides.map(r =>
        MessageRepo.deleteByRide(r.id).then(() => RideRepo.remove(r.id))
      )
    );
    await CarRepo.remove(carId);
    return { ok: true, data: { cancelledRides: affectedRides.length } };
  } catch {
    return { ok: false, error: "Could not remove the car. Please try again." };
  }
}

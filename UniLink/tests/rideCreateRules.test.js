import { canCreateRide } from "../domain/rules/rideCreateRules";

function makeCar(overrides = {}) {
  return {
    id: "car-1",
    model: "Clio",
    color: "Blue",
    licensePlate: "AA-00-AA",
    seatCapacity: 5,
    ownerId: "driver-1",
    ...overrides,
  };
}

describe("canCreateRide", () => {
  const futureDeparture = new Date(Date.now() + 60 * 60 * 1000);
  const coords = { latitude: 41.15, longitude: -8.61 };

  test("returns normalized seat count when input is valid", () => {
    expect(canCreateRide({
      origin: "Porto",
      destination: "Braga",
      originCoords: coords,
      destinationCoords: coords,
      seats: "3",
      car: makeCar(),
      departure: futureDeparture,
    })).toEqual({ ok: true, seats: 3 });
  });

  test("reuses shared seat validation for non-integer values", () => {
    expect(canCreateRide({
      origin: "Porto",
      destination: "Braga",
      originCoords: coords,
      destinationCoords: coords,
      seats: "1.5",
      car: makeCar(),
      departure: futureDeparture,
    })).toEqual({ ok: false, error: "Seats must be an integer" });
  });

  test("requires seats to be filled", () => {
    expect(canCreateRide({
      origin: "Porto",
      destination: "Braga",
      originCoords: coords,
      destinationCoords: coords,
      seats: " ",
      car: makeCar(),
      departure: futureDeparture,
    })).toEqual({ ok: false, error: "Fill all fields" });
  });
});

import { canCreateRide } from "../../domain/rules/rideCreateRules";

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

const coords = { latitude: 41.15, longitude: -8.61 };
const otherCoords = { latitude: 38.72, longitude: -9.14 };
const futureDeparture = new Date(Date.now() + 60 * 60 * 1000);
const pastDeparture = new Date(Date.now() - 60 * 60 * 1000);

const validInput = {
  origin: "Porto",
  destination: "Braga",
  originCoords: coords,
  destinationCoords: otherCoords,
  seats: "3",
  car: makeCar(),
  departure: futureDeparture,
};

describe("canCreateRide", () => {
  test("returns normalized seat count when input is valid", () => {
    expect(canCreateRide(validInput)).toEqual({ ok: true, seats: 3 });
  });

  test("fails when origin is empty", () => {
    expect(canCreateRide({ ...validInput, origin: "" })).toEqual({ ok: false, error: "Fill all fields" });
  });

  test("fails when destination is empty", () => {
    expect(canCreateRide({ ...validInput, destination: "  " })).toEqual({ ok: false, error: "Fill all fields" });
  });

  test("fails when seats field is blank", () => {
    expect(canCreateRide({ ...validInput, seats: " " })).toEqual({ ok: false, error: "Fill all fields" });
  });

  test("fails when originCoords is null", () => {
    const result = canCreateRide({ ...validInput, originCoords: null });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/location/i);
  });

  test("fails when destinationCoords is null", () => {
    const result = canCreateRide({ ...validInput, destinationCoords: null });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/location/i);
  });

  test("fails when origin and destination are the same (case-insensitive)", () => {
    const result = canCreateRide({ ...validInput, origin: "porto", destination: "Porto" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/differ/i);
  });

  test("fails when seats is not an integer", () => {
    expect(canCreateRide({ ...validInput, seats: "1.5" })).toEqual({ ok: false, error: "Seats must be an integer" });
  });

  test("fails when seats exceed car capacity minus 1", () => {
    // car has seatCapacity 5, so max seats = 4
    const result = canCreateRide({ ...validInput, seats: "5", car: makeCar({ seatCapacity: 5 }) });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/max/i);
  });

  test("fails when departure is in the past", () => {
    const result = canCreateRide({ ...validInput, departure: pastDeparture });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/past/i);
  });

  test("allows exactly the car capacity minus 1 seat", () => {
    // seatCapacity=5 → max=4
    expect(canCreateRide({ ...validInput, seats: "4", car: makeCar({ seatCapacity: 5 }) })).toEqual({ ok: true, seats: 4 });
  });
});

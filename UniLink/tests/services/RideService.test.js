import {
  createRide,
  reserveSeat,
  cancelSeat,
  cancelRide,
  completeRide,
  removePassenger,
  verifyPassengerCode,
  changeCar,
} from "../../services/RideService";

jest.mock("../../repositories/RideRepository", () => ({ save: jest.fn(), remove: jest.fn() }));
jest.mock("../../repositories/MessageRepository", () => ({ deleteByRide: jest.fn() }));
jest.mock("../../store/rideStore", () => ({ getRides: jest.fn() }));
jest.mock("../../store/authStore", () => ({ getCurrentUser: jest.fn(), getUserById: jest.fn() }));
jest.mock("../../infra/routing", () => ({ getRoute: jest.fn() }));
jest.mock("../../services/NotificationService", () => ({ createNotification: jest.fn() }));

import * as RideRepo from "../../repositories/RideRepository";
import * as MessageRepo from "../../repositories/MessageRepository";
import { getRides } from "../../store/rideStore";
import { getRoute } from "../../infra/routing";

const FUTURE = new Date(Date.now() + 3600 * 1000).toISOString();
const PAST = new Date(Date.now() - 3600 * 1000).toISOString();

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    passengers: [],
    verifiedPassengers: [],
    passengerCodes: {},
    availableSeats: 3,
    totalSeats: 4,
    completed: false,
    departureDateTime: FUTURE,
    womenOnly: false,
    originCoords: null,
    destinationCoords: null,
    distanceKm: null,
    ...overrides,
  };
}

function makeUser(overrides = {}) {
  return { uid: "user-1", gender: "Female", ...overrides };
}

beforeEach(() => {
  jest.clearAllMocks();
  RideRepo.save.mockResolvedValue();
  RideRepo.remove.mockResolvedValue();
  MessageRepo.deleteByRide.mockResolvedValue();
});

// ─── createRide ──────────────────────────────────────────────────────────────

describe("createRide", () => {
  test("saves ride and returns ok", async () => {
    const ride = makeRide();
    expect(await createRide(ride)).toEqual({ ok: true });
    expect(RideRepo.save).toHaveBeenCalledWith(ride);
  });

  test("returns error when repo throws", async () => {
    RideRepo.save.mockRejectedValueOnce(new Error("Firebase down"));
    const result = await createRide(makeRide());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/try again/i);
  });
});

// ─── reserveSeat ─────────────────────────────────────────────────────────────

describe("reserveSeat", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    const result = await reserveSeat("missing-ride", makeUser());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });

  test("returns error when domain rule fails (ride completed)", async () => {
    getRides.mockReturnValue([makeRide({ completed: true })]);
    const result = await reserveSeat("ride-1", makeUser());
    expect(result.ok).toBe(false);
    expect(RideRepo.save).not.toHaveBeenCalled();
  });

  test("decrements availableSeats and appends passenger on success", async () => {
    getRides.mockReturnValue([makeRide({ availableSeats: 3 })]);
    const result = await reserveSeat("ride-1", makeUser({ uid: "user-1" }));
    expect(result.ok).toBe(true);
    expect(result.data.boardingCode).toMatch(/^\d{6}$/);
    const saved = RideRepo.save.mock.calls[0][0];
    expect(saved.availableSeats).toBe(2);
    expect(saved.passengers).toContain("user-1");
    expect(saved.passengerCodes["user-1"]).toMatch(/^\d{6}$/);
  });

  test("returns error when repo throws", async () => {
    getRides.mockReturnValue([makeRide()]);
    RideRepo.save.mockRejectedValueOnce(new Error("fail"));
    const result = await reserveSeat("ride-1", makeUser());
    expect(result.ok).toBe(false);
  });
});

// ─── cancelSeat ──────────────────────────────────────────────────────────────

describe("cancelSeat", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    expect((await cancelSeat("missing-ride", "user-1")).ok).toBe(false);
  });

  test("returns error when domain rule fails (ride started)", async () => {
    getRides.mockReturnValue([makeRide({ departureDateTime: PAST })]);
    const result = await cancelSeat("ride-1", "user-1");
    expect(result.ok).toBe(false);
    expect(RideRepo.save).not.toHaveBeenCalled();
  });

  test("removes passenger and increments seats on success", async () => {
    getRides.mockReturnValue([makeRide({
      passengers: ["user-1"],
      availableSeats: 2,
      totalSeats: 4,
      passengerCodes: { "user-1": "123456" },
    })]);
    const result = await cancelSeat("ride-1", "user-1");
    expect(result.ok).toBe(true);
    const saved = RideRepo.save.mock.calls[0][0];
    expect(saved.passengers).not.toContain("user-1");
    expect(saved.availableSeats).toBe(3);
    expect(saved.passengerCodes["user-1"]).toBeUndefined();
  });
});

// ─── cancelRide ──────────────────────────────────────────────────────────────

describe("cancelRide", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    expect((await cancelRide("missing")).ok).toBe(false);
  });

  test("returns error when ride already started", async () => {
    getRides.mockReturnValue([makeRide({ departureDateTime: PAST })]);
    expect((await cancelRide("ride-1")).ok).toBe(false);
    expect(RideRepo.remove).not.toHaveBeenCalled();
  });

  test("deletes messages then removes ride on success", async () => {
    getRides.mockReturnValue([makeRide()]);
    const result = await cancelRide("ride-1");
    expect(result.ok).toBe(true);
    expect(MessageRepo.deleteByRide).toHaveBeenCalledWith("ride-1");
    expect(RideRepo.remove).toHaveBeenCalledWith("ride-1");
  });
});

// ─── completeRide ─────────────────────────────────────────────────────────────

describe("completeRide", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    expect((await completeRide("missing", "driver-1")).ok).toBe(false);
  });

  test("returns error when domain rule fails (not driver)", async () => {
    getRides.mockReturnValue([makeRide({ passengers: ["p1"], verifiedPassengers: ["p1"] })]);
    expect((await completeRide("ride-1", "other-user")).ok).toBe(false);
    expect(RideRepo.save).not.toHaveBeenCalled();
  });

  test("fetches route when distanceKm is missing", async () => {
    getRoute.mockResolvedValueOnce({ distanceKm: 42 });
    getRides.mockReturnValue([makeRide({
      driverId: "driver-1",
      passengers: ["p1"],
      verifiedPassengers: ["p1"],
      originCoords: { latitude: 41.15, longitude: -8.61 },
      destinationCoords: { latitude: 38.72, longitude: -9.14 },
    })]);
    const result = await completeRide("ride-1", "driver-1");
    expect(result.ok).toBe(true);
    expect(getRoute).toHaveBeenCalled();
    expect(RideRepo.save.mock.calls[0][0].distanceKm).toBe(42);
  });

  test("skips route fetch when distanceKm already set", async () => {
    getRides.mockReturnValue([makeRide({
      driverId: "driver-1",
      passengers: ["p1"],
      verifiedPassengers: ["p1"],
      distanceKm: 10,
    })]);
    await completeRide("ride-1", "driver-1");
    expect(getRoute).not.toHaveBeenCalled();
    expect(RideRepo.save.mock.calls[0][0].completed).toBe(true);
  });
});

// ─── removePassenger ─────────────────────────────────────────────────────────

describe("removePassenger", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    expect((await removePassenger("missing", "p1")).ok).toBe(false);
  });

  test("returns error when ride already started", async () => {
    getRides.mockReturnValue([makeRide({ departureDateTime: PAST })]);
    expect((await removePassenger("ride-1", "p1")).ok).toBe(false);
    expect(RideRepo.save).not.toHaveBeenCalled();
  });

  test("removes passenger and restores seat on success", async () => {
    getRides.mockReturnValue([makeRide({
      passengers: ["p1", "p2"],
      availableSeats: 2,
      totalSeats: 4,
      passengerCodes: { p1: "111111", p2: "222222" },
      verifiedPassengers: ["p1"],
    })]);
    const result = await removePassenger("ride-1", "p1");
    expect(result.ok).toBe(true);
    const saved = RideRepo.save.mock.calls[0][0];
    expect(saved.passengers).not.toContain("p1");
    expect(saved.availableSeats).toBe(3);
    expect(saved.passengerCodes["p1"]).toBeUndefined();
    expect(saved.verifiedPassengers).not.toContain("p1");
  });
});

// ─── verifyPassengerCode ──────────────────────────────────────────────────────

describe("verifyPassengerCode", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    expect((await verifyPassengerCode("missing", "123456")).ok).toBe(false);
  });

  test("returns error when code does not match any passenger", async () => {
    getRides.mockReturnValue([makeRide({ passengerCodes: { p1: "999999" } })]);
    const result = await verifyPassengerCode("ride-1", "000000");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no unverified/i);
  });

  test("returns error when passenger is already verified", async () => {
    getRides.mockReturnValue([makeRide({
      passengerCodes: { p1: "123456" },
      verifiedPassengers: ["p1"],
    })]);
    const result = await verifyPassengerCode("ride-1", "123456");
    expect(result.ok).toBe(false);
  });

  test("adds passenger to verifiedPassengers on correct code", async () => {
    getRides.mockReturnValue([makeRide({
      passengerCodes: { p1: "123456" },
      verifiedPassengers: [],
    })]);
    const result = await verifyPassengerCode("ride-1", "123456");
    expect(result.ok).toBe(true);
    expect(result.data.verifiedPassengerId).toBe("p1");
    const saved = RideRepo.save.mock.calls[0][0];
    expect(saved.verifiedPassengers).toContain("p1");
  });
});

// ─── changeCar ───────────────────────────────────────────────────────────────

describe("changeCar", () => {
  test("returns error when ride is not found", async () => {
    getRides.mockReturnValue([]);
    expect((await changeCar("missing", "car-2", 5)).ok).toBe(false);
  });

  test("returns error when domain rule fails (ride started)", async () => {
    getRides.mockReturnValue([makeRide({ departureDateTime: PAST })]);
    expect((await changeCar("ride-1", "car-2", 5)).ok).toBe(false);
    expect(RideRepo.save).not.toHaveBeenCalled();
  });

  test("returns error when new car is too small for current passengers", async () => {
    getRides.mockReturnValue([makeRide({ passengers: ["p1", "p2", "p3"], totalSeats: 3 })]);
    // newCarSeats=3 → newLimit=min(3, 3-1)=2, passengers.length=3 > 2
    const result = await changeCar("ride-1", "car-2", 3);
    expect(result.ok).toBe(false);
    expect(RideRepo.save).not.toHaveBeenCalled();
  });

  test("updates carId and recalculates seats on success", async () => {
    getRides.mockReturnValue([makeRide({ passengers: ["p1"], totalSeats: 3, availableSeats: 2 })]);
    const result = await changeCar("ride-1", "car-2", 5);
    expect(result.ok).toBe(true);
    const saved = RideRepo.save.mock.calls[0][0];
    expect(saved.carId).toBe("car-2");
    // newLimit = min(3, 5-1) = 3, availableSeats = 3 - 1 = 2
    expect(saved.availableSeats).toBe(2);
  });
});

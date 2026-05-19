import {
  generateBoardingCode,
  canReserveSeat,
  canCancelSeat,
  canCancelRide,
  canCompleteRide,
  canRemovePassenger,
  shouldAutoDeleteRide,
} from "../domain/rules/rideRules";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    carId: "car-1",
    origin: "Porto",
    destination: "Lisboa",
    departureDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h from now
    availableSeats: 3,
    totalSeats: 4,
    womenOnly: false,
    passengers: [],
    completed: false,
    ...overrides,
  };
}

function makeUser(overrides = {}) {
  return {
    uid: "user-1",
    name: "Alice",
    email: "alice@up.pt",
    university: "FEUP",
    course: "LEIC",
    gender: "Female",
    ...overrides,
  };
}

const NOW = new Date("2026-05-19T12:00:00Z");
const PAST = new Date("2026-05-19T10:00:00Z").toISOString(); // before NOW
const FUTURE = new Date("2026-05-19T14:00:00Z").toISOString(); // after NOW

// ─── generateBoardingCode ────────────────────────────────────────────────────

describe("generateBoardingCode", () => {
  test("returns a 6-digit string", () => {
    const code = generateBoardingCode();
    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("only contains digits", () => {
    const code = generateBoardingCode();
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  test("value is between 100000 and 999999", () => {
    const n = Number(generateBoardingCode());
    expect(n).toBeGreaterThanOrEqual(100000);
    expect(n).toBeLessThanOrEqual(999999);
  });
});

// ─── canReserveSeat ──────────────────────────────────────────────────────────

describe("canReserveSeat", () => {
  test("ok when ride is open, future, not women-only and has seats", () => {
    const ride = makeRide({ departureDateTime: FUTURE });
    const user = makeUser({ gender: "Male" });
    expect(canReserveSeat(ride, user, NOW)).toEqual({ ok: true });
  });

  test("fails when ride is already completed", () => {
    const ride = makeRide({ completed: true, departureDateTime: FUTURE });
    const result = canReserveSeat(ride, makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/completed/i);
  });

  test("fails when departure is in the past (ride started)", () => {
    const ride = makeRide({ departureDateTime: PAST });
    const result = canReserveSeat(ride, makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });

  test("fails for male user on women-only ride", () => {
    const ride = makeRide({ womenOnly: true, departureDateTime: FUTURE });
    const user = makeUser({ gender: "Male" });
    const result = canReserveSeat(ride, user, NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/women/i);
  });

  test("ok for female user on women-only ride", () => {
    const ride = makeRide({ womenOnly: true, departureDateTime: FUTURE });
    const user = makeUser({ gender: "Female" });
    expect(canReserveSeat(ride, user, NOW)).toEqual({ ok: true });
  });

  test("fails when no seats available", () => {
    const ride = makeRide({ availableSeats: 0, departureDateTime: FUTURE });
    const result = canReserveSeat(ride, makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/seat/i);
  });

  test("completed check takes priority over started check", () => {
    const ride = makeRide({ completed: true, departureDateTime: PAST });
    const result = canReserveSeat(ride, makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/completed/i);
  });
});

// ─── canCancelSeat ───────────────────────────────────────────────────────────

describe("canCancelSeat", () => {
  test("ok for a future, non-completed ride", () => {
    expect(canCancelSeat(makeRide({ departureDateTime: FUTURE }), NOW)).toEqual({ ok: true });
  });

  test("fails when departure is in the past", () => {
    const result = canCancelSeat(makeRide({ departureDateTime: PAST }), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });

  test("fails when ride is already completed", () => {
    const result = canCancelSeat(makeRide({ completed: true, departureDateTime: FUTURE }), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });
});

// ─── canCancelRide ───────────────────────────────────────────────────────────

describe("canCancelRide", () => {
  test("ok for a future, non-completed ride", () => {
    expect(canCancelRide(makeRide({ departureDateTime: FUTURE }), NOW)).toEqual({ ok: true });
  });

  test("fails when departure is in the past", () => {
    const result = canCancelRide(makeRide({ departureDateTime: PAST }), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });

  test("fails when ride is already completed", () => {
    const result = canCancelRide(makeRide({ completed: true, departureDateTime: FUTURE }), NOW);
    expect(result.ok).toBe(false);
  });
});

// ─── canCompleteRide ─────────────────────────────────────────────────────────

describe("canCompleteRide", () => {
  test("ok when driver, not completed, and all passengers verified", () => {
    const ride = makeRide({
      driverId: "driver-1",
      passengers: ["p1", "p2"],
      verifiedPassengers: ["p1", "p2"],
    });
    expect(canCompleteRide(ride, "driver-1")).toEqual({ ok: true });
  });

  test("fails when caller is not the driver", () => {
    const result = canCompleteRide(makeRide({ passengers: ["p1"], verifiedPassengers: ["p1"] }), "other-user");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/driver/i);
  });

  test("fails when ride is already completed", () => {
    const ride = makeRide({
      driverId: "driver-1",
      completed: true,
      passengers: ["p1"],
      verifiedPassengers: ["p1"],
    });
    const result = canCompleteRide(ride, "driver-1");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/completed/i);
  });

  test("fails when there are no passengers", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: [], verifiedPassengers: [] });
    const result = canCompleteRide(ride, "driver-1");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/verified/i);
  });

  test("fails when some passengers are not verified", () => {
    const ride = makeRide({
      driverId: "driver-1",
      passengers: ["p1", "p2"],
      verifiedPassengers: ["p1"],
    });
    const result = canCompleteRide(ride, "driver-1");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/verified/i);
  });

  test("fails when verifiedPassengers is undefined", () => {
    const ride = makeRide({
      driverId: "driver-1",
      passengers: ["p1"],
      verifiedPassengers: undefined,
    });
    const result = canCompleteRide(ride, "driver-1");
    expect(result.ok).toBe(false);
  });
});

// ─── canRemovePassenger ──────────────────────────────────────────────────────

describe("canRemovePassenger", () => {
  test("ok for a future, non-completed ride", () => {
    expect(canRemovePassenger(makeRide({ departureDateTime: FUTURE }), NOW)).toEqual({ ok: true });
  });

  test("fails when departure is in the past", () => {
    const result = canRemovePassenger(makeRide({ departureDateTime: PAST }), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });

  test("fails when ride is completed", () => {
    const result = canRemovePassenger(makeRide({ completed: true, departureDateTime: FUTURE }), NOW);
    expect(result.ok).toBe(false);
  });
});

// ─── shouldAutoDeleteRide ────────────────────────────────────────────────────

describe("shouldAutoDeleteRide", () => {
  test("returns true when past, not completed, and no passengers", () => {
    const ride = makeRide({ departureDateTime: PAST, completed: false, passengers: [] });
    expect(shouldAutoDeleteRide(ride, NOW)).toBe(true);
  });

  test("returns false when ride is completed", () => {
    const ride = makeRide({ departureDateTime: PAST, completed: true, passengers: [] });
    expect(shouldAutoDeleteRide(ride, NOW)).toBe(false);
  });

  test("returns false when ride has passengers", () => {
    const ride = makeRide({ departureDateTime: PAST, completed: false, passengers: ["p1"] });
    expect(shouldAutoDeleteRide(ride, NOW)).toBe(false);
  });

  test("returns false when departure is in the future", () => {
    const ride = makeRide({ departureDateTime: FUTURE, completed: false, passengers: [] });
    expect(shouldAutoDeleteRide(ride, NOW)).toBe(false);
  });

  test("returns false when completed, has passengers, and is past", () => {
    const ride = makeRide({ departureDateTime: PAST, completed: true, passengers: ["p1"] });
    expect(shouldAutoDeleteRide(ride, NOW)).toBe(false);
  });
});

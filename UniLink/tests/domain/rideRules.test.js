import {
  isUserDriver,
  isUserPassenger,
  hasUserDrivenRide,
  generateBoardingCode,
  canReserveSeat,
  canCancelSeat,
  canCancelRide,
  canCompleteRide,
  canRemovePassenger,
  canChangeCar,
  canRateDriver,
  shouldAutoDeleteRide,
  canAccessRideReview,
  canAccessRideReport,
  canReportUser,
} from "../../domain/rules/rideRules";

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    carId: "car-1",
    origin: "Porto",
    destination: "Lisboa",
    departureDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
const PAST = new Date("2026-05-19T10:00:00Z").toISOString();
const FUTURE = new Date("2026-05-19T14:00:00Z").toISOString();

// ─── isUserDriver / isUserPassenger / hasUserDrivenRide ──────────────────────

describe("isUserDriver", () => {
  test("returns true when user is the driver", () => {
    expect(isUserDriver(makeRide({ driverId: "u1" }), "u1")).toBe(true);
  });

  test("returns false when user is not the driver", () => {
    expect(isUserDriver(makeRide({ driverId: "u1" }), "u2")).toBe(false);
  });
});

describe("isUserPassenger", () => {
  test("returns true when user is in the passengers list", () => {
    expect(isUserPassenger(makeRide({ passengers: ["u1", "u2"] }), "u1")).toBe(true);
  });

  test("returns false when user is not in the passengers list", () => {
    expect(isUserPassenger(makeRide({ passengers: ["u2"] }), "u1")).toBe(false);
  });

  test("returns false for empty passengers list", () => {
    expect(isUserPassenger(makeRide({ passengers: [] }), "u1")).toBe(false);
  });
});

describe("hasUserDrivenRide", () => {
  test("returns true when user has driven at least one ride", () => {
    const rides = [makeRide({ driverId: "u1" }), makeRide({ driverId: "u2" })];
    expect(hasUserDrivenRide(rides, "u1")).toBe(true);
  });

  test("returns false when user has not driven any ride", () => {
    const rides = [makeRide({ driverId: "u2" })];
    expect(hasUserDrivenRide(rides, "u1")).toBe(false);
  });

  test("returns false for empty rides list", () => {
    expect(hasUserDrivenRide([], "u1")).toBe(false);
  });
});

// ─── generateBoardingCode ────────────────────────────────────────────────────

describe("generateBoardingCode", () => {
  test("returns a 6-digit string", () => {
    const code = generateBoardingCode();
    expect(typeof code).toBe("string");
    expect(code).toHaveLength(6);
  });

  test("only contains digits", () => {
    expect(/^\d{6}$/.test(generateBoardingCode())).toBe(true);
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
    expect(canReserveSeat(ride, makeUser({ gender: "Male" }), NOW)).toEqual({ ok: true });
  });

  test("fails when ride is already completed", () => {
    const result = canReserveSeat(makeRide({ completed: true, departureDateTime: FUTURE }), makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/completed/i);
  });

  test("fails when departure is in the past", () => {
    const result = canReserveSeat(makeRide({ departureDateTime: PAST }), makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });

  test("fails for male user on women-only ride", () => {
    const result = canReserveSeat(makeRide({ womenOnly: true, departureDateTime: FUTURE }), makeUser({ gender: "Male" }), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/women/i);
  });

  test("ok for female user on women-only ride", () => {
    expect(canReserveSeat(makeRide({ womenOnly: true, departureDateTime: FUTURE }), makeUser({ gender: "Female" }), NOW)).toEqual({ ok: true });
  });

  test("fails when no seats available", () => {
    const result = canReserveSeat(makeRide({ availableSeats: 0, departureDateTime: FUTURE }), makeUser(), NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/seat/i);
  });

  test("completed check takes priority over started check", () => {
    const result = canReserveSeat(makeRide({ completed: true, departureDateTime: PAST }), makeUser(), NOW);
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
    const ride = makeRide({ driverId: "driver-1", passengers: ["p1", "p2"], verifiedPassengers: ["p1", "p2"] });
    expect(canCompleteRide(ride, "driver-1")).toEqual({ ok: true });
  });

  test("fails when caller is not the driver", () => {
    const result = canCompleteRide(makeRide({ passengers: ["p1"], verifiedPassengers: ["p1"] }), "other-user");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/driver/i);
  });

  test("fails when ride is already completed", () => {
    const ride = makeRide({ driverId: "driver-1", completed: true, passengers: ["p1"], verifiedPassengers: ["p1"] });
    const result = canCompleteRide(ride, "driver-1");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/completed/i);
  });

  test("fails when there are no passengers", () => {
    const result = canCompleteRide(makeRide({ driverId: "driver-1", passengers: [], verifiedPassengers: [] }), "driver-1");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/verified/i);
  });

  test("fails when some passengers are not verified", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: ["p1", "p2"], verifiedPassengers: ["p1"] });
    const result = canCompleteRide(ride, "driver-1");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/verified/i);
  });

  test("fails when verifiedPassengers is undefined", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: ["p1"], verifiedPassengers: undefined });
    expect(canCompleteRide(ride, "driver-1").ok).toBe(false);
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
    expect(canRemovePassenger(makeRide({ completed: true, departureDateTime: FUTURE }), NOW).ok).toBe(false);
  });
});

// ─── canChangeCar ────────────────────────────────────────────────────────────

describe("canChangeCar", () => {
  test("ok when ride is future and new car fits all passengers", () => {
    const ride = makeRide({ departureDateTime: FUTURE, passengers: ["p1"], totalSeats: 3 });
    expect(canChangeCar(ride, 5, NOW)).toEqual({ ok: true });
  });

  test("fails when ride already started", () => {
    const result = canChangeCar(makeRide({ departureDateTime: PAST }), 5, NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/started/i);
  });

  test("fails when new car is too small for current passengers", () => {
    const ride = makeRide({ departureDateTime: FUTURE, passengers: ["p1", "p2", "p3"], totalSeats: 3 });
    // newCarSeats=3 → newLimit = min(3, 3-1)=2, passengers.length=3 > 2
    const result = canChangeCar(ride, 3, NOW);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/small/i);
  });
});

// ─── canRateDriver ───────────────────────────────────────────────────────────

describe("canRateDriver", () => {
  test("ok for a passenger who has not yet reviewed", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: ["user-1"], completed: true });
    expect(canRateDriver(ride, "user-1", [])).toBe(true);
  });

  test("false when user is the driver", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: ["driver-1"], completed: true });
    expect(canRateDriver(ride, "driver-1", [])).toBe(false);
  });

  test("false when user is not a passenger", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: [], completed: true });
    expect(canRateDriver(ride, "outsider", [])).toBe(false);
  });

  test("false when ride is not completed", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: ["user-1"], completed: false });
    expect(canRateDriver(ride, "user-1", [])).toBe(false);
  });

  test("false when user already reviewed this ride", () => {
    const ride = makeRide({ driverId: "driver-1", passengers: ["user-1"], completed: true });
    const reviews = [{ rideId: "ride-1", reviewerId: "user-1", revieweeId: "driver-1", rating: 5, comment: "" }];
    expect(canRateDriver(ride, "user-1", reviews)).toBe(false);
  });
});

// ─── shouldAutoDeleteRide ────────────────────────────────────────────────────

describe("shouldAutoDeleteRide", () => {
  test("returns true when past, not completed, and no passengers", () => {
    expect(shouldAutoDeleteRide(makeRide({ departureDateTime: PAST, completed: false, passengers: [] }), NOW)).toBe(true);
  });

  test("returns false when ride is completed", () => {
    expect(shouldAutoDeleteRide(makeRide({ departureDateTime: PAST, completed: true, passengers: [] }), NOW)).toBe(false);
  });

  test("returns false when ride has passengers", () => {
    expect(shouldAutoDeleteRide(makeRide({ departureDateTime: PAST, completed: false, passengers: ["p1"] }), NOW)).toBe(false);
  });

  test("returns false when departure is in the future", () => {
    expect(shouldAutoDeleteRide(makeRide({ departureDateTime: FUTURE, completed: false, passengers: [] }), NOW)).toBe(false);
  });
});

// ─── canAccessRideReview ─────────────────────────────────────────────────────

describe("canAccessRideReview", () => {
  test("allows a passenger to review the driver after completion", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1"] });
    expect(canAccessRideReview(ride, "user-1", "driver-1")).toBe(true);
  });

  test("blocks review access for non-driver targets", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1", "user-2"] });
    expect(canAccessRideReview(ride, "user-1", "user-2")).toBe(false);
  });

  test("blocks when ride is not completed", () => {
    const ride = makeRide({ completed: false, driverId: "driver-1", passengers: ["user-1"] });
    expect(canAccessRideReview(ride, "user-1", "driver-1")).toBe(false);
  });
});

// ─── canAccessRideReport ─────────────────────────────────────────────────────

describe("canAccessRideReport", () => {
  test("allows a participant to report another participant after completion", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1", "user-2"] });
    expect(canAccessRideReport(ride, "user-1", "user-2")).toBe(true);
  });

  test("allows driver to report a passenger", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1"] });
    expect(canAccessRideReport(ride, "driver-1", "user-1")).toBe(true);
  });

  test("blocks report access for users outside the ride", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1"] });
    expect(canAccessRideReport(ride, "user-1", "outsider")).toBe(false);
  });

  test("blocks self-report", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1"] });
    expect(canAccessRideReport(ride, "user-1", "user-1")).toBe(false);
  });
});

// ─── canReportUser ───────────────────────────────────────────────────────────

describe("canReportUser", () => {
  test("blocks duplicate reports for the same ride/user pair", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1"] });
    const reports = [{ id: "rep-1", rideId: "ride-1", reporterId: "user-1", reportedUserId: "driver-1" }];
    expect(canReportUser(ride, "user-1", "driver-1", reports)).toBe(false);
  });

  test("allows reporting the same user again on a different ride", () => {
    const ride = makeRide({ id: "ride-1", completed: true, driverId: "driver-1", passengers: ["user-1"] });
    const reports = [{ id: "rep-1", rideId: "ride-2", reporterId: "user-1", reportedUserId: "driver-1" }];
    expect(canReportUser(ride, "user-1", "driver-1", reports)).toBe(true);
  });

  test("blocks report when access rules fail (not a participant)", () => {
    const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["user-1"] });
    expect(canReportUser(ride, "outsider", "driver-1", [])).toBe(false);
  });
});

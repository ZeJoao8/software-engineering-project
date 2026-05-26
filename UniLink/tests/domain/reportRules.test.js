import {
  hasUserReportedInRide,
  hasReportedAnyoneInRide,
  validateReportReason,
} from "../../domain/rules/reportRules";

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    passengers: ["user-1", "user-2"],
    ...overrides,
  };
}

function makeReport(overrides = {}) {
  return {
    id: "rep-1",
    rideId: "ride-1",
    reporterId: "user-1",
    reportedUserId: "driver-1",
    reason: "Unsafe driving behavior during the ride.",
    createdAt: "2026-05-20T10:00:00.000Z",
    ...overrides,
  };
}

// ─── hasUserReportedInRide ───────────────────────────────────────────────────

describe("hasUserReportedInRide", () => {
  test("returns true when a matching report exists", () => {
    expect(hasUserReportedInRide([makeReport()], "ride-1", "user-1", "driver-1")).toBe(true);
  });

  test("returns false when no reports exist", () => {
    expect(hasUserReportedInRide([], "ride-1", "user-1", "driver-1")).toBe(false);
  });

  test("returns false when report is for a different ride", () => {
    expect(hasUserReportedInRide([makeReport({ rideId: "ride-2" })], "ride-1", "user-1", "driver-1")).toBe(false);
  });

  test("returns false when reporter does not match", () => {
    expect(hasUserReportedInRide([makeReport({ reporterId: "user-2" })], "ride-1", "user-1", "driver-1")).toBe(false);
  });

  test("returns false when reported user does not match", () => {
    expect(hasUserReportedInRide([makeReport({ reportedUserId: "user-2" })], "ride-1", "user-1", "driver-1")).toBe(false);
  });
});

// ─── hasReportedAnyoneInRide ─────────────────────────────────────────────────

describe("hasReportedAnyoneInRide", () => {
  test("returns false when no reports exist", () => {
    expect(hasReportedAnyoneInRide(makeRide(), [], "user-1")).toBe(false);
  });

  test("returns false when report is from a different ride", () => {
    const reports = [makeReport({ rideId: "ride-2" })];
    expect(hasReportedAnyoneInRide(makeRide(), reports, "user-1")).toBe(false);
  });

  test("returns true when user reported the driver in this ride", () => {
    const reports = [makeReport()];
    expect(hasReportedAnyoneInRide(makeRide(), reports, "user-1")).toBe(true);
  });

  test("returns true when user reported another passenger in this ride", () => {
    const reports = [makeReport({ reportedUserId: "user-2" })];
    expect(hasReportedAnyoneInRide(makeRide(), reports, "user-1")).toBe(true);
  });

  test("does not count reports by a different user", () => {
    const reports = [makeReport({ reporterId: "user-2" })];
    expect(hasReportedAnyoneInRide(makeRide(), reports, "user-1")).toBe(false);
  });
});

// ─── validateReportReason ────────────────────────────────────────────────────

describe("validateReportReason", () => {
  test("fails for empty string", () => {
    expect(validateReportReason("")).toEqual({ ok: false, error: "Please write at least 15 characters." });
  });

  test("fails for string shorter than 15 chars", () => {
    expect(validateReportReason("too short")).toEqual({ ok: false, error: "Please write at least 15 characters." });
  });

  test("fails for string with exactly 14 characters", () => {
    expect(validateReportReason("a".repeat(14)).ok).toBe(false);
  });

  test("ok for string with exactly 15 characters", () => {
    expect(validateReportReason("a".repeat(15))).toEqual({ ok: true });
  });

  test("ok for a long descriptive reason", () => {
    expect(validateReportReason("This report has enough detail.")).toEqual({ ok: true });
  });

  test("trims whitespace when checking length", () => {
    // 14 meaningful chars + padding spaces → still fails
    expect(validateReportReason("   " + "a".repeat(14) + "   ").ok).toBe(false);
  });
});

import {
  hasUserReportedInRide,
  hasReportedAnyoneInRide,
  validateReportReason,
} from "../domain/rules/reportRules";

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    passengers: ["user-1", "user-2"],
    ...overrides,
  };
}

describe("reportRules", () => {
  test("hasUserReportedInRide only matches reports from the same ride", () => {
    const reports = [
      {
        id: "rep-1",
        rideId: "ride-2",
        reporterId: "user-1",
        reportedUserId: "driver-1",
        reason: "Unsafe driving behavior during another ride.",
        createdAt: "2026-05-20T10:00:00.000Z",
      },
    ];

    expect(hasUserReportedInRide(reports, "ride-1", "user-1", "driver-1")).toBe(false);
    expect(hasUserReportedInRide(reports, "ride-2", "user-1", "driver-1")).toBe(true);
  });

  test("hasReportedAnyoneInRide ignores reports from other rides", () => {
    const ride = makeRide();
    const reports = [
      {
        id: "rep-1",
        rideId: "ride-2",
        reporterId: "user-1",
        reportedUserId: "driver-1",
        reason: "Unsafe driving behavior during another ride.",
        createdAt: "2026-05-20T10:00:00.000Z",
      },
    ];

    expect(hasReportedAnyoneInRide(ride, reports, "user-1")).toBe(false);
  });

  test("validateReportReason enforces the minimum length", () => {
    expect(validateReportReason("too short")).toEqual({
      ok: false,
      error: "Please write at least 15 characters.",
    });

    expect(validateReportReason("This report has enough detail.")).toEqual({
      ok: true,
    });
  });
});

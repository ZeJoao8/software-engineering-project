import { addReport } from "../../services/ReportService";

jest.mock("../../repositories/ReportRepository", () => ({
  save: jest.fn(),
}));

import * as ReportRepo from "../../repositories/ReportRepository";

function makeReport(overrides = {}) {
  return {
    id: "rep-1",
    rideId: "ride-1",
    reporterId: "user-1",
    reportedUserId: "driver-1",
    reason: "  Unsafe driving behavior during the ride.  ",
    createdAt: "2026-05-20T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe("ReportService.addReport", () => {
  test("saves the report and trims the reason when it is valid", async () => {
    ReportRepo.save.mockResolvedValueOnce();
    const result = await addReport(makeReport());
    expect(result).toEqual({ ok: true });
    expect(ReportRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "Unsafe driving behavior during the ride." })
    );
  });

  test("does not call the repo when reason is too short", async () => {
    const result = await addReport(makeReport({ reason: "Too short" }));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/15 characters/i);
    expect(ReportRepo.save).not.toHaveBeenCalled();
  });

  test("does not call the repo when reason is empty", async () => {
    const result = await addReport(makeReport({ reason: "" }));
    expect(result.ok).toBe(false);
    expect(ReportRepo.save).not.toHaveBeenCalled();
  });

  test("returns error when repo throws", async () => {
    ReportRepo.save.mockRejectedValueOnce(new Error("Firebase down"));
    const result = await addReport(makeReport());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/try again/i);
  });
});

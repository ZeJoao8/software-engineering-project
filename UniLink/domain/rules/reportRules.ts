import type { Ride } from "../entities/Ride";
import type { Report } from "../entities/Report";

type RuleResult = { ok: true } | { ok: false; error: string };

export function hasUserReportedInRide(
  reports: Report[],
  rideId: string,
  reporterId: string,
  targetId: string
): boolean {
  return reports.some(
    r => r.rideId === rideId && r.reporterId === reporterId && r.reportedUserId === targetId
  );
}

export function hasReportedAnyoneInRide(
  ride: Ride,
  reports: Report[],
  reporterId: string
): boolean {
  return [...ride.passengers, ride.driverId].some(
    targetId =>
      targetId !== reporterId &&
      hasUserReportedInRide(reports, ride.id, reporterId, targetId)
  );
}

export function validateReportReason(reason: string): RuleResult {
  if (reason.trim().length < 15) {
    return { ok: false, error: "Please write at least 15 characters." };
  }

  return { ok: true };
}

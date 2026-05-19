import type { Report } from "../entities/Report";

export function hasUserReported(
  reports: Report[],
  reporterId: string,
  targetId: string
): boolean {
  return reports.some(
    r => r.reporterId === reporterId && r.reportedUserId === targetId
  );
}

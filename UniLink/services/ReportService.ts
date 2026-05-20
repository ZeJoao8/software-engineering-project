import * as ReportRepo from "../repositories/ReportRepository";
import type { Report } from "../domain/entities/Report";
import { validateReportReason } from "../domain/rules/reportRules";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function addReport(report: Report): Promise<Result> {
  const check = validateReportReason(report.reason);
  if (!check.ok) return check;

  try {
    await ReportRepo.save({
      ...report,
      reason: report.reason.trim(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the report. Please try again." };
  }
}

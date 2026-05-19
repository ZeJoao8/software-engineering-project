import * as ReportRepo from "../repositories/ReportRepository";
import type { Report } from "../domain/entities/Report";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function addReport(report: Report): Promise<Result> {
  try {
    await ReportRepo.save(report);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the report. Please try again." };
  }
}

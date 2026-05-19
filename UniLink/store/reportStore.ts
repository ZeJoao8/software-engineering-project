import type { Unsubscribe } from "firebase/firestore";

import * as ReportRepo from "../repositories/ReportRepository";
import { getCurrentUser, isAuthReady, subscribeToAuthChanges } from "./authStore";
import type { Report } from "../domain/entities/Report";

let reports: Report[] = [];
const listeners = new Set<() => void>();
let unsubReports: Unsubscribe | null = null;

function notifyListeners() {
  listeners.forEach(l => l());
}

function stopSync() {
  unsubReports?.();
  unsubReports = null;
}

function syncWithAuth() {
  if (!isAuthReady()) return;

  if (!getCurrentUser()) {
    stopSync();
    reports = [];
    notifyListeners();
    return;
  }

  if (unsubReports) return;

  const user = getCurrentUser()!;

  unsubReports = ReportRepo.subscribeByReporter(
    user.uid,
    newReports => { reports = newReports; notifyListeners(); },
    error => { stopSync(); console.error("Reports sync failed", error); }
  );
}

subscribeToAuthChanges(syncWithAuth);
syncWithAuth();

export function getReports(): Report[] {
  return reports;
}

export function getReportsForUser(userId: string): Report[] {
  return reports.filter(r => r.reportedUserId === userId);
}

export function hasReportForRide(
  rideId: string,
  reporterId: string,
  reportedUserId: string
): boolean {
  return reports.some(
    r => r.rideId === rideId && r.reporterId === reporterId && r.reportedUserId === reportedUserId
  );
}

export function subscribeToReportsChanges(listener: () => void): () => void {
  listeners.add(listener);
  syncWithAuth();
  return () => { listeners.delete(listener); };
}

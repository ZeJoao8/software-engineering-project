import { Alert } from "react-native";

import {
  collection,
  doc,
  onSnapshot,
  type Unsubscribe,
  setDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import {
  getCurrentUser,
  isAuthReady,
  subscribeToAuthChanges,
} from "./user";

export type ReportStatus =
  | "pending"
  | "reviewed"
  | "resolved";

export type ReportType =
  | "low_rating"
  | "driver_comment";

export type Report = {
  id: string;
  rideId: string;
  reviewId?: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
  status: ReportStatus;
  type: ReportType;
};

let reports: Report[] = [];

const listeners = new Set<() => void>();
let unsubscribeReportsSnapshot:
  | Unsubscribe
  | null = null;

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function stopReportsSync() {
  unsubscribeReportsSnapshot?.();
  unsubscribeReportsSnapshot = null;
}

function syncReportsWithAuth() {
  if (!isAuthReady()) {
    return;
  }

  if (!getCurrentUser()) {
    stopReportsSync();
    reports = [];
    notifyListeners();
    return;
  }

  if (unsubscribeReportsSnapshot) {
    return;
  }

  unsubscribeReportsSnapshot = onSnapshot(
    collection(db, "reports"),
    snapshot => {
      reports = snapshot.docs.map(document =>
        document.data() as Report
      );
      notifyListeners();
    },
    error => {
      stopReportsSync();
      console.error("Reports sync failed", error);
    }
  );
}

subscribeToAuthChanges(syncReportsWithAuth);
syncReportsWithAuth();

export function getReports() {
  return reports;
}

export function getReportsForUser(
  userId: string,
  legacyId?: string
) {
  return reports.filter(
    report =>
      report.reportedUserId === userId ||
      (!!legacyId &&
        report.reportedUserId === legacyId)
  );
}

export function hasReportForRide(
  rideId: string,
  reporterId: string,
  reportedUserId: string,
  reporterLegacyId?: string,
  reportedLegacyId?: string
) {
  return reports.some(
    report =>
      report.rideId === rideId &&
      (
        report.reporterId === reporterId ||
        (!!reporterLegacyId &&
          report.reporterId === reporterLegacyId)
      ) &&
      (
        report.reportedUserId === reportedUserId ||
        (!!reportedLegacyId &&
          report.reportedUserId === reportedLegacyId)
      )
  );
}

export function subscribeToReportsChanges(
  listener: () => void
) {
  listeners.add(listener);
  syncReportsWithAuth();

  return () => {
    listeners.delete(listener);
  };
}

export async function addReport(report: Report) {
  const previousReports = reports;
  reports = [report, ...reports];
  notifyListeners();

  try {
    await setDoc(
      doc(db, "reports", report.id),
      report
    );
  } catch (error) {
    reports = previousReports;
    notifyListeners();
    console.error("Add report failed", error);
    Alert.alert(
      "Report save failed",
      "Could not save the report in Firestore."
    );
  }
}
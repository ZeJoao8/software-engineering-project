import { Alert } from "react-native";

import {
  collection,
  doc,
  onSnapshot,
  type Unsubscribe,
  setDoc,
  query,
  where,
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

export type Report = {
  id: string;
  rideId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
  status: ReportStatus;
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
  if (!isAuthReady()) return;

  if (!getCurrentUser()) {
    stopReportsSync();
    reports = [];
    notifyListeners();
    return;
  }

  if (unsubscribeReportsSnapshot) return;

  const user = getCurrentUser();
  if (!user) return;

  const q = query(
    collection(db, "reports"),
    where("reporterId", "==", user.uid)
  );

  unsubscribeReportsSnapshot = onSnapshot(
    q,
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

export function getReportsForUser(userId: string) {
  return reports.filter(report => report.reportedUserId === userId);
}

export function getReportsByReporter(reporterId: string) {
  return reports.filter(report => report.reporterId === reporterId);
}

export function hasReportForRide(
  rideId: string,
  reporterId: string,
  reportedUserId: string
) {
  return reports.some(
    report =>
      report.rideId === rideId &&
      report.reporterId === reporterId &&
      report.reportedUserId === reportedUserId
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
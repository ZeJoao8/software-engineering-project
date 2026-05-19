import { useEffect, useState } from "react";
import {
  getReports,
  getReportsForUser,
  hasReportForRide,
  subscribeToReportsChanges,
} from "../store/reportStore";
import type { Report } from "../domain/entities/Report";

export function useReports() {
  const [reports, setReports] = useState<Report[]>(getReports);

  useEffect(() => {
    return subscribeToReportsChanges(() => setReports(getReports()));
  }, []);

  return { reports, getReportsForUser, hasReportForRide };
}

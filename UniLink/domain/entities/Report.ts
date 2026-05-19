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

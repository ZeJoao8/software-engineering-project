export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
}

export function formatDate(iso:string){
 const d = new Date(iso);
 const day =
  String(d.getDate()).padStart(2,"0");
 const month =
  String(d.getMonth()+1).padStart(2,"0");
 const year =
  d.getFullYear();
 const hours =
  String(d.getHours()).padStart(2,"0");
 const minutes =
  String(d.getMinutes()).padStart(2,"0");
 return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

import type { Ride } from "../domain/entities/Ride";

export function sortByDateAsc(array: Ride[]): Ride[] {
  return [...array].sort(
    (a, b) => new Date(a.departureDateTime).getTime() - new Date(b.departureDateTime).getTime()
  );
}

export function sortByDateDesc(array: Ride[]): Ride[] {
  return [...array].sort(
    (a, b) => new Date(b.departureDateTime).getTime() - new Date(a.departureDateTime).getTime()
  );
}
import type { User } from "../entities/User";
import type { Ride } from "../entities/Ride";
import { calculateUserCO2Saved } from "./sustainability";

export interface UserRankEntry {
  id: string;
  name: string;
  co2: number;
}

export function buildLeaderboard(users: User[], rides: Ride[]): UserRankEntry[] {
  return users
    .map(u => ({
      id: u.uid,
      name: u.name,
      co2: calculateUserCO2Saved(rides, u.uid),
    }))
    .filter(u => u.co2 > 0)
    .sort((a, b) => b.co2 - a.co2);
}

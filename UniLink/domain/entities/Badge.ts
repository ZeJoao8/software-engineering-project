export type BadgeLevel = "none" | "bronze" | "silver" | "gold" | "diamond";

export interface BadgeStatus {
  id: string;
  title: string;
  level: BadgeLevel;
  icon: string;
  description: string;
  progress: number;
  nextLevelThreshold: number | null;
  currentLevelThreshold: number | null;
}

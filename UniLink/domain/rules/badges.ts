import type { Ride } from "../entities/Ride";
import type { BadgeLevel, BadgeStatus } from "../entities/Badge";

export type { BadgeLevel, BadgeStatus };

function determineLevel(value: number, thresholds: number[]): BadgeLevel {
  if (value >= thresholds[3]) return "diamond";
  if (value >= thresholds[2]) return "gold";
  if (value >= thresholds[1]) return "silver";
  if (value >= thresholds[0]) return "bronze";
  return "none";
}

function getNextThreshold(value: number, thresholds: number[]): number | null {
  for (const t of thresholds) {
    if (value < t) return t;
  }
  return null;
}

function getCurrentThreshold(level: BadgeLevel, thresholds: number[]): number | null {
  switch (level) {
    case "diamond": return thresholds[3];
    case "gold": return thresholds[2];
    case "silver": return thresholds[1];
    case "bronze": return thresholds[0];
    case "none": return null;
  }
}

export function getUserBadges(
  userId: string,
  rides: Ride[],
  co2Saved: number
): BadgeStatus[] {
  const ecoThresholds = [10, 50, 100, 150];
  const ecoLevel = determineLevel(co2Saved, ecoThresholds);

  const driverRides = rides.filter(r => r.driverId === userId && r.completed).length;
  const driverThresholds = [3, 10, 25, 50];
  const driverLevel = determineLevel(driverRides, driverThresholds);

  const passengerRides = rides.filter(r => r.passengers.includes(userId) && r.completed).length;
  const riderThresholds = [3, 10, 25, 50];
  const riderLevel = determineLevel(passengerRides, riderThresholds);

  return [
    {
      id: "eco_warrior",
      title: "Eco-Warrior",
      level: ecoLevel,
      icon: "leaf",
      description: `Saved ${co2Saved.toFixed(1)}kg of CO2`,
      progress: co2Saved,
      nextLevelThreshold: getNextThreshold(co2Saved, ecoThresholds),
      currentLevelThreshold: getCurrentThreshold(ecoLevel, ecoThresholds),
    },
    {
      id: "veteran_driver",
      title: "Veteran Driver",
      level: driverLevel,
      icon: "car",
      description: `Drove ${driverRides} rides`,
      progress: driverRides,
      nextLevelThreshold: getNextThreshold(driverRides, driverThresholds),
      currentLevelThreshold: getCurrentThreshold(driverLevel, driverThresholds),
    },
    {
      id: "top_rider",
      title: "Top Rider",
      level: riderLevel,
      icon: "bag-handle",
      description: `Rode in ${passengerRides} rides`,
      progress: passengerRides,
      nextLevelThreshold: getNextThreshold(passengerRides, riderThresholds),
      currentLevelThreshold: getCurrentThreshold(riderLevel, riderThresholds),
    },
  ];
}
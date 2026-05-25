import type { DriverPreferences } from "../domain/entities/DriverPreferences";

export function getDriverPreferenceLines(prefs: DriverPreferences | undefined): string[] {
  if (!prefs) return [];
  const lines: string[] = [];
  if (prefs.noSmoking)      lines.push("🚭 No smoking");
  if (prefs.acceptLuggage)  lines.push("🧳 Luggage allowed");
  if (prefs.acceptPets)     lines.push("🐾 Pets allowed");
  if (prefs.passengerMusic) lines.push("🎵 Passengers can play music");
  return lines;
}

const TRANSIT_COLORS = ["#2563EB", "#eb8614", "#7C3AED", "#eedc3d"];

export function isTransitLeg(leg: { mode: string }): boolean {
  return leg.mode.toUpperCase() !== "WALK";
}

export function modeEmoji(mode: string): string {
  switch (mode.toUpperCase()) {
    case "BUS":    return "🚌";
    case "SUBWAY": return "🚇";
    case "RAIL":   return "🚆";
    case "TRAM":   return "🚃";
    case "FERRY":  return "⛴️";
    case "WALK":   return "🚶";
    default:       return "🚌";
  }
}

export function modeLabel(mode: string, lineName?: string): string {
  if (mode.toUpperCase() === "WALK") return "Walk";
  return lineName ? `Line ${lineName}` : mode;
}

export function buildLegColorMap(legs: { mode: string; lineName?: string }[]): Record<number, string> {
  const map: Record<number, string> = {};
  let colorIndex = -1;
  let lastLineName: string | undefined = undefined;
  for (let i = 0; i < legs.length; i++) {
    if (legs[i].mode.toUpperCase() === "WALK") continue;
    if (legs[i].lineName !== lastLineName) {
      colorIndex = (colorIndex + 1) % TRANSIT_COLORS.length;
      lastLineName = legs[i].lineName;
    }
    map[i] = TRANSIT_COLORS[colorIndex];
  }
  return map;
}

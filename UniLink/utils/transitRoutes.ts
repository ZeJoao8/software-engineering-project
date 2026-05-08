import { forwardGeocode, type Coordinates } from "./routing";

export interface TransitLeg {
  mode: string;
  lineName?: string;
  fromStop: string;
  toStop: string;
  durationMin: number;
  fromCoords: Coordinates;
  toCoords: Coordinates;
}

export interface TransitRoute {
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  legs: TransitLeg[];
}

export async function getTransitRoutes(
  origin: string,
  destination: string,
  originCoords?: Coordinates | null,
  destCoords?: Coordinates | null,
): Promise<TransitRoute[]> {
  const [resolvedOrigin, resolvedDest] = await Promise.all([
    originCoords ?? forwardGeocode(origin),
    destCoords ?? forwardGeocode(destination),
  ]);

  if (!resolvedOrigin || !resolvedDest) return [];

  const isoTime = new Date().toISOString();

  const url =
    `https://api.transitous.org/api/v5/plan?` +
    `fromPlace=${resolvedOrigin.latitude},${resolvedOrigin.longitude}` +
    `&toPlace=${resolvedDest.latitude},${resolvedDest.longitude}` +
    `&time=${encodeURIComponent(isoTime)}` +
    `&numItineraries=3`;

  const response = await fetch(url, {
    headers: { "User-Agent": "UniLink-App/1.0" },
  });

  const data = await response.json() as {
    itineraries?: Array<{
      startTime: string | number;
      endTime: string | number;
      duration: number;
      legs: Array<{
        mode: string;
        duration: number;
        routeShortName?: string;
        routeLongName?: string;
        from: { name: string; lat: number; lon: number };
        to: { name: string; lat: number; lon: number };
      }>;
    }>;
  };

  if (!data.itineraries?.length) return [];

  return data.itineraries.map(it => ({
    departureTime: new Date(it.startTime).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    arrivalTime: new Date(it.endTime).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    durationMin: Math.round(it.duration / 60),
    legs: it.legs.map(leg => ({
      mode: leg.mode,
      lineName: leg.routeShortName ?? leg.routeLongName,
      fromStop: leg.from.name,
      toStop: leg.to.name,
      durationMin: Math.round(leg.duration / 60),
      fromCoords: { latitude: leg.from.lat, longitude: leg.from.lon },
      toCoords: { latitude: leg.to.lat, longitude: leg.to.lon },
    })),
  }));
}

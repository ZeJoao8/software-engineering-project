import { forwardGeocode } from "./geocoding";
import type { Coordinates } from "./routing";

export interface TransitLeg {
  mode: string;
  lineName?: string;
  fromStop: string;
  toStop: string;
  durationMin: number;
  fromCoords: Coordinates;
  toCoords: Coordinates;
  path: Coordinates[];
}

function decodePolyline(str: string, precision: number = 5): Coordinates[] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Coordinates[] = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push({ latitude: lat / factor, longitude: lng / factor });
  }

  return coordinates;
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
        legGeometry?: { points: string; length: number };
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
      path: leg.legGeometry?.points
        ? decodePolyline(leg.legGeometry.points)
        : [
            { latitude: leg.from.lat, longitude: leg.from.lon },
            { latitude: leg.to.lat, longitude: leg.to.lon },
          ],
    })),
  }));
}

export interface NominatimAddress {
  amenity?: string;
  building?: string;
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  [key: string]: string | undefined;
}

export interface NominatimResponseItem {
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimAddress;
  error?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  coordinates: Coordinates[];
  distanceKm: number;
  durationMin: number;
}

/**
 * Get the shortest driving route between two points using OSRM.
 */
export async function getRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.longitude},${origin.latitude};` +
      `${destination.longitude},${destination.latitude}` +
      `?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.routes?.length) {
      return null;
    }

    const route = data.routes[0];

    const coordinates: Coordinates[] =
      route.geometry.coordinates.map(
        (coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        })
      );

    return {
      coordinates,
      distanceKm: Math.round(
        (route.distance / 1000) * 10
      ) / 10,
      durationMin: Math.round(
        route.duration / 60
      ),
    };
  } catch (error) {
    console.error("OSRM route error:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to a place name using Nominatim.
 */
export async function reverseGeocode(
  coords: Coordinates
): Promise<string> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${coords.latitude}&lon=${coords.longitude}` +
      `&format=json&addressdetails=1&zoom=18`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "UniLink-App/1.0",
      },
    });

    const data = await response.json() as NominatimResponseItem;

    if (data.error) return "Unknown place";

    const addr = data.address;
    if (!addr) return data.display_name?.split(",").slice(0, 3).join(",") ?? "Unknown place";

    // Build a useful short name
    const parts: string[] = [];

    if (addr.amenity) parts.push(addr.amenity);
    else if (addr.building) parts.push(addr.building);
    else if (addr.road) {
      parts.push(addr.road);
      if (addr.house_number) {
        parts[0] += ` ${addr.house_number}`;
      }
    }

    if (addr.suburb) parts.push(addr.suburb);
    else if (addr.neighbourhood)
      parts.push(addr.neighbourhood);

    if (addr.city) parts.push(addr.city);
    else if (addr.town) parts.push(addr.town);

    return parts.length > 0
      ? parts.join(", ")
      : data.display_name?.split(",").slice(0, 3).join(",") ??
          "Unknown place";
  } catch (error) {
    console.error("Geocode error:", error);
    return "Unknown place";
  }
}

export interface AddressSuggestion {
  displayName: string;
  shortName: string;
  coords: Coordinates;
}

/**
 * Search for places matching a query — returns multiple suggestions.
 * Biased to Porto/FEUP area for better relevance.
 */
export async function searchPlaces(
  query: string
): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json&limit=5&countrycodes=pt&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "UniLink-App/1.0",
      },
    });

    const data = await response.json() as NominatimResponseItem[];

    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      const addr = item.address || {};

      const parts: string[] = [];

      if (addr.amenity) parts.push(addr.amenity);
      else if (addr.building) parts.push(addr.building);
      else if (addr.road) {
        let road = addr.road;
        if (addr.house_number) road += ` ${addr.house_number}`;
        parts.push(road);
      }

      if (addr.suburb) parts.push(addr.suburb);
      else if (addr.neighbourhood)
        parts.push(addr.neighbourhood);

      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);

      const shortName =
        parts.length > 0
          ? parts.join(", ")
          : item.display_name
              ?.split(",")
              .slice(0, 3)
              .join(",")
              .trim() ?? query;

      return {
        displayName: item.display_name ?? shortName,
        shortName,
        coords: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        },
      };
    });
  } catch (error) {
    console.error("Search places error:", error);
    return [];
  }
}

/**
 * Forward geocode a place name to coordinates using Nominatim.
 */
export async function forwardGeocode(
  query: string
): Promise<Coordinates | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json&limit=1&countrycodes=pt`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "UniLink-App/1.0",
      },
    });

    const data = await response.json() as NominatimResponseItem[];

    if (!data.length) return null;

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Forward geocode error:", error);
    return null;
  }
}

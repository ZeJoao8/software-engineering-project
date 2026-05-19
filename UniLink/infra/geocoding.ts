import type { Coordinates } from "./routing";

export interface NominatimAddress {
  amenity?: string;
  building?: string;
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  village?: string;
  hamlet?: string;
  town?: string;
  city?: string;
  [key: string]: string | undefined;
}

export interface NominatimResponseItem {
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimAddress;
  error?: string;
}

export interface AddressSuggestion {
  displayName: string;
  shortName: string;
  coords: Coordinates;
}

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
    else if (addr.neighbourhood) parts.push(addr.neighbourhood);
    else if (addr.quarter) parts.push(addr.quarter);

    if (addr.village) parts.push(addr.village);
    else if (addr.hamlet) parts.push(addr.hamlet);
    else if (addr.town) parts.push(addr.town);
    else if (addr.city) parts.push(addr.city);

    return parts.length > 0
      ? parts.join(", ")
      : data.display_name?.split(",").slice(0, 3).join(",") ??
          "Unknown place";
  } catch (error) {
    console.error("Geocode error:", error);
    return "Unknown place";
  }
}

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
      else if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.quarter) parts.push(addr.quarter);

      if (addr.village) parts.push(addr.village);
      else if (addr.hamlet) parts.push(addr.hamlet);
      else if (addr.town) parts.push(addr.town);
      else if (addr.city) parts.push(addr.city);

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

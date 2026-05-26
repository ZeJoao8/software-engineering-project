export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  coordinates: Coordinates[];
  distanceKm: number;
  durationMin: number;
}

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

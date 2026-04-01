import polyline from '@mapbox/polyline';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export async function getRouteDirections(
  origin: Coordinate,
  destination: Coordinate
): Promise<Coordinate[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const encodedPolyline = data.routes[0].geometry;
    const decodedCoords = polyline.decode(encodedPolyline);

    return decodedCoords.map(([latitude, longitude]) => ({
      latitude,
      longitude,
    }));
  } catch (error) {
    console.error('Error fetching directions:', error);
    // Fallback to straight line if OSRM fails
    return [origin, destination];
  }
}

export async function searchLocations(query: string): Promise<any[]> {
  if (!query || query.length < 3) return [];
  
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.features) return [];

    return data.features.map((feature: any) => ({
      name: feature.properties.name || feature.properties.street || "Unknown",
      city: feature.properties.city || feature.properties.state || "",
      country: feature.properties.country || "",
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

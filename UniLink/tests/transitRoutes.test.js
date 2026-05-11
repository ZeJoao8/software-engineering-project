import { getTransitRoutes } from "../utils/transitRoutes";

// Mock the forwardGeocode function from routing
jest.mock("../utils/routing", () => ({
  forwardGeocode: jest.fn((query) => {
    if (query === "Porto")
      return Promise.resolve({ latitude: 41.1579, longitude: -8.6291 });
    if (query === "Lisboa")
      return Promise.resolve({ latitude: 38.7223, longitude: -9.1393 });
    return Promise.resolve(null);
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Transit Routes - getTransitRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns empty array when origin cannot be geocoded", async () => {
    const result = await getTransitRoutes("UnknownPlace", "Lisboa");
    expect(result).toEqual([]);
  });

  test("returns empty array when destination cannot be geocoded", async () => {
    const result = await getTransitRoutes("Porto", "UnknownPlace");
    expect(result).toEqual([]);
  });

  test("returns empty array when API returns no itineraries", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ itineraries: [] }),
    });

    const result = await getTransitRoutes("Porto", "Lisboa");
    expect(result).toEqual([]);
  });

  test("returns empty array when API returns no itineraries key", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    const result = await getTransitRoutes("Porto", "Lisboa");
    expect(result).toEqual([]);
  });

  test("parses a valid itinerary correctly", async () => {
    const mockItinerary = {
      itineraries: [
        {
          startTime: "2026-05-11T10:00:00Z",
          endTime: "2026-05-11T11:30:00Z",
          duration: 5400, // 90 minutes
          legs: [
            {
              mode: "BUS",
              duration: 3600,
              routeShortName: "500",
              from: { name: "Bolhão", lat: 41.15, lon: -8.61 },
              to: { name: "Campanhã", lat: 41.16, lon: -8.58 },
            },
            {
              mode: "RAIL",
              duration: 1800,
              routeLongName: "Intercidades",
              from: { name: "Campanhã", lat: 41.16, lon: -8.58 },
              to: { name: "Santa Apolónia", lat: 38.72, lon: -9.12 },
            },
          ],
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockItinerary),
    });

    const result = await getTransitRoutes("Porto", "Lisboa");

    expect(result).toHaveLength(1);
    expect(result[0].durationMin).toBe(90);
    expect(result[0].legs).toHaveLength(2);

    // First leg - bus
    expect(result[0].legs[0].mode).toBe("BUS");
    expect(result[0].legs[0].lineName).toBe("500");
    expect(result[0].legs[0].fromStop).toBe("Bolhão");
    expect(result[0].legs[0].toStop).toBe("Campanhã");
    expect(result[0].legs[0].durationMin).toBe(60);

    // Second leg - rail (uses routeLongName as fallback)
    expect(result[0].legs[1].mode).toBe("RAIL");
    expect(result[0].legs[1].lineName).toBe("Intercidades");
  });

  test("uses provided coordinates instead of geocoding", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ itineraries: [] }),
    });

    const originCoords = { latitude: 41.15, longitude: -8.63 };
    const destCoords = { latitude: 38.72, longitude: -9.14 };

    await getTransitRoutes("Porto", "Lisboa", originCoords, destCoords);

    // fetch should have been called with the provided coords
    expect(fetch).toHaveBeenCalledTimes(1);
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("41.15");
    expect(url).toContain("-8.63");
    expect(url).toContain("38.72");
    expect(url).toContain("-9.14");
  });

  test("generates fallback path when no legGeometry", async () => {
    const mockItinerary = {
      itineraries: [
        {
          startTime: "2026-05-11T10:00:00Z",
          endTime: "2026-05-11T10:30:00Z",
          duration: 1800,
          legs: [
            {
              mode: "WALK",
              duration: 1800,
              from: { name: "A", lat: 41.15, lon: -8.61 },
              to: { name: "B", lat: 41.16, lon: -8.58 },
              // No legGeometry
            },
          ],
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockItinerary),
    });

    const result = await getTransitRoutes("Porto", "Lisboa");
    const path = result[0].legs[0].path;

    // Fallback: 2 points (from and to)
    expect(path).toHaveLength(2);
    expect(path[0]).toEqual({ latitude: 41.15, longitude: -8.61 });
    expect(path[1]).toEqual({ latitude: 41.16, longitude: -8.58 });
  });
});

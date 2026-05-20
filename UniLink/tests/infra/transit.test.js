import { getTransitRoutes } from "../../infra/transit";

jest.mock("../../infra/geocoding", () => ({
  forwardGeocode: jest.fn((query) => {
    if (query === "Porto") return Promise.resolve({ latitude: 41.1579, longitude: -8.6291 });
    if (query === "Lisboa") return Promise.resolve({ latitude: 38.7223, longitude: -9.1393 });
    return Promise.resolve(null);
  }),
}));

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe("getTransitRoutes", () => {
  test("returns empty array when origin cannot be geocoded", async () => {
    expect(await getTransitRoutes("UnknownPlace", "Lisboa")).toEqual([]);
  });

  test("returns empty array when destination cannot be geocoded", async () => {
    expect(await getTransitRoutes("Porto", "UnknownPlace")).toEqual([]);
  });

  test("returns empty array when API returns no itineraries", async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ itineraries: [] }) });
    expect(await getTransitRoutes("Porto", "Lisboa")).toEqual([]);
  });

  test("returns empty array when API response has no itineraries key", async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve({}) });
    expect(await getTransitRoutes("Porto", "Lisboa")).toEqual([]);
  });

  test("parses a valid itinerary correctly", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        itineraries: [{
          startTime: "2026-05-11T10:00:00Z",
          endTime: "2026-05-11T11:30:00Z",
          duration: 5400,
          legs: [
            { mode: "BUS", duration: 3600, routeShortName: "500", from: { name: "Bolhão", lat: 41.15, lon: -8.61 }, to: { name: "Campanhã", lat: 41.16, lon: -8.58 } },
            { mode: "RAIL", duration: 1800, routeLongName: "Intercidades", from: { name: "Campanhã", lat: 41.16, lon: -8.58 }, to: { name: "Santa Apolónia", lat: 38.72, lon: -9.12 } },
          ],
        }],
      }),
    });

    const result = await getTransitRoutes("Porto", "Lisboa");
    expect(result).toHaveLength(1);
    expect(result[0].durationMin).toBe(90);
    expect(result[0].legs[0].mode).toBe("BUS");
    expect(result[0].legs[0].lineName).toBe("500");
    expect(result[0].legs[1].mode).toBe("RAIL");
    expect(result[0].legs[1].lineName).toBe("Intercidades");
  });

  test("uses provided coordinates instead of geocoding", async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ itineraries: [] }) });
    await getTransitRoutes("Porto", "Lisboa", { latitude: 41.15, longitude: -8.63 }, { latitude: 38.72, longitude: -9.14 });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("41.15");
    expect(url).toContain("-8.63");
  });

  test("generates fallback path when leg has no legGeometry", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        itineraries: [{
          startTime: "2026-05-11T10:00:00Z",
          endTime: "2026-05-11T10:30:00Z",
          duration: 1800,
          legs: [{ mode: "WALK", duration: 1800, from: { name: "A", lat: 41.15, lon: -8.61 }, to: { name: "B", lat: 41.16, lon: -8.58 } }],
        }],
      }),
    });
    const result = await getTransitRoutes("Porto", "Lisboa");
    expect(result[0].legs[0].path).toHaveLength(2);
    expect(result[0].legs[0].path[0]).toEqual({ latitude: 41.15, longitude: -8.61 });
  });
});

import { calculateUserCO2Saved, calculateCO2ForDistance, CO2_PER_KM } from "../../domain/rules/sustainability";

const mockRides = [
  { id: "1", driverId: "user-driver", passengers: ["user-passenger1", "user-passenger2"], completed: true, distanceKm: 10 },
  { id: "2", driverId: "user-driver", passengers: ["user-passenger1"], completed: true, distanceKm: 5 },
  { id: "3", driverId: "other-driver", passengers: ["user-driver"], completed: true, distanceKm: 20 },
  { id: "4", driverId: "user-driver", passengers: ["user-passenger1"], completed: false, distanceKm: 100 },
  { id: "5", driverId: "user-driver", passengers: ["user-passenger1"], completed: true, distanceKm: null },
];

describe("calculateUserCO2Saved", () => {
  test("calculates CO2 saved as driver (sum of passengers × distance × rate)", () => {
    expect(calculateUserCO2Saved(mockRides.slice(0, 2), "user-driver")).toBeCloseTo(3.0);
  });

  test("calculates CO2 saved as passenger", () => {
    expect(calculateUserCO2Saved([mockRides[2]], "user-driver")).toBeCloseTo(2.4);
  });

  test("calculates combined CO2 (driver + passenger roles)", () => {
    expect(calculateUserCO2Saved(mockRides, "user-driver")).toBeCloseTo(5.4);
  });

  test("ignores non-completed rides", () => {
    expect(calculateUserCO2Saved([mockRides[3]], "user-driver")).toBe(0);
  });

  test("ignores rides without distance", () => {
    expect(calculateUserCO2Saved([mockRides[4]], "user-driver")).toBe(0);
  });

  test("returns 0 for undefined user", () => {
    expect(calculateUserCO2Saved(mockRides, undefined)).toBe(0);
  });

  test("returns 0 for empty rides", () => {
    expect(calculateUserCO2Saved([], "user-driver")).toBe(0);
  });

  test("CO2_PER_KM constant is a positive number", () => {
    expect(typeof CO2_PER_KM).toBe("number");
    expect(CO2_PER_KM).toBeGreaterThan(0);
  });
});

// ─── calculateCO2ForDistance ─────────────────────────────────────────────────

describe("calculateCO2ForDistance", () => {
  test("returns distance multiplied by CO2_PER_KM", () => {
    expect(calculateCO2ForDistance(10)).toBeCloseTo(10 * CO2_PER_KM);
  });

  test("returns 0 for 0 km", () => {
    expect(calculateCO2ForDistance(0)).toBe(0);
  });

  test("is consistent with CO2_PER_KM constant", () => {
    expect(calculateCO2ForDistance(1)).toBe(CO2_PER_KM);
  });
});

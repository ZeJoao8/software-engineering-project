import { calculateUserCO2Saved, CO2_PER_KM } from "../utils/sustainability";

const mockRides = [
  {
    id: "1",
    driverId: "user-driver",
    passengers: ["user-passenger1", "user-passenger2"],
    completed: true,
    distanceKm: 10,
  },
  {
    id: "2",
    driverId: "user-driver",
    passengers: ["user-passenger1"],
    completed: true,
    distanceKm: 5,
  },
  {
    id: "3",
    driverId: "other-driver",
    passengers: ["user-driver"], // current user is passenger here
    completed: true,
    distanceKm: 20,
  },
  {
    id: "4",
    driverId: "user-driver",
    passengers: ["user-passenger1"],
    completed: false, // Not completed, should be ignored
    distanceKm: 100,
  },
  {
    id: "5",
    driverId: "user-driver",
    passengers: ["user-passenger1"],
    completed: true,
    distanceKm: null, // No distance, should be ignored
  }
];

describe("Sustainability Logic", () => {
  test("calculates CO2 saved for a driver (sum of passengers)", () => {
    // Ride 1: 10km * 0.12 * 2 passengers = 2.4kg
    // Ride 2: 5km * 0.12 * 1 passenger = 0.6kg
    // Total as driver = 3.0kg
    const co2AsDriver = calculateUserCO2Saved(mockRides.slice(0, 2), "user-driver");
    expect(co2AsDriver).toBeCloseTo(3.0);
  });

  test("calculates CO2 saved for a passenger", () => {
    // Ride 3: 20km * 0.12 = 2.4kg
    const co2AsPassenger = calculateUserCO2Saved([mockRides[2]], "user-driver");
    expect(co2AsPassenger).toBeCloseTo(2.4);
  });

  test("calculates combined CO2 (driver + passenger roles)", () => {
    // Total = 3.0 (as driver) + 2.4 (as passenger) = 5.4kg
    const totalCo2 = calculateUserCO2Saved(mockRides, "user-driver");
    expect(totalCo2).toBeCloseTo(5.4);
  });

  test("ignores non-completed rides", () => {
    const co2 = calculateUserCO2Saved([mockRides[3]], "user-driver");
    expect(co2).toBe(0);
  });

  test("ignores rides without distance", () => {
    const co2 = calculateUserCO2Saved([mockRides[4]], "user-driver");
    expect(co2).toBe(0);
  });

  test("returns 0 for undefined user", () => {
    const co2 = calculateUserCO2Saved(mockRides, undefined);
    expect(co2).toBe(0);
  });
});

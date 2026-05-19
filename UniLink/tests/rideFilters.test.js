import { filterRides, FilterCriteria } from "../domain/rules/rideFilters";

const mockRides = [
  {
    id: "1",
    driverId: "user1",
    origin: "FEUP",
    destination: "Boavista",
    departureDateTime: "2026-05-01T10:00:00.000Z",
    availableSeats: 2,
    womenOnly: false,
    passengers: []
  },
  {
    id: "2",
    driverId: "user2",
    origin: "Aliados",
    destination: "FEUP",
    departureDateTime: "2026-05-01T11:00:00.000Z",
    availableSeats: 1,
    womenOnly: true,
    passengers: []
  },
  {
    id: "3",
    driverId: "user3",
    origin: "Matosinhos",
    destination: "FEUP",
    departureDateTime: "2026-04-01T10:00:00.000Z", // Past date
    availableSeats: 3,
    womenOnly: false,
    passengers: []
  }
];

const mockUser = {
  uid: "currentUser",
  email: "current@test.com",
  gender: "Male"
};

const defaultFilters = {
  origin: "",
  destination: "",
  date: "",
  womenOnly: false,
  minSeats: ""
};

const mockNow = new Date("2026-04-04T12:00:00.000Z");

describe("Ride Filtering Logic", () => {
  test("excludes past rides", () => {
    const results = filterRides(mockRides, mockUser, defaultFilters, mockNow);
    expect(results.some(r => r.id === "3")).toBe(false);
  });

  test("filters by origin (case-insensitive)", () => {
    const filters = { ...defaultFilters, origin: "feup" };
    const results = filterRides(mockRides, mockUser, filters, mockNow);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("1");
  });

  test("filters by destination", () => {
    const filters = { ...defaultFilters, destination: "FEUP" };
    const femaleUser = { ...mockUser, gender: "Female" };
    const results = filterRides(mockRides, femaleUser, filters, mockNow);
    expect(results.some(r => r.origin === "Aliados")).toBe(true);
  });

  test("excludes womenOnly rides for male users", () => {
    const results = filterRides(mockRides, mockUser, defaultFilters, mockNow);
    expect(results.some(r => r.id === "2")).toBe(false);
  });

  test("includes womenOnly rides for female users", () => {
    const femaleUser = { ...mockUser, gender: "Female" };
    const results = filterRides(mockRides, femaleUser, defaultFilters, mockNow);
    expect(results.some(r => r.id === "2")).toBe(true);
  });

  test("filters by minSeats", () => {
    const filters = { ...defaultFilters, minSeats: "2" };
    const results = filterRides(mockRides, mockUser, filters, mockNow);
    expect(results.every(r => r.availableSeats >= 2)).toBe(true);
  });

  test("excludes user's own rides", () => {
     const myRide = {
        ...mockRides[0],
        id: "own",
        driverId: "currentUser"
     };
     const results = filterRides([myRide, ...mockRides], mockUser, defaultFilters, mockNow);
     expect(results.some(r => r.id === "own")).toBe(false);
  });

  test("filters by womenOnly checkbox (even for female users)", () => {
    const femaleUser = { ...mockUser, gender: "Female" };
    const filters = { ...defaultFilters, womenOnly: true };
    const results = filterRides(mockRides, femaleUser, filters, mockNow);
    expect(results.every(r => r.womenOnly)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("2");
  });
});

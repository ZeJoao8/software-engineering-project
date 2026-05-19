import { getUserBadges } from "../domain/rules/badges";

const makeRide = (overrides) => ({
  id: "r1",
  driverId: "driver1",
  carId: "car1",
  origin: "Porto",
  destination: "Lisboa",
  departureDateTime: "2026-01-01T10:00:00",
  availableSeats: 3,
  totalSeats: 4,
  womenOnly: false,
  passengers: [],
  completed: false,
  ...overrides,
});

describe("Badges - getUserBadges", () => {
  test("returns 3 badges (eco_warrior, veteran_driver, top_rider)", () => {
    const badges = getUserBadges("user1", [], 0);
    expect(badges).toHaveLength(3);
    expect(badges.map((b) => b.id)).toEqual([
      "eco_warrior",
      "veteran_driver",
      "top_rider",
    ]);
  });

  test("all badges are 'none' when user has no activity", () => {
    const badges = getUserBadges("user1", [], 0);
    badges.forEach((b) => {
      expect(b.level).toBe("none");
    });
  });

  // --- Eco-Warrior badge ---
  test("eco_warrior: bronze at 10kg CO2", () => {
    const badges = getUserBadges("user1", [], 10);
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("bronze");
  });

  test("eco_warrior: silver at 50kg CO2", () => {
    const badges = getUserBadges("user1", [], 50);
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("silver");
  });

  test("eco_warrior: gold at 100kg CO2", () => {
    const badges = getUserBadges("user1", [], 100);
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("gold");
  });

  test("eco_warrior: diamond at 150kg CO2", () => {
    const badges = getUserBadges("user1", [], 150);
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("diamond");
    expect(eco.nextLevelThreshold).toBeNull(); // max level
  });

  test("eco_warrior: none below 10kg CO2", () => {
    const badges = getUserBadges("user1", [], 5);
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("none");
  });

  // --- Veteran Driver badge ---
  test("veteran_driver: bronze at 3 completed driver rides", () => {
    const rides = Array.from({ length: 3 }, (_, i) =>
      makeRide({ id: `r${i}`, driverId: "user1", completed: true })
    );
    const badges = getUserBadges("user1", rides, 0);
    const driver = badges.find((b) => b.id === "veteran_driver");
    expect(driver.level).toBe("bronze");
  });

  test("veteran_driver: silver at 10 completed driver rides", () => {
    const rides = Array.from({ length: 10 }, (_, i) =>
      makeRide({ id: `r${i}`, driverId: "user1", completed: true })
    );
    const badges = getUserBadges("user1", rides, 0);
    const driver = badges.find((b) => b.id === "veteran_driver");
    expect(driver.level).toBe("silver");
  });

  test("veteran_driver: ignores non-completed rides", () => {
    const rides = Array.from({ length: 10 }, (_, i) =>
      makeRide({ id: `r${i}`, driverId: "user1", completed: false })
    );
    const badges = getUserBadges("user1", rides, 0);
    const driver = badges.find((b) => b.id === "veteran_driver");
    expect(driver.level).toBe("none");
  });

  test("veteran_driver: ignores rides where user is passenger", () => {
    const rides = Array.from({ length: 10 }, (_, i) =>
      makeRide({
        id: `r${i}`,
        driverId: "other",
        passengers: ["user1"],
        completed: true,
      })
    );
    const badges = getUserBadges("user1", rides, 0);
    const driver = badges.find((b) => b.id === "veteran_driver");
    expect(driver.level).toBe("none");
  });

  // --- Top Rider badge ---
  test("top_rider: bronze at 3 completed passenger rides", () => {
    const rides = Array.from({ length: 3 }, (_, i) =>
      makeRide({
        id: `r${i}`,
        driverId: "other",
        passengers: ["user1"],
        completed: true,
      })
    );
    const badges = getUserBadges("user1", rides, 0);
    const rider = badges.find((b) => b.id === "top_rider");
    expect(rider.level).toBe("bronze");
  });

  test("top_rider: diamond at 50 completed passenger rides", () => {
    const rides = Array.from({ length: 50 }, (_, i) =>
      makeRide({
        id: `r${i}`,
        driverId: "other",
        passengers: ["user1"],
        completed: true,
      })
    );
    const badges = getUserBadges("user1", rides, 0);
    const rider = badges.find((b) => b.id === "top_rider");
    expect(rider.level).toBe("diamond");
  });

  // --- Progress & thresholds ---
  test("nextLevelThreshold returns next level target", () => {
    const badges = getUserBadges("user1", [], 15); // between bronze (10) and silver (50)
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("bronze");
    expect(eco.nextLevelThreshold).toBe(50);
    expect(eco.progress).toBe(15);
  });

  test("currentLevelThreshold returns current level target", () => {
    const badges = getUserBadges("user1", [], 55); // silver level
    const eco = badges.find((b) => b.id === "eco_warrior");
    expect(eco.level).toBe("silver");
    expect(eco.currentLevelThreshold).toBe(50);
  });
});

import { getUserBadges } from "../../domain/rules/badges";

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

describe("getUserBadges", () => {
  test("returns 3 badges (eco_warrior, veteran_driver, top_rider)", () => {
    const badges = getUserBadges("user1", [], 0);
    expect(badges).toHaveLength(3);
    expect(badges.map(b => b.id)).toEqual(["eco_warrior", "veteran_driver", "top_rider"]);
  });

  test("all badges are 'none' when user has no activity", () => {
    getUserBadges("user1", [], 0).forEach(b => expect(b.level).toBe("none"));
  });

  describe("eco_warrior", () => {
    test("none below 10kg CO2", () => {
      expect(getUserBadges("user1", [], 5).find(b => b.id === "eco_warrior").level).toBe("none");
    });

    test("bronze at 10kg CO2", () => {
      expect(getUserBadges("user1", [], 10).find(b => b.id === "eco_warrior").level).toBe("bronze");
    });

    test("silver at 50kg CO2", () => {
      expect(getUserBadges("user1", [], 50).find(b => b.id === "eco_warrior").level).toBe("silver");
    });

    test("gold at 100kg CO2", () => {
      expect(getUserBadges("user1", [], 100).find(b => b.id === "eco_warrior").level).toBe("gold");
    });

    test("diamond at 150kg CO2 (max level, no next threshold)", () => {
      const badge = getUserBadges("user1", [], 150).find(b => b.id === "eco_warrior");
      expect(badge.level).toBe("diamond");
      expect(badge.nextLevelThreshold).toBeNull();
    });

    test("progress and nextLevelThreshold between levels", () => {
      const badge = getUserBadges("user1", [], 15).find(b => b.id === "eco_warrior");
      expect(badge.level).toBe("bronze");
      expect(badge.nextLevelThreshold).toBe(50);
      expect(badge.progress).toBe(15);
    });

    test("currentLevelThreshold at silver", () => {
      const badge = getUserBadges("user1", [], 55).find(b => b.id === "eco_warrior");
      expect(badge.level).toBe("silver");
      expect(badge.currentLevelThreshold).toBe(50);
    });
  });

  describe("veteran_driver", () => {
    test("bronze at 3 completed driver rides", () => {
      const rides = Array.from({ length: 3 }, (_, i) =>
        makeRide({ id: `r${i}`, driverId: "user1", completed: true })
      );
      expect(getUserBadges("user1", rides, 0).find(b => b.id === "veteran_driver").level).toBe("bronze");
    });

    test("silver at 10 completed driver rides", () => {
      const rides = Array.from({ length: 10 }, (_, i) =>
        makeRide({ id: `r${i}`, driverId: "user1", completed: true })
      );
      expect(getUserBadges("user1", rides, 0).find(b => b.id === "veteran_driver").level).toBe("silver");
    });

    test("ignores non-completed rides", () => {
      const rides = Array.from({ length: 10 }, (_, i) =>
        makeRide({ id: `r${i}`, driverId: "user1", completed: false })
      );
      expect(getUserBadges("user1", rides, 0).find(b => b.id === "veteran_driver").level).toBe("none");
    });

    test("ignores rides where user is passenger", () => {
      const rides = Array.from({ length: 10 }, (_, i) =>
        makeRide({ id: `r${i}`, driverId: "other", passengers: ["user1"], completed: true })
      );
      expect(getUserBadges("user1", rides, 0).find(b => b.id === "veteran_driver").level).toBe("none");
    });
  });

  describe("top_rider", () => {
    test("bronze at 3 completed passenger rides", () => {
      const rides = Array.from({ length: 3 }, (_, i) =>
        makeRide({ id: `r${i}`, driverId: "other", passengers: ["user1"], completed: true })
      );
      expect(getUserBadges("user1", rides, 0).find(b => b.id === "top_rider").level).toBe("bronze");
    });

    test("diamond at 50 completed passenger rides", () => {
      const rides = Array.from({ length: 50 }, (_, i) =>
        makeRide({ id: `r${i}`, driverId: "other", passengers: ["user1"], completed: true })
      );
      expect(getUserBadges("user1", rides, 0).find(b => b.id === "top_rider").level).toBe("diamond");
    });
  });
});

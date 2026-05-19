import { calculateWeeklyStreak } from "../domain/rules/streaks";

const makeRide = (overrides) => ({
  id: "r1",
  driverId: "driver1",
  carId: "car1",
  origin: "Porto",
  destination: "Lisboa",
  departureDateTime: new Date().toISOString(),
  availableSeats: 3,
  totalSeats: 4,
  womenOnly: false,
  passengers: [],
  completed: true,
  ...overrides,
});

function weeksAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d.toISOString();
}

describe("Streaks - calculateWeeklyStreak", () => {
  test("returns 0 when there are no rides", () => {
    expect(calculateWeeklyStreak([], "user1")).toBe(0);
  });

  test("returns 0 when user has no participated rides", () => {
    const rides = [
      makeRide({ driverId: "other", passengers: ["someone_else"] }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(0);
  });

  test("returns 1 for a ride in the current week (as driver)", () => {
    const rides = [
      makeRide({
        driverId: "user1",
        departureDateTime: new Date().toISOString(),
      }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("returns 1 for a ride in the current week (as passenger)", () => {
    const rides = [
      makeRide({
        driverId: "other",
        passengers: ["user1"],
        departureDateTime: new Date().toISOString(),
      }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("returns 3 for consecutive weeks with rides", () => {
    const rides = [
      makeRide({
        id: "r1",
        driverId: "user1",
        departureDateTime: weeksAgo(0),
      }),
      makeRide({
        id: "r2",
        driverId: "user1",
        departureDateTime: weeksAgo(1),
      }),
      makeRide({
        id: "r3",
        driverId: "user1",
        departureDateTime: weeksAgo(2),
      }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(3);
  });

  test("streak breaks when a week is skipped", () => {
    const rides = [
      makeRide({
        id: "r1",
        driverId: "user1",
        departureDateTime: weeksAgo(0),
      }),
      // week 1 skipped
      makeRide({
        id: "r2",
        driverId: "user1",
        departureDateTime: weeksAgo(2),
      }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("counts past rides (departureDateTime < now) as completed even if completed=false", () => {
    const fewHoursAgo = new Date();
    fewHoursAgo.setHours(fewHoursAgo.getHours() - 3);
    const rides = [
      makeRide({
        driverId: "user1",
        completed: false,
        departureDateTime: fewHoursAgo.toISOString(),
      }),
    ];
    // The streaks function considers past rides as completed
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("multiple rides in the same week only count as 1 week", () => {
    const now = new Date();
    const rides = [
      makeRide({
        id: "r1",
        driverId: "user1",
        departureDateTime: now.toISOString(),
      }),
      makeRide({
        id: "r2",
        driverId: "user1",
        departureDateTime: now.toISOString(),
      }),
      makeRide({
        id: "r3",
        driverId: "user1",
        departureDateTime: now.toISOString(),
      }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });
});

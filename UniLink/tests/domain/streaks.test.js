import { calculateWeeklyStreak } from "../../domain/rules/streaks";

const makeRide = (overrides) => ({
  id: "r1",
  driverId: "driver1",
  origin: "Porto",
  destination: "Lisboa",
  departureDateTime: new Date().toISOString(),
  passengers: [],
  completed: true,
  ...overrides,
});

function weeksAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d.toISOString();
}

describe("calculateWeeklyStreak", () => {
  test("returns 0 when there are no rides", () => {
    expect(calculateWeeklyStreak([], "user1")).toBe(0);
  });

  test("returns 0 when user has not participated in any ride", () => {
    const rides = [makeRide({ driverId: "other", passengers: ["someone_else"] })];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(0);
  });

  test("returns 1 for a ride in the current week as driver", () => {
    const rides = [makeRide({ driverId: "user1", departureDateTime: new Date().toISOString() })];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("returns 1 for a ride in the current week as passenger", () => {
    const rides = [makeRide({ driverId: "other", passengers: ["user1"], departureDateTime: new Date().toISOString() })];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("returns 3 for three consecutive weeks with rides", () => {
    const rides = [
      makeRide({ id: "r1", driverId: "user1", departureDateTime: weeksAgo(0) }),
      makeRide({ id: "r2", driverId: "user1", departureDateTime: weeksAgo(1) }),
      makeRide({ id: "r3", driverId: "user1", departureDateTime: weeksAgo(2) }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(3);
  });

  test("streak breaks when a week is skipped", () => {
    const rides = [
      makeRide({ id: "r1", driverId: "user1", departureDateTime: weeksAgo(0) }),
      makeRide({ id: "r2", driverId: "user1", departureDateTime: weeksAgo(2) }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("multiple rides in the same week count as 1", () => {
    const now = new Date().toISOString();
    const rides = [
      makeRide({ id: "r1", driverId: "user1", departureDateTime: now }),
      makeRide({ id: "r2", driverId: "user1", departureDateTime: now }),
      makeRide({ id: "r3", driverId: "user1", departureDateTime: now }),
    ];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });

  test("past rides with completed=false still count for streaks", () => {
    const fewHoursAgo = new Date();
    fewHoursAgo.setHours(fewHoursAgo.getHours() - 3);
    const rides = [makeRide({ driverId: "user1", completed: false, departureDateTime: fewHoursAgo.toISOString() })];
    expect(calculateWeeklyStreak(rides, "user1")).toBe(1);
  });
});

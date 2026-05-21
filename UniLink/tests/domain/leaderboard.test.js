import { buildLeaderboard } from "../../domain/rules/leaderboard";

function makeUser(uid, name) {
  return { uid, name, email: `${uid}@up.pt`, university: "FEUP", course: "LEIC" };
}

function makeRide(driverId, passengers, distanceKm, completed = true) {
  return { id: `ride-${Math.random()}`, driverId, passengers, distanceKm, completed };
}

describe("buildLeaderboard", () => {
  test("returns empty array when no users have saved CO2", () => {
    const users = [makeUser("u1", "Alice")];
    expect(buildLeaderboard(users, [])).toEqual([]);
  });

  test("excludes users with no ride participation", () => {
    const users = [makeUser("u1", "Alice"), makeUser("u2", "Bob")];
    // u2 has no rides at all → CO2 = 0
    const rides = [makeRide("u1", ["p-other"], 10)];
    const result = buildLeaderboard(users, rides);
    expect(result.some(e => e.id === "u2")).toBe(false);
  });

  test("includes only users with CO2 > 0", () => {
    const users = [makeUser("u1", "Alice"), makeUser("u2", "Bob")];
    // only u1 participated (as driver); u2 has no rides
    const rides = [makeRide("u1", ["p-other"], 10)];
    const result = buildLeaderboard(users, rides);
    expect(result.some(e => e.id === "u2")).toBe(false);
    expect(result.some(e => e.id === "u1")).toBe(true);
  });

  test("sorts users by CO2 descending", () => {
    const users = [makeUser("u1", "Alice"), makeUser("u2", "Bob"), makeUser("u3", "Charlie")];
    const rides = [
      makeRide("u1", ["u2"], 10),  // u1 saves more
      makeRide("u3", ["u2"], 5),   // u3 saves less
    ];
    const result = buildLeaderboard(users, rides);
    expect(result[0].co2).toBeGreaterThan(result[1].co2);
  });

  test("entry has id, name, and co2 fields", () => {
    const users = [makeUser("u1", "Alice")];
    const rides = [makeRide("u1", ["p1"], 10)];
    const result = buildLeaderboard(users, rides);
    expect(result[0]).toHaveProperty("id", "u1");
    expect(result[0]).toHaveProperty("name", "Alice");
    expect(result[0]).toHaveProperty("co2");
    expect(typeof result[0].co2).toBe("number");
  });
});

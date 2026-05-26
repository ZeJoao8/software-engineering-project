import { applyMyRidesFilters, matchesRating } from "../../domain/rules/myRidesFilters";

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    passengers: [],
    completed: false,
    womenOnly: false,
    ...overrides,
  };
}

function makeReview(overrides = {}) {
  return {
    id: "rev-1",
    rideId: "ride-1",
    reviewerId: "p1",
    revieweeId: "driver-1",
    rating: 5,
    comment: "",
    ...overrides,
  };
}

// ─── matchesRating ───────────────────────────────────────────────────────────

describe("matchesRating", () => {
  test("always returns true when ratingFilter is null", () => {
    expect(matchesRating(makeRide(), "driver", "driver-1", [], null)).toBe(true);
  });

  describe("driver role", () => {
    test("'none' matches completed ride with no reviews", () => {
      const ride = makeRide({ completed: true });
      expect(matchesRating(ride, "driver", "driver-1", [], "none")).toBe(true);
    });

    test("'none' does not match when reviews exist", () => {
      const ride = makeRide({ completed: true });
      const reviews = [makeReview({ rating: 4 })];
      expect(matchesRating(ride, "driver", "driver-1", reviews, "none")).toBe(false);
    });

    test("'1-2' matches average below 3", () => {
      const reviews = [makeReview({ rating: 1 }), makeReview({ id: "r2", rating: 2 })];
      expect(matchesRating(makeRide(), "driver", "driver-1", reviews, "1-2")).toBe(true);
    });

    test("'3' matches average between 3 and 4", () => {
      const reviews = [makeReview({ rating: 3 })];
      expect(matchesRating(makeRide(), "driver", "driver-1", reviews, "3")).toBe(true);
    });

    test("'4-5' matches average >= 4", () => {
      const reviews = [makeReview({ rating: 5 })];
      expect(matchesRating(makeRide(), "driver", "driver-1", reviews, "4-5")).toBe(true);
    });
  });

  describe("passenger role", () => {
    test("'none' matches completed ride with no passenger review", () => {
      const ride = makeRide({ completed: true });
      expect(matchesRating(ride, "passenger", "p1", [], "none")).toBe(true);
    });

    test("'4-5' matches passenger review with rating >= 4", () => {
      const reviews = [makeReview({ reviewerId: "p1", rating: 4 })];
      expect(matchesRating(makeRide(), "passenger", "p1", reviews, "4-5")).toBe(true);
    });

    test("'1-2' does not match passenger review with rating 3", () => {
      const reviews = [makeReview({ reviewerId: "p1", rating: 3 })];
      expect(matchesRating(makeRide(), "passenger", "p1", reviews, "1-2")).toBe(false);
    });
  });
});

// ─── applyMyRidesFilters ─────────────────────────────────────────────────────

const rides = [
  makeRide({ id: "r1", completed: false, womenOnly: false }),
  makeRide({ id: "r2", completed: true, womenOnly: true }),
  makeRide({ id: "r3", completed: true, womenOnly: false }),
];

const noExtra = new Set();

describe("applyMyRidesFilters", () => {
  test("'all' status returns everything", () => {
    const result = applyMyRidesFilters(rides, "driver", "driver-1", [], [], "all", noExtra, null);
    expect(result).toHaveLength(3);
  });

  test("'active' filter returns only non-completed rides", () => {
    const result = applyMyRidesFilters(rides, "driver", "driver-1", [], [], "active", noExtra, null);
    expect(result.every(r => !r.completed)).toBe(true);
    expect(result).toHaveLength(1);
  });

  test("'completed' filter returns only completed rides", () => {
    const result = applyMyRidesFilters(rides, "driver", "driver-1", [], [], "completed", noExtra, null);
    expect(result.every(r => r.completed)).toBe(true);
    expect(result).toHaveLength(2);
  });

  test("womenOnly extra filter keeps only womenOnly rides", () => {
    const result = applyMyRidesFilters(rides, "driver", "driver-1", [], [], "all", new Set(["womenOnly"]), null);
    expect(result.every(r => r.womenOnly)).toBe(true);
    expect(result).toHaveLength(1);
  });

  test("hasFeedback filter keeps rides where driver received a comment", () => {
    const reviews = [
      { id: "rev1", rideId: "r2", reviewerId: "p1", revieweeId: "driver-1", rating: 4, comment: "Nice!" },
    ];
    const result = applyMyRidesFilters(rides, "driver", "driver-1", reviews, [], "all", new Set(["hasFeedback"]), null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("r2");
  });

  test("hasReport filter keeps rides where user filed a report", () => {
    const ride = makeRide({ id: "r4", passengers: ["p1"], driverId: "driver-1" });
    const reports = [{ id: "rep1", rideId: "r4", reporterId: "driver-1", reportedUserId: "p1" }];
    const result = applyMyRidesFilters([ride], "driver", "driver-1", [], reports, "all", new Set(["hasReport"]), null);
    expect(result).toHaveLength(1);
  });

  test("ratingFilter delegates to matchesRating", () => {
    const reviews = [{ id: "r", rideId: "r3", reviewerId: "p1", revieweeId: "driver-1", rating: 5, comment: "" }];
    const result = applyMyRidesFilters(
      [rides[2]], "driver", "driver-1", reviews, [], "all", noExtra, "4-5"
    );
    expect(result).toHaveLength(1);
  });
});

import { buildRideCardTags } from "../../domain/rules/rideCardTags";

function makeRide(overrides = {}) {
  return {
    id: "ride-1",
    driverId: "driver-1",
    passengers: [],
    completed: false,
    womenOnly: false,
    friendsOnly: false,
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

describe("buildRideCardTags", () => {
  test("adds womenOnly tag when ride is women-only", () => {
    const tags = buildRideCardTags(makeRide({ womenOnly: true }), "p1", [], []);
    expect(tags.some(t => t.kind === "womenOnly")).toBe(true);
  });

  test("no womenOnly tag when ride is not women-only", () => {
    const tags = buildRideCardTags(makeRide({ womenOnly: false }), "p1", [], []);
    expect(tags.some(t => t.kind === "womenOnly")).toBe(false);
  });

  test("adds friendsOnly tag when ride is friends-only", () => {
    const tags = buildRideCardTags(makeRide({ friendsOnly: true }), "p1", [], []);
    expect(tags.some(t => t.kind === "friendsOnly")).toBe(true);
  });

  test("no friendsOnly tag when ride is not friends-only", () => {
    const tags = buildRideCardTags(makeRide({ friendsOnly: false }), "p1", [], []);
    expect(tags.some(t => t.kind === "friendsOnly")).toBe(false);
  });

  describe("driver tags", () => {
    test("driverNoRating when completed and no reviews", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1" });
      const tags = buildRideCardTags(ride, "driver-1", [], []);
      expect(tags.some(t => t.kind === "driverNoRating")).toBe(true);
    });

    test("driverRating with correct average when reviews exist", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1" });
      const reviews = [
        makeReview({ rating: 4 }),
        makeReview({ id: "r2", rating: 2 }),
      ];
      const tags = buildRideCardTags(ride, "driver-1", reviews, []);
      const tag = tags.find(t => t.kind === "driverRating");
      expect(tag).toBeDefined();
      expect(tag.average).toBe(3.0);
    });

    test("driverRating.hasComments is true when at least one review has a comment", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1" });
      const reviews = [makeReview({ comment: "Good driver!" })];
      const tags = buildRideCardTags(ride, "driver-1", reviews, []);
      const tag = tags.find(t => t.kind === "driverRating");
      expect(tag.hasComments).toBe(true);
    });

    test("driverRating.hasComments is false when all comments are empty", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1" });
      const reviews = [makeReview({ comment: "" })];
      const tags = buildRideCardTags(ride, "driver-1", reviews, []);
      const tag = tags.find(t => t.kind === "driverRating");
      expect(tag.hasComments).toBe(false);
    });

    test("no driver tags when ride is not completed", () => {
      const ride = makeRide({ completed: false, driverId: "driver-1" });
      const tags = buildRideCardTags(ride, "driver-1", [], []);
      expect(tags.some(t => t.kind === "driverRating" || t.kind === "driverNoRating")).toBe(false);
    });
  });

  describe("passenger tags", () => {
    test("passengerNoRating when completed and passenger left no review", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["p1"] });
      const tags = buildRideCardTags(ride, "p1", [], []);
      expect(tags.some(t => t.kind === "passengerNoRating")).toBe(true);
    });

    test("passengerRating when passenger has already reviewed", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["p1"] });
      const reviews = [makeReview({ reviewerId: "p1", rating: 4, comment: "Nice!" })];
      const tags = buildRideCardTags(ride, "p1", reviews, []);
      const tag = tags.find(t => t.kind === "passengerRating");
      expect(tag).toBeDefined();
      expect(tag.rating).toBe(4);
      expect(tag.hasComment).toBe(true);
    });

    test("no passenger tags when ride is not completed", () => {
      const ride = makeRide({ completed: false, driverId: "driver-1", passengers: ["p1"] });
      const tags = buildRideCardTags(ride, "p1", [], []);
      expect(tags.some(t => t.kind === "passengerRating" || t.kind === "passengerNoRating")).toBe(false);
    });

    test("no passenger tags when user is the driver", () => {
      const ride = makeRide({ completed: true, driverId: "driver-1", passengers: ["driver-1"] });
      const tags = buildRideCardTags(ride, "driver-1", [], []);
      expect(tags.some(t => t.kind === "passengerRating" || t.kind === "passengerNoRating")).toBe(false);
    });
  });

  describe("reportedInRide tag", () => {
    test("added when user has reported someone in this ride", () => {
      const ride = makeRide({ passengers: ["p1"], driverId: "driver-1" });
      const reports = [{ id: "r1", rideId: "ride-1", reporterId: "p1", reportedUserId: "driver-1" }];
      const tags = buildRideCardTags(ride, "p1", [], reports);
      expect(tags.some(t => t.kind === "reportedInRide")).toBe(true);
    });

    test("not added when user has not reported anyone", () => {
      const ride = makeRide({ passengers: ["p1"], driverId: "driver-1" });
      const tags = buildRideCardTags(ride, "p1", [], []);
      expect(tags.some(t => t.kind === "reportedInRide")).toBe(false);
    });
  });
});

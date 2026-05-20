import {
  calculateAverageRating,
  validateReviewRating,
  getVisibleFeedback,
  findPassengerReviewInRide,
} from "../../domain/rules/reviewRules";

// ─── calculateAverageRating ──────────────────────────────────────────────────

describe("calculateAverageRating", () => {
  test("returns 0 for empty reviews", () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  test("returns the rating when there is a single review", () => {
    expect(calculateAverageRating([{ rating: 4 }])).toBe(4);
  });

  test("computes the average of multiple reviews", () => {
    expect(calculateAverageRating([{ rating: 4 }, { rating: 2 }, { rating: 3 }])).toBe(3.0);
  });

  test("rounds to one decimal place", () => {
    expect(calculateAverageRating([{ rating: 5 }, { rating: 4 }])).toBe(4.5);
    expect(calculateAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 3 }])).toBe(4.0);
  });

  test("handles all 5-star reviews", () => {
    expect(calculateAverageRating([{ rating: 5 }, { rating: 5 }, { rating: 5 }])).toBe(5.0);
  });

  test("handles all 1-star reviews", () => {
    expect(calculateAverageRating([{ rating: 1 }, { rating: 1 }])).toBe(1.0);
  });
});

// ─── validateReviewRating ────────────────────────────────────────────────────

describe("validateReviewRating", () => {
  test("fails for rating 0", () => {
    expect(validateReviewRating(0)).toEqual({ ok: false, error: "Choose a rating between 1 and 5 stars." });
  });

  test("fails for rating 6", () => {
    expect(validateReviewRating(6)).toEqual({ ok: false, error: "Choose a rating between 1 and 5 stars." });
  });

  test("fails for negative rating", () => {
    expect(validateReviewRating(-1).ok).toBe(false);
  });

  test("ok for rating 1 (lower boundary)", () => {
    expect(validateReviewRating(1)).toEqual({ ok: true });
  });

  test("ok for rating 5 (upper boundary)", () => {
    expect(validateReviewRating(5)).toEqual({ ok: true });
  });

  test("ok for rating 3 (middle)", () => {
    expect(validateReviewRating(3)).toEqual({ ok: true });
  });
});

// ─── getVisibleFeedback ──────────────────────────────────────────────────────

describe("getVisibleFeedback", () => {
  const reviews = [
    { id: "r1", rideId: "ride-1", reviewerId: "p1", revieweeId: "driver-1", rating: 5, comment: "Great!" },
    { id: "r2", rideId: "ride-1", reviewerId: "p2", revieweeId: "driver-1", rating: 3, comment: "" },
    { id: "r3", rideId: "ride-2", reviewerId: "p1", revieweeId: "driver-1", rating: 4, comment: "Nice ride" },
    { id: "r4", rideId: "ride-1", reviewerId: "p3", revieweeId: "driver-1", rating: 2, comment: "Bad" },
  ];

  test("driver sees all non-empty comments from their ride", () => {
    const result = getVisibleFeedback(reviews, "ride-1", true, "driver-1");
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(["r1", "r4"]);
  });

  test("driver does not see empty comments", () => {
    const result = getVisibleFeedback(reviews, "ride-1", true, "driver-1");
    expect(result.every(r => r.comment.trim().length > 0)).toBe(true);
  });

  test("passenger sees only their own non-empty comment", () => {
    const result = getVisibleFeedback(reviews, "ride-1", false, "p1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("r1");
  });

  test("returns empty when there are no reviews for the ride", () => {
    expect(getVisibleFeedback(reviews, "ride-999", true, "driver-1")).toEqual([]);
  });
});

// ─── findPassengerReviewInRide ───────────────────────────────────────────────

describe("findPassengerReviewInRide", () => {
  const reviews = [
    { id: "r1", rideId: "ride-1", reviewerId: "p1", revieweeId: "driver-1", rating: 5, comment: "" },
    { id: "r2", rideId: "ride-2", reviewerId: "p1", revieweeId: "driver-2", rating: 3, comment: "" },
  ];

  test("finds the review for the correct ride and passenger", () => {
    const result = findPassengerReviewInRide(reviews, "ride-1", "p1");
    expect(result?.id).toBe("r1");
  });

  test("returns undefined when passenger has no review in the ride", () => {
    expect(findPassengerReviewInRide(reviews, "ride-1", "p2")).toBeUndefined();
  });

  test("does not match reviews from a different ride", () => {
    expect(findPassengerReviewInRide(reviews, "ride-999", "p1")).toBeUndefined();
  });
});

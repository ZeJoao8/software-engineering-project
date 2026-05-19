import { calculateAverageRating } from "../domain/rules/reviewRules";

describe("calculateAverageRating", () => {
  test("returns 0 for empty reviews", () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  test("returns the rating when there is a single review", () => {
    expect(calculateAverageRating([{ rating: 4 }])).toBe(4);
  });

  test("computes the average of multiple reviews", () => {
    const reviews = [{ rating: 4 }, { rating: 2 }, { rating: 3 }];
    expect(calculateAverageRating(reviews)).toBe(3.0);
  });

  test("rounds to one decimal place", () => {
    const reviews = [{ rating: 5 }, { rating: 4 }];
    expect(calculateAverageRating(reviews)).toBe(4.5);

    const reviews2 = [{ rating: 5 }, { rating: 4 }, { rating: 3 }];
    expect(calculateAverageRating(reviews2)).toBe(4.0);
  });

  test("handles all 5-star reviews", () => {
    const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 5 }];
    expect(calculateAverageRating(reviews)).toBe(5.0);
  });

  test("handles all 1-star reviews", () => {
    const reviews = [{ rating: 1 }, { rating: 1 }];
    expect(calculateAverageRating(reviews)).toBe(1.0);
  });
});

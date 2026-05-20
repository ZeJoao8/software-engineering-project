import { addReview } from "../../services/ReviewService";

jest.mock("../../repositories/ReviewRepository", () => ({
  save: jest.fn(),
}));

import * as ReviewRepo from "../../repositories/ReviewRepository";

function makeReview(overrides = {}) {
  return {
    id: "rev-1",
    rideId: "ride-1",
    reviewerId: "user-1",
    revieweeId: "driver-1",
    rating: 5,
    comment: "  Great driver!  ",
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe("ReviewService.addReview", () => {
  test("saves the review and trims the comment when rating is valid", async () => {
    ReviewRepo.save.mockResolvedValueOnce();
    const result = await addReview(makeReview());
    expect(result).toEqual({ ok: true });
    expect(ReviewRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ comment: "Great driver!" })
    );
  });

  test("does not call the repo when rating is invalid (0)", async () => {
    const result = await addReview(makeReview({ rating: 0 }));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/rating/i);
    expect(ReviewRepo.save).not.toHaveBeenCalled();
  });

  test("does not call the repo when rating is invalid (6)", async () => {
    const result = await addReview(makeReview({ rating: 6 }));
    expect(result.ok).toBe(false);
    expect(ReviewRepo.save).not.toHaveBeenCalled();
  });

  test("returns error when repo throws", async () => {
    ReviewRepo.save.mockRejectedValueOnce(new Error("Firebase down"));
    const result = await addReview(makeReview());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/try again/i);
  });
});

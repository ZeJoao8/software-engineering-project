import {
  isValidEmail,
  isUniversityEmail,
  isPasswordStrong,
  doPasswordsMatch,
  areRequiredFieldsFilled,
  isValidPlate,
  isValidSeatCount,
} from "../../domain/rules/validation";

describe("isValidEmail", () => {
  test("accepts valid email formats", () => {
    expect(isValidEmail("test@up.pt")).toBe(true);
    expect(isValidEmail("user.name@up.pt")).toBe(true);
    expect(isValidEmail("test@gmail.com")).toBe(true);
  });

  test("rejects invalid emails", () => {
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isUniversityEmail", () => {
  test("accepts university domain emails", () => {
    expect(isUniversityEmail("test@up.pt")).toBe(true);
    expect(isUniversityEmail("student@fe.up.pt")).toBe(true);
  });

  test("rejects non-university emails", () => {
    expect(isUniversityEmail("test@gmail.com")).toBe(false);
    expect(isUniversityEmail("")).toBe(false);
  });
});

describe("isPasswordStrong", () => {
  test("accepts passwords with 8+ characters", () => {
    expect(isPasswordStrong("12345678")).toBe(true);
    expect(isPasswordStrong("abcdefgh")).toBe(true);
  });

  test("rejects passwords shorter than 8 characters", () => {
    expect(isPasswordStrong("123")).toBe(false);
    expect(isPasswordStrong("")).toBe(false);
  });
});

describe("doPasswordsMatch", () => {
  test("returns true when passwords are identical", () => {
    expect(doPasswordsMatch("pass123", "pass123")).toBe(true);
  });

  test("returns false when passwords differ", () => {
    expect(doPasswordsMatch("pass123", "other")).toBe(false);
  });
});

describe("areRequiredFieldsFilled", () => {
  test("returns true when all fields have non-empty values", () => {
    expect(areRequiredFieldsFilled({ name: "John", email: "john@test.com" })).toBe(true);
  });

  test("returns false when any field is empty", () => {
    expect(areRequiredFieldsFilled({ name: "John", email: "" })).toBe(false);
  });

  test("returns false when a field is only whitespace", () => {
    expect(areRequiredFieldsFilled({ name: " " })).toBe(false);
  });
});

describe("isValidPlate", () => {
  test("accepts valid Portuguese plate formats", () => {
    expect(isValidPlate("AA-00-AA")).toBe(true);
    expect(isValidPlate("00-AA-00")).toBe(true);
    expect(isValidPlate("AA-AA-00")).toBe(true);
    expect(isValidPlate("ABCDEF")).toBe(true);
    expect(isValidPlate("ABCDEFGH")).toBe(true);
  });

  test("is case-insensitive", () => {
    expect(isValidPlate("aa-00-aa")).toBe(true);
    expect(isValidPlate("ab-12-cd")).toBe(true);
  });

  test("rejects invalid plates", () => {
    expect(isValidPlate("ABCDE")).toBe(false);
    expect(isValidPlate("ABCDEFGHI")).toBe(false);
    expect(isValidPlate("AB-1!-CD")).toBe(false);
    expect(isValidPlate("")).toBe(false);
  });
});

describe("isValidSeatCount", () => {
  test("accepts valid seat counts within max", () => {
    expect(isValidSeatCount("3", 4)).toEqual({ ok: true, seats: 3 });
    expect(isValidSeatCount("4", 4)).toEqual({ ok: true, seats: 4 });
  });

  test("rejects non-integer values", () => {
    expect(isValidSeatCount("abc", 4)).toEqual({ ok: false, seats: 0, error: "Seats must be an integer" });
    expect(isValidSeatCount("1.5", 4)).toEqual({ ok: false, seats: 0, error: "Seats must be an integer" });
  });

  test("rejects zero or negative values", () => {
    expect(isValidSeatCount("0", 4)).toEqual({ ok: false, seats: 0, error: "Must allow at least 1 passenger" });
    expect(isValidSeatCount("-1", 4)).toEqual({ ok: false, seats: 0, error: "Must allow at least 1 passenger" });
  });

  test("rejects values exceeding max seats", () => {
    expect(isValidSeatCount("5", 4)).toEqual({ ok: false, seats: 0, error: "Max passengers: 4" });
  });
});

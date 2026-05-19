import {
  isValidEmail,
  isUniversityEmail,
  isPasswordStrong,
  doPasswordsMatch,
  areRequiredFieldsFilled,
  isValidPlate,
  isValidSeatCount,
} from "../domain/rules/validation";

describe("Validation Utilities", () => {
  test("isValidEmail validates general email formats correctly", () => {
    expect(isValidEmail("test@up.pt")).toBe(true);
    expect(isValidEmail("user.name@up.pt")).toBe(true);
    expect(isValidEmail("test@gmail.com")).toBe(true);
    expect(isValidEmail("test@feup.pt")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  test("isUniversityEmail validates university domain correctly", () => {
    expect(isUniversityEmail("test@up.pt")).toBe(true);
    expect(isUniversityEmail("user.name@up.pt")).toBe(true);
    expect(isUniversityEmail("student@fe.up.pt")).toBe(true);
    expect(isUniversityEmail("test@gmail.com")).toBe(false);
    expect(isUniversityEmail("invalid-email")).toBe(false);
    expect(isUniversityEmail("")).toBe(false);
  });

  test("isPasswordStrong checks minimum length", () => {
    expect(isPasswordStrong("12345678")).toBe(true);
    expect(isPasswordStrong("abcdefgh")).toBe(true);
    expect(isPasswordStrong("123")).toBe(false);
    expect(isPasswordStrong("")).toBe(false);
  });

  test("doPasswordsMatch checks equality", () => {
    expect(doPasswordsMatch("pass123", "pass123")).toBe(true);
    expect(doPasswordsMatch("pass123", "other")).toBe(false);
  });

  test("areRequiredFieldsFilled detects empty values", () => {
    const validFields = {
      name: "John",
      email: "john@test.com",
      password: "123"
    };

    const invalidFields = {
      name: "John",
      email: "",
      password: "123"
    };

    expect(areRequiredFieldsFilled(validFields)).toBe(true);
    expect(areRequiredFieldsFilled(invalidFields)).toBe(false);
    expect(areRequiredFieldsFilled({ name: " " })).toBe(false);
  });

  test("isValidPlate accepts valid Portuguese plate formats", () => {
    expect(isValidPlate("AA-00-AA")).toBe(true); // letters-numbers-letters
    expect(isValidPlate("00-AA-00")).toBe(true); // numbers-letters-numbers
    expect(isValidPlate("AA-AA-00")).toBe(true); // newer format
    expect(isValidPlate("ABCDEF")).toBe(true);   // 6 chars, no dashes
    expect(isValidPlate("ABCDEFGH")).toBe(true); // 8 chars, no dashes
  });

  test("isValidPlate is case-insensitive", () => {
    expect(isValidPlate("aa-00-aa")).toBe(true);
    expect(isValidPlate("ab-12-cd")).toBe(true);
  });

  test("isValidPlate rejects invalid plates", () => {
    expect(isValidPlate("ABCDE")).toBe(false);     // too short (5)
    expect(isValidPlate("ABCDEFGHI")).toBe(false); // too long (9)
    expect(isValidPlate("AB-1!-CD")).toBe(false);  // special char
    expect(isValidPlate("")).toBe(false);           // empty
  });

  test("isValidSeatCount accepts valid seat count within max", () => {
    expect(isValidSeatCount("3", 4)).toEqual({ ok: true, seats: 3 });
    expect(isValidSeatCount("1", 4)).toEqual({ ok: true, seats: 1 });
    expect(isValidSeatCount("4", 4)).toEqual({ ok: true, seats: 4 }); // boundary
  });

  test("isValidSeatCount rejects non-integer values", () => {
    expect(isValidSeatCount("abc", 4)).toEqual({ ok: false, seats: 0, error: "Seats must be an integer" });
    expect(isValidSeatCount("1.5", 4)).toEqual({ ok: false, seats: 0, error: "Seats must be an integer" });
  });

  test("isValidSeatCount rejects zero or negative values", () => {
    expect(isValidSeatCount("0", 4)).toEqual({ ok: false, seats: 0, error: "Must allow at least 1 passenger" });
    expect(isValidSeatCount("-1", 4)).toEqual({ ok: false, seats: 0, error: "Must allow at least 1 passenger" });
  });

  test("isValidSeatCount rejects values exceeding max seats", () => {
    expect(isValidSeatCount("5", 4)).toEqual({ ok: false, seats: 0, error: "Max passengers: 4" });
  });
});
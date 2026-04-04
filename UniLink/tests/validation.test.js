import {
  isValidEmail,
  isPasswordStrong,
  doPasswordsMatch,
  areRequiredFieldsFilled,
} from "../utils/validation";

describe("Validation Utilities", () => {
  test("isValidEmail validates formats correctly", () => {
    expect(isValidEmail("test@feup.pt")).toBe(true);
    expect(isValidEmail("test@gmail.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("test@com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  test("isPasswordStrong checks minimum length", () => {
    expect(isPasswordStrong("1234")).toBe(true);
    expect(isPasswordStrong("abcde")).toBe(true);
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
});
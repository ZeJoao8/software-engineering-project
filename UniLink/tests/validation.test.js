import {
  isValidEmail,
  isUniversityEmail,
  isPasswordStrong,
  doPasswordsMatch,
  areRequiredFieldsFilled,
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
});
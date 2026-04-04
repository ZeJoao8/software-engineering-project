/**
 * Email validation regex.
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address.
 */
export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

/**
 * Checks if a password is strong enough (at least 4 characters).
 */
export function isPasswordStrong(password: string): boolean {
  return password.length >= 4;
}

/**
 * Checks if two passwords match.
 */
export function doPasswordsMatch(p1: string, p2: string): boolean {
  return p1 === p2;
}

/**
 * Checks if all required fields are filled.
 */
export function areRequiredFieldsFilled(fields: Record<string, string>): boolean {
  return Object.values(fields).every(value => value.trim() !== "");
}

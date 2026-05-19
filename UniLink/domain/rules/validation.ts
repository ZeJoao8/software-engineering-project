export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const universityEmailRegex = /^[^\s@]+@([a-z]+\.)?up\.pt$/i;
export const plateRegex = /^[A-Z0-9-]{6,8}$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email.trim());
}

export function isUniversityEmail(email: string): boolean {
  return universityEmailRegex.test(email.trim());
}

export function isPasswordStrong(password: string): boolean {
  return password.length >= 8;
}

export function doPasswordsMatch(p1: string, p2: string): boolean {
  return p1 === p2;
}

export function areRequiredFieldsFilled(fields: Record<string, string>): boolean {
  return Object.values(fields).every(value => value.trim() !== "");
}

export function isValidPlate(plate: string): boolean {
  return plateRegex.test(plate.toUpperCase().replace(/\s/g, ""));
}

export function isValidSeatCount(
  value: string,
  maxSeats: number
): { ok: boolean; seats: number; error?: string } {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    return { ok: false, seats: 0, error: "Seats must be an integer" };
  }
  if (n < 1) {
    return { ok: false, seats: 0, error: "Must allow at least 1 passenger" };
  }
  if (n > maxSeats) {
    return { ok: false, seats: 0, error: `Max passengers: ${maxSeats}` };
  }
  return { ok: true, seats: n };
}
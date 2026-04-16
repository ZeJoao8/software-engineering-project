/** Matches standard email format. */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** University email must end with @up.pt (covers @fe.up.pt, @fc.up.pt, etc.) */
export const universityEmailRegex = /^[^\s@]+@([a-z]+\.)?up\.pt$/i;

/** Portuguese / common EU plate: 6–8 alphanumeric chars / hyphens, no spaces. */
export const plateRegex = /^[A-Z0-9-]{6,8}$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function isUniversityEmail(email: string): boolean {
  return universityEmailRegex.test(email);
}

export function isPasswordStrong(password: string): boolean {
  return password.length >= 4;
}

export function doPasswordsMatch(p1: string, p2: string): boolean {
  return p1 === p2;
}

export function areRequiredFieldsFilled(
  fields: Record<string, string>
): boolean {
  return Object.values(fields).every(v => v.trim() !== "");
}

export function isValidPlate(plate: string): boolean {
  return plateRegex.test(plate.toUpperCase().replace(/\s/g, ""));
}

/**
 * Seats offered must be an integer in [1, maxSeats].
 * maxSeats is typically car.seatCapacity - 1.
 */
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
import * as UserRepo from "../repositories/UserRepository";
import { setCurrentUser } from "../store/authStore";
import type { User } from "../domain/entities/User";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function updateProfile(user: User): Promise<Result> {
  const trimmed: User = {
    ...user,
    name: user.name.trim(),
    university: user.university.trim(),
    course: user.course.trim(),
  };
  try {
    await UserRepo.update(trimmed);
    setCurrentUser(trimmed);
    return { ok: true };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "permission-denied")
      return { ok: false, error: "Permission denied. Check Firestore rules." };
    if (code === "unavailable")
      return { ok: false, error: "Server unavailable. Try again in a moment." };
    return { ok: false, error: "Could not save profile. Please try again." };
  }
}

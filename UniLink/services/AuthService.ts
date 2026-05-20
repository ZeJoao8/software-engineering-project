import * as AuthRepo from "../repositories/AuthRepository";
import * as UserRepo from "../repositories/UserRepository";
import {
  setCurrentUser,
  setPendingProfileUid,
  refreshUsersCache,
} from "../store/authStore";
import type { User } from "../domain/entities/User";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

function authError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password";
    case "auth/email-already-in-use":
      return "Email already exists";
    case "auth/invalid-email":
      return "Invalid email format";
    case "auth/weak-password":
      return "Password must have at least 6 characters";
    case "auth/missing-password":
      return "Password is required";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again";
    default:
      return "Something went wrong. Please try again";
  }
}

function firestoreError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "permission-denied":
      return "Firestore denied access.";
    case "unavailable":
      return "Server unavailable. Try again in a moment.";
    default:
      return "Could not save your profile. Please try again";
  }
}

export async function login(
  email: string,
  password: string
): Promise<Result> {
  try {
    const firebaseUser = await AuthRepo.signIn(
      email.toLowerCase().trim(),
      password
    );
    const profile = await UserRepo.getById(firebaseUser.uid);
    if (!profile) {
      await AuthRepo.signOutUser();
      return { ok: false, error: "Account found but profile is missing. Contact support." };
    }
    setCurrentUser(profile);
    try { await refreshUsersCache(); } catch { /* non-fatal */ }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: authError(error) };
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  university: string,
  course: string,
  gender: "Male" | "Female"
): Promise<Result<User>> {
  let firebaseUser: Awaited<ReturnType<typeof AuthRepo.signUp>> | null = null;
  try {
    const normalizedEmail = email.toLowerCase().trim();
    firebaseUser = await AuthRepo.signUp(normalizedEmail, password);
    setPendingProfileUid(firebaseUser.uid);

    const newUser: User = {
      uid: firebaseUser.uid,
      name: name.trim(),
      email: normalizedEmail,
      university: university.trim(),
      course: course.trim(),
      gender,
    };

    await UserRepo.create(newUser);
    setCurrentUser(newUser);
    try { await refreshUsersCache(); } catch { /* non-fatal */ }
    return { ok: true, data: newUser };
  } catch (error) {
    if (firebaseUser) {
      try { await AuthRepo.deleteAuthUser(firebaseUser); } catch { /* best-effort cleanup */ }
    }
    const msg = firebaseUser
      ? firestoreError(error)
      : authError(error);
    return { ok: false, error: msg };
  } finally {
    setPendingProfileUid(null);
  }
}

export async function logout(): Promise<Result> {
  try {
    await AuthRepo.signOutUser();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: authError(error) };
  }
}

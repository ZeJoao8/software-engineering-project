import * as UserRepo from "../repositories/UserRepository";
import * as ReviewRepo from "../repositories/ReviewRepository";
import * as CarRepo from "../repositories/CarRepository";
import { setCurrentUser } from "../store/authStore";
import type { User } from "../domain/entities/User";
import type { Review } from "../domain/entities/Review";
import type { Car } from "../domain/entities/Car";
import type { Ride } from "../domain/entities/Ride";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function getPublicProfile(
  userId: string,
  rides: Ride[]
): Promise<{ reviews: Review[]; cars: Car[] }> {
  const reviews = await ReviewRepo.fetchByReviewee(userId);
  const driverCarIds = [
    ...new Set(
      rides.filter(r => r.driverId === userId && r.carId).map(r => r.carId)
    ),
  ];
  const carResults = await Promise.all(
    driverCarIds.map(cid => CarRepo.getById(cid!))
  );
  const cars = carResults.filter((c): c is Car => c !== null);
  return { reviews, cars };
}

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

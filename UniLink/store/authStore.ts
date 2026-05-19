import * as AuthRepo from "../repositories/AuthRepository";
import * as UserRepo from "../repositories/UserRepository";
import type { User } from "../domain/entities/User";

let currentUser: User | null = null;
let users: User[] = [];
let authReady = false;
let pendingProfileUid: string | null = null;

const listeners = new Set<() => void>();

let resolveAuthReady: (() => void) | null = null;
const authReadyPromise = new Promise<void>(resolve => {
  resolveAuthReady = resolve;
});

function notifyListeners() {
  listeners.forEach(l => l());
}

function finishAuthBoot() {
  if (!authReady) {
    authReady = true;
    resolveAuthReady?.();
    resolveAuthReady = null;
  }
  notifyListeners();
}

function upsertUser(user: User) {
  users = [user, ...users.filter(u => u.uid !== user.uid)];
}

AuthRepo.onAuthChanged(async firebaseUser => {
  try {
    if (!firebaseUser) {
      currentUser = null;
      users = [];
      return;
    }

    const profile = await UserRepo.getById(firebaseUser.uid);

    if (!profile) {
      if (pendingProfileUid !== firebaseUser.uid) {
        console.warn("Authenticated user has no Firestore profile", firebaseUser.uid);
      }
      return;
    }

    currentUser = profile;
    upsertUser(profile);

    try {
      users = await UserRepo.getAll();
    } catch (error) {
      console.warn("Could not refresh users cache", error);
    }
  } catch (error) {
    console.error("Auth sync failed", error);
  } finally {
    finishAuthBoot();
  }
});

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getUsers(): User[] {
  return users;
}

export function getUserById(id: string): User | null {
  return users.find(u => u.uid === id) ?? null;
}

export function isAuthReady(): boolean {
  return authReady;
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function waitForAuthReady(): Promise<void> {
  await authReadyPromise;
}

export function setPendingProfileUid(uid: string | null): void {
  pendingProfileUid = uid;
}

export function setCurrentUser(user: User): void {
  currentUser = user;
  upsertUser(user);
  notifyListeners();
}

export function refreshUsersCache(): Promise<void> {
  return UserRepo.getAll().then(all => { users = all; });
}

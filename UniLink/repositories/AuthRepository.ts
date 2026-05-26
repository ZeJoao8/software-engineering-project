import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import type { Unsubscribe } from "firebase/firestore";

import { auth } from "../infra/firebase";

export async function signIn(
  email: string,
  password: string
): Promise<FirebaseAuthUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUp(
  email: string,
  password: string
): Promise<FirebaseAuthUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function deleteAuthUser(
  user: FirebaseAuthUser
): Promise<void> {
  await deleteUser(user);
}

export function onAuthChanged(
  callback: (user: FirebaseAuthUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

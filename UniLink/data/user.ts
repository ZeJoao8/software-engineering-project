import { Alert } from "react-native";

import {
 createUserWithEmailAndPassword,
 deleteUser as deleteAuthUser,
 onAuthStateChanged,
 signInWithEmailAndPassword,
 signOut,
 type User as FirebaseAuthUser,
} from "firebase/auth";

import {
 collection,
 doc,
 getDoc,
 getDocs,
 setDoc,
 updateDoc,
} from "firebase/firestore";

import { auth, db } from "../infra/firebase";
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
 listeners.forEach(listener => listener());
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
 users = [
  user,
  ...users.filter(
   existing => existing.uid !== user.uid
  ),
 ];
}

function mapFirestoreUser(
 id: string,
 data: Omit<User, "uid">
): User {
 return {
  uid: id,
  ...data,
 };
}

async function loadUsersCache() {
 const snapshot =
  await getDocs(collection(db, "users"));

 users = snapshot.docs.map(document =>
  mapFirestoreUser(
   document.id,
   document.data() as Omit<User, "uid">
  )
 );
}

async function loadUserProfile(uid: string) {
 const snapshot =
  await getDoc(doc(db, "users", uid));

 if (!snapshot.exists()) {
  currentUser = null;
  return null;
 }

 currentUser = mapFirestoreUser(
  snapshot.id,
  snapshot.data() as Omit<User, "uid">
 );

 upsertUser(currentUser);

 return currentUser;
}

function getFirestoreErrorMessage(error: unknown) {
 const code =
  (error as { code?: string })?.code;

 switch (code) {
  case "permission-denied":
   return "Firestore denied access. Check Firestore Rules for this collection.";
  case "unavailable":
   return "Firestore is unavailable right now. Try again in a moment.";
  default:
   return "Could not read or write the user profile in Firestore.";
 }
}

function getAuthErrorMessage(error: unknown) {
 const code =
  (error as { code?: string })?.code;

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

async function syncSignedInUser(
 firebaseUser: FirebaseAuthUser
) {
 const profile =
  await loadUserProfile(firebaseUser.uid);

 if (!profile) {
  if (pendingProfileUid !== firebaseUser.uid) {
   console.warn(
    "Authenticated user has no Firestore profile",
    firebaseUser.uid
   );
  }

  return;
 }

 try {
  await loadUsersCache();
 } catch (error) {
  console.warn(
   "Could not refresh users cache",
   error
  );
 }
}

onAuthStateChanged(auth, firebaseUser => {
 void (async () => {
  try {
   if (!firebaseUser) {
    currentUser = null;
    users = [];
    return;
   }

   await syncSignedInUser(firebaseUser);
  } catch (error) {
   console.error("Auth sync failed", error);
  } finally {
   finishAuthBoot();
  }
 })();
});

export function getUsers() {
 return users;
}

export function getUserById(id: string) {
 return users.find(user => user.uid === id) ?? null;
}

export function getCurrentUser() {
 return currentUser;
}

export function isAuthReady() {
 return authReady;
}

export function subscribeToAuthChanges(
 listener: () => void
) {
 listeners.add(listener);

 return () => {
  listeners.delete(listener);
 };
}

export async function waitForAuthReady() {
 await authReadyPromise;
}

export async function loginUser(
 email: string,
 password: string
) {
 try {
  const normalizedEmail =
   email.toLowerCase().trim();

  const credential =
   await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
   );

  const profile =
   await loadUserProfile(
    credential.user.uid
   );

  if (!profile) {
   await signOut(auth);

   Alert.alert(
    "Login failed",
    "Login succeeded, but no user profile was found in Firestore for this account."
   );

   return false;
  }

  try {
   await loadUsersCache();
  } catch (error) {
   console.warn(
    "Could not refresh users cache",
    error
   );
  }

  notifyListeners();

  return true;
 } catch (error) {
  Alert.alert(
   "Login failed",
   getAuthErrorMessage(error)
  );

  return false;
 }
}

export async function registerUser(
 name: string,
 email: string,
 password: string,
 university: string,
 course: string,
 gender: "Male" | "Female"
) {
 let credential:
  | Awaited<
     ReturnType<
      typeof createUserWithEmailAndPassword
     >
    >
  | null = null;

 try {
  const normalizedEmail =
   email.toLowerCase().trim();

  credential =
   await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
   );

  pendingProfileUid =
   credential.user.uid;

  const newUser: User = {
   uid: credential.user.uid,
   name: name.trim(),
   email: normalizedEmail,
   university: university.trim(),
   course: course.trim(),
   gender,
  };

  await setDoc(
   doc(db, "users", newUser.uid),
   {
    name: newUser.name,
    email: newUser.email,
    university: newUser.university,
    course: newUser.course,
    gender: newUser.gender,
   }
  );

  currentUser = newUser;
  upsertUser(newUser);

  try {
   await loadUsersCache();
  } catch (error) {
   console.warn(
    "Could not refresh users cache",
    error
   );
  }

  notifyListeners();

  return newUser;
 } catch (error) {
  if (credential?.user) {
   try {
    await deleteAuthUser(credential.user);
   } catch (cleanupError) {
    console.warn(
     "Could not remove orphan auth user",
     cleanupError
    );
   }
  }

  Alert.alert(
   credential
    ? "Profile setup failed"
    : "Error",
   credential
    ? getFirestoreErrorMessage(error)
    : getAuthErrorMessage(error)
  );

  return null;
 } finally {
  pendingProfileUid = null;
 }
}

export async function logoutUser() {
 try {
  await signOut(auth);
 } finally {
  currentUser = null;
  users = [];
  notifyListeners();
 }
}

export async function updateUser(
 updatedUser: User
) {
 try {
  await updateDoc(
   doc(db, "users", updatedUser.uid),
   {
    name: updatedUser.name.trim(),
    university: updatedUser.university.trim(),
    course: updatedUser.course.trim(),
    gender: updatedUser.gender,
   }
  );
 } catch (error) {
  Alert.alert(
   "Profile update failed",
   getFirestoreErrorMessage(error)
  );
  return;
 }

 currentUser = {
  ...updatedUser,
  name: updatedUser.name.trim(),
  university: updatedUser.university.trim(),
  course: updatedUser.course.trim(),
 };

 upsertUser(currentUser);
 notifyListeners();
}

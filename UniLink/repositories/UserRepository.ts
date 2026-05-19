import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { User } from "../domain/entities/User";

function mapDoc(id: string, data: Omit<User, "uid">): User {
  return { uid: id, ...data };
}

export async function getById(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return mapDoc(snapshot.id, snapshot.data() as Omit<User, "uid">);
}

export async function getAll(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(d => mapDoc(d.id, d.data() as Omit<User, "uid">));
}

export async function create(user: User): Promise<void> {
  await setDoc(doc(db, "users", user.uid), {
    name: user.name,
    email: user.email,
    university: user.university,
    course: user.course,
    gender: user.gender,
  });
}

export async function update(user: User): Promise<void> {
  await updateDoc(doc(db, "users", user.uid), {
    name: user.name.trim(),
    university: user.university.trim(),
    course: user.course.trim(),
    gender: user.gender,
  });
}

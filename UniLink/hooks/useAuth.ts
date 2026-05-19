import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getUsers,
  getUserById,
  isAuthReady,
  subscribeToAuthChanges,
} from "../store/authStore";
import type { User } from "../domain/entities/User";

export function useAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser);
  const [ready, setReady] = useState<boolean>(isAuthReady);

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setUser(getCurrentUser());
      setReady(isAuthReady());
    });
  }, []);

  return { user, isReady: ready, getUsers, getUserById };
}
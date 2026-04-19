import {
  getCurrentUser,
  isAuthReady,
  logoutUser,
  getUsers,
  getUserById
} from "../data/user";

import { signOut } from "firebase/auth";

// Mock Firebase Auth
jest.mock("../lib/firebase", () => ({
  auth: {},
  db: {}
}));

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe("User Data Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("logoutUser calls signOut", async () => {
    await logoutUser();
    expect(signOut).toHaveBeenCalled();
  });

  test("getCurrentUser initially returns null", () => {
    expect(getCurrentUser()).toBeNull();
  });

  test("getUsers initially returns an empty array", () => {
    expect(getUsers()).toEqual([]);
  });
});

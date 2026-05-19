import { addRide, getRides, deleteRide } from "../data/rides";
import { setDoc, doc, deleteDoc } from "firebase/firestore";

// Mock Firebase
jest.mock("../infra/firebase", () => ({
  db: {}
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(),
}));

jest.mock("../data/user", () => ({
  getCurrentUser: jest.fn(() => ({ uid: "test-user" })),
  isAuthReady: jest.fn(() => true),
  subscribeToAuthChanges: jest.fn(),
}));

jest.mock("../data/chat", () => ({
  deleteMessagesForRide: jest.fn(() => Promise.resolve()),
}));

describe("Rides Data Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addRide calls setDoc and updates local state", async () => {
    const newRide = { id: "ride-1", driverId: "test-user", passengers: [], completed: false };
    
    await addRide(newRide);
    
    expect(setDoc).toHaveBeenCalled();
    expect(getRides()).toContainEqual(newRide);
  });

  test("deleteRide calls deleteDoc and updates local state", async () => {
    const rideToDelete = { id: "ride-2", driverId: "test-user", passengers: [], completed: false };
    // Inject into local state
    await addRide(rideToDelete);
    
    await deleteRide("ride-2");
    
    expect(deleteDoc).toHaveBeenCalled();
    expect(getRides()).not.toContainEqual(rideToDelete);
  });
});

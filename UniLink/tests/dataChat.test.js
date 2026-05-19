import { sendMessage, deleteMessagesForRide, subscribeToRideChat } from "../data/chat";
import { setDoc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";
import { getCurrentUser, isAuthReady } from "../data/user";

// Mock Firebase
jest.mock("../infra/firebase", () => ({
  db: {}
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(),
}));

jest.mock("../data/user", () => ({
  getCurrentUser: jest.fn(),
  isAuthReady: jest.fn(() => true),
}));

describe("Chat Data Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sendMessage calls setDoc when user is authenticated and senderId matches", async () => {
    const mockUser = { uid: "user-123" };
    getCurrentUser.mockReturnValue(mockUser);

    const message = {
      id: "msg-1",
      rideId: "ride-1",
      senderId: "user-123",
      text: "Hello",
      createdAt: new Date().toISOString()
    };

    await sendMessage(message);

    expect(setDoc).toHaveBeenCalled();
  });

  test("sendMessage does not call setDoc if senderId mismatches", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const mockUser = { uid: "user-123" };
    getCurrentUser.mockReturnValue(mockUser);

    const message = {
      id: "msg-1",
      rideId: "ride-1",
      senderId: "user-456", // Mismatch
      text: "Hello",
      createdAt: new Date().toISOString()
    };

    await sendMessage(message);

    expect(setDoc).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("deleteMessagesForRide calls deleteDoc for all messages found", async () => {
    // Mock getDocs to return 2 fake documents
    const fakeDocs = [
      { ref: "ref1" },
      { ref: "ref2" }
    ];
    getDocs.mockResolvedValueOnce({ docs: fakeDocs });

    await deleteMessagesForRide("ride-1");

    expect(getDocs).toHaveBeenCalled();
    expect(deleteDoc).toHaveBeenCalledTimes(2);
  });

  test("subscribeToRideChat returns null if user is not authenticated", () => {
    getCurrentUser.mockReturnValue(null);
    isAuthReady.mockReturnValue(true);

    const unsubscribe = subscribeToRideChat("ride-1", jest.fn());

    expect(unsubscribe).toBeNull();
    expect(onSnapshot).not.toHaveBeenCalled();
  });
});

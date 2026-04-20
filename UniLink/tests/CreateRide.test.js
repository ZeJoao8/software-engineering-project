import { render } from "@testing-library/react-native";
import CreateRide from "../app/(tabs)/createRide";
import { getCurrentUser } from "../data/user";
import { getUserCars, subscribeToCarsChanges } from "../data/cars";

// Mock Firebase
jest.mock("../lib/firebase", () => ({
  db: {},
  auth: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock hooks
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  useFocusEffect: jest.fn(),
}));

import { useFocusEffect } from "expo-router";
import { useEffect } from "react";

// Make useFocusEffect behave like useEffect with an empty dependency array
useFocusEffect.mockImplementation((cb) => useEffect(cb, []));

// Mock data layer
jest.mock("../data/user", () => ({
  getCurrentUser: jest.fn(),
  subscribeToAuthChanges: jest.fn(),
  isAuthReady: jest.fn(() => true),
}));

jest.mock("../data/cars", () => ({
  getUserCars: jest.fn(),
  subscribeToCarsChanges: jest.fn(() => jest.fn()), // returns unsubscribe func
}));

describe("CreateRide Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders 'No car available' if the user has no cars", () => {
    getCurrentUser.mockReturnValue({ uid: "user-123", gender: "Male" });
    getUserCars.mockReturnValue([]); // No cars

    const { getByText } = render(<CreateRide />);

    expect(getByText("No car available")).toBeTruthy();
    expect(getByText("You need to add a car before creating a ride.")).toBeTruthy();
  });

  test("renders normal form if user has cars", () => {
    getCurrentUser.mockReturnValue({ uid: "user-123", gender: "Male" });
    getUserCars.mockReturnValue([
      { id: "car-1", model: "Tesla", licensePlate: "AA-11-AA", seatCapacity: 4 }
    ]);

    const { getByText, queryByText } = render(<CreateRide />);

    expect(queryByText("No car available")).toBeNull();
    expect(getByText("Origin")).toBeTruthy();
    expect(getByText("Destination")).toBeTruthy();
  });
});

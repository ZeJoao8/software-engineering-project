import { render } from "@testing-library/react-native";
import CreateRide from "../../app/createRide";

jest.mock("../../infra/firebase", () => ({ db: {}, auth: {}, generateId: jest.fn(() => "mock-id") }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(), doc: jest.fn(), query: jest.fn(), where: jest.fn(),
  getDocs: jest.fn(), setDoc: jest.fn(), deleteDoc: jest.fn(), onSnapshot: jest.fn(), orderBy: jest.fn(),
}));
jest.mock("firebase/auth", () => ({ getAuth: jest.fn(), onAuthStateChanged: jest.fn() }));
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  useFocusEffect: jest.fn(),
}));
jest.mock("../../hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("../../hooks/useCars", () => ({ useCars: jest.fn() }));
jest.mock("../../services/RideService", () => ({ createRide: jest.fn(() => Promise.resolve({ ok: true })) }));

import { useFocusEffect } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCars } from "../../hooks/useCars";

useFocusEffect.mockImplementation((cb) => useEffect(cb, []));

beforeEach(() => {
  jest.clearAllMocks();
  useFocusEffect.mockImplementation((cb) => useEffect(cb, []));
});

describe("CreateRide Screen", () => {
  test("shows 'No car available' message when user has no cars", () => {
    useAuth.mockReturnValue({ user: { uid: "user-123", gender: "Male" }, isReady: true, getUsers: jest.fn(), getUserById: jest.fn() });
    useCars.mockReturnValue({ cars: [], getUserCars: jest.fn(() => []) });

    const { getByText } = render(<CreateRide />);
    expect(getByText("No car available")).toBeTruthy();
    expect(getByText("You need to add a car before creating a ride.")).toBeTruthy();
  });

  test("renders the create form when user has cars", () => {
    useAuth.mockReturnValue({ user: { uid: "user-123", gender: "Male" }, isReady: true, getUsers: jest.fn(), getUserById: jest.fn() });
    useCars.mockReturnValue({
      cars: [{ id: "car-1", model: "Tesla", licensePlate: "AA-11-AA", seatCapacity: 4 }],
      getUserCars: jest.fn(() => [{ id: "car-1", model: "Tesla", licensePlate: "AA-11-AA", seatCapacity: 4 }]),
    });

    const { queryByText, getByText } = render(<CreateRide />);
    expect(queryByText("No car available")).toBeNull();
    expect(getByText("Origin")).toBeTruthy();
    expect(getByText("Destination")).toBeTruthy();
  });
});

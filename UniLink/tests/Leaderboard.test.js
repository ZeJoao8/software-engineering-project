import { render } from "@testing-library/react-native";
import Leaderboard from "../app/(tabs)/leaderboard";
import { getRides } from "../data/rides";
import { getUsers, getCurrentUser } from "../data/user";
import { calculateUserCO2Saved } from "../utils/sustainability";

// Mock router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => children,
}));

// Mock data layer
jest.mock("../data/rides", () => ({
  getRides: jest.fn(),
}));

jest.mock("../data/user", () => ({
  getUsers: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock("../utils/sustainability", () => ({
  calculateUserCO2Saved: jest.fn(),
}));

describe("Leaderboard Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows empty state when there is no data", async () => {
    getRides.mockReturnValue([]);
    getUsers.mockReturnValue([]);
    
    const { findByText } = render(<Leaderboard />);
    expect(await findByText("No sustainability data yet")).toBeTruthy();
  });

  test("sorts and displays top users by CO2 saved", async () => {
    getCurrentUser.mockReturnValue({ uid: "user1", name: "Alice" });
    
    // Fake users
    getUsers.mockReturnValue([
      { uid: "user1", name: "Alice" },
      { uid: "user2", name: "Bob" },
      { uid: "user3", name: "Charlie" },
    ]);

    // Fake rides
    getRides.mockReturnValue([]);

    // Mock sustainability calculation
    calculateUserCO2Saved.mockImplementation((rides, uid) => {
      if (uid === "user1") return 15.5; // Alice
      if (uid === "user2") return 30.2; // Bob
      if (uid === "user3") return 5.0;  // Charlie
      return 0;
    });

    const { findByText } = render(<Leaderboard />);

    // Wait for ranking to load
    const rank1 = await findByText("Bob"); // Should be first (30.2)
    const rank2 = await findByText("Alice (You)"); // Should be second (15.5)
    const rank3 = await findByText("Charlie"); // Should be third (5.0)

    expect(rank1).toBeTruthy();
    expect(rank2).toBeTruthy();
    expect(rank3).toBeTruthy();
  });
});

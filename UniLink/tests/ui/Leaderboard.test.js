import { render } from "@testing-library/react-native";
import Leaderboard from "../../app/(tabs)/leaderboard";
import { useAuth } from "../../hooks/useAuth";
import { useRides } from "../../hooks/useRides";
import { calculateUserCO2Saved } from "../../domain/rules/sustainability";

jest.mock("expo-router", () => ({ useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })) }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: ({ children }) => children }));
jest.mock("../../hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("../../hooks/useRides", () => ({ useRides: jest.fn() }));
jest.mock("../../domain/rules/sustainability", () => ({ calculateUserCO2Saved: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

describe("Leaderboard Screen", () => {
  test("shows empty state when there is no data", async () => {
    useAuth.mockReturnValue({ user: null, getUsers: jest.fn(() => []), isReady: true });
    useRides.mockReturnValue([]);
    const { findByText } = render(<Leaderboard />);
    expect(await findByText("No sustainability data yet")).toBeTruthy();
  });

  test("sorts and displays top users by CO2 saved", async () => {
    const users = [
      { uid: "user1", name: "Alice" },
      { uid: "user2", name: "Bob" },
      { uid: "user3", name: "Charlie" },
    ];
    useAuth.mockReturnValue({ user: { uid: "user1", name: "Alice" }, getUsers: jest.fn(() => users), isReady: true });
    useRides.mockReturnValue([]);
    calculateUserCO2Saved.mockImplementation((_rides, uid) => {
      if (uid === "user1") return 15.5;
      if (uid === "user2") return 30.2;
      if (uid === "user3") return 5.0;
      return 0;
    });

    const { findByText } = render(<Leaderboard />);
    expect(await findByText("Bob")).toBeTruthy();
    expect(await findByText("Alice (You)")).toBeTruthy();
    expect(await findByText("Charlie")).toBeTruthy();
  });
});

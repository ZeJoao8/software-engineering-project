import { render } from "@testing-library/react-native";
import RideCard from "../components/rideCard";

// Mock data services to avoid importing real Firebase/Auth
jest.mock("../data/user", () => ({
  getCurrentUser: jest.fn(() => ({ uid: "test-user" })),
  getUserById: jest.fn(),
}));

jest.mock("../data/reports", () => ({
  getReports: jest.fn(() => []),
}));

jest.mock("../data/reviews", () => ({
  getReviews: jest.fn(() => []),
  getReviewsForUser: jest.fn(() => []),
}));

const ride = {
  id: "1",
  origin: "FEUP",
  destination: "Boavista",
  departureDateTime: new Date().toISOString(),
  availableSeats: 2,
  totalSeats: 3,
  womenOnly: false,
  completed: false,
  passengers: [],
  driverId: "driver-1"
};

test("renders route", () => {

  const { getByText } =
    render(
      <RideCard
        ride={ride}
        onPress={() => { }}
      />
    );

  expect(
    getByText("FEUP → Boavista")
  ).toBeTruthy();

});

test("shows women only label", () => {

  const { getByText } =
    render(
      <RideCard
        ride={{
          ...ride,
          womenOnly: true
        }}
        onPress={() => { }}
      />
    );

  expect(
    getByText("♀️")
  ).toBeTruthy();

});
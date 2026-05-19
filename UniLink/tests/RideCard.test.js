import { render } from "@testing-library/react-native";
import RideCard from "../components/rideCard";

jest.mock("../hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "test-user" },
    getUserById: jest.fn(),
    isReady: true,
  })),
}));

jest.mock("../hooks/useReviews", () => ({
  useReviews: jest.fn(() => ({
    reviews: [],
    getReviewsForUser: jest.fn(() => []),
    hasReviewForRide: jest.fn(() => false),
  })),
}));

jest.mock("../hooks/useReports", () => ({
  useReports: jest.fn(() => ({
    reports: [],
    getReportsForUser: jest.fn(() => []),
    hasReportForRide: jest.fn(() => false),
  })),
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

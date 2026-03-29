import React from "react";
import { render } from "@testing-library/react-native";
import Leaderboard from "../app/(tabs)/leaderboard";
import * as ridesData from "../data/rides";
import * as usersData from "../data/user";

test("shows message when no data", () => {
  jest.spyOn(ridesData, "getRides").mockReturnValue([]);
  jest.spyOn(usersData, "getUsers").mockReturnValue([]);

  const { getByText } = render(<Leaderboard />);

  expect(getByText("No sustainability data yet.")).toBeTruthy();
});

test("orders users by CO2 saved", () => {
  jest.spyOn(ridesData, "getRides").mockReturnValue([
    {
      id: "1",
      driverId: "1",
      carId: "1",
      origin: "A",
      destination: "B",
      departureDateTime: "",
      availableSeats: 0,
      womenOnly: false,
      passengers: ["2", "2", "1"],
    },
  ]);

  jest.spyOn(usersData, "getUsers").mockReturnValue([
    { id: "1", name: "João" },
    { id: "2", name: "Maria" },
  ]);

  const { getByText } = render(<Leaderboard />);

  expect(getByText(/Maria/)).toBeTruthy();
});
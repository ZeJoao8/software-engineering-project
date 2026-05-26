import { getNotificationRoute } from "../../utils/notificationRoute";

describe("getNotificationRoute", () => {
  test("maps chat notifications to the ride chat", () => {
    expect(getNotificationRoute({
      id: "n1",
      userId: "u1",
      type: "chat_message",
      title: "New message",
      body: "Ride chat",
      rideId: "ride-1",
      read: false,
      createdAt: "2026-05-20T10:00:00.000Z",
    })).toBe("/chat/ride-1");
  });

  test("maps removed and cancelled ride notifications to My Rides", () => {
    expect(getNotificationRoute({
      id: "n2",
      userId: "u1",
      type: "ride_cancelled",
      title: "Cancelled",
      body: "Driver cancelled",
      rideId: "ride-2",
      read: false,
      createdAt: "2026-05-20T10:00:00.000Z",
    })).toBe("/(tabs)/myRides");

    expect(getNotificationRoute({
      id: "n3",
      userId: "u1",
      type: "passenger_removed",
      title: "Removed",
      body: "Removed from ride",
      rideId: "ride-3",
      read: false,
      createdAt: "2026-05-20T10:00:00.000Z",
    })).toBe("/(tabs)/myRides");
  });

  test("maps ride detail notifications to the ride details screen", () => {
    expect(getNotificationRoute({
      id: "n4",
      userId: "u1",
      type: "ride_completed",
      title: "Completed",
      body: "Rate your driver",
      rideId: "ride-4",
      read: false,
      createdAt: "2026-05-20T10:00:00.000Z",
    })).toBe("/ride/ride-4");
  });
});

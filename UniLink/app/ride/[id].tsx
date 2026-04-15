import { useEffect, useState } from "react";

import {
  View,
  Text,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getRides, updateRide, deleteRide } from "../../data/rides";
import { getCurrentUser, getUserById } from "../../data/user";
import { getCars } from "../../data/cars";
import { hasReviewForRide, getReviews } from "../../data/reviews";
import { hasReportForRide, subscribeToReportsChanges } from "../../data/reports";
import { subscribeToReviewsChanges } from "../../data/reviews";
import { formatDate } from "../../utils/date";

import { Picker } from "@react-native-picker/picker";

import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

import RouteMap from "../../components/RouteMap";

export default function RideDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id =
    typeof params.id === "string" ? params.id : undefined;

  const ride =
    id ? getRides().find(r => r.id === id) : undefined;

  const [editingCar, setEditingCar] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(
    ride?.carId
  );
  const [, setVersion] = useState(0);

  useEffect(() => {
    setSelectedCarId(ride?.carId);
  }, [ride?.carId]);

  useEffect(() => {
    const rerender = () => setVersion(v => v + 1);
    const unsubReports = subscribeToReportsChanges(rerender);
    const unsubReviews = subscribeToReviewsChanges(rerender);
    return () => {
      unsubReports();
      unsubReviews();
    };
  }, []);

  if (!ride) return null;

  const r = ride;
  const user = getCurrentUser();
  if (!user) return null;

  const activeUser = user;
  const cars = getCars();

  const driver = getUserById(r.driverId);

  const car = cars.find(c => c.id === r.carId);

  const passengers = ride.passengers
    .map(pid => getUserById(pid))
    .filter(Boolean);

  const isDriver =
    r.driverId === activeUser.uid ||
    r.driverId === activeUser.email;

  const joined =
    r.passengers.includes(activeUser.uid) ||
    r.passengers.includes(activeUser.email);

  const rideDate = new Date(r.departureDateTime);
  const now = new Date();
  const rideStarted = rideDate < now;

  const canComplete = isDriver && !r.completed;

  const canRateDriver =
    joined &&
    !isDriver &&
    r.completed &&
    !hasReviewForRide(
      r.id,
      activeUser.uid,
      driver?.uid ?? r.driverId,
      activeUser.email,
      r.driverId
    );

  const driverCars = cars.filter(
    c => c.ownerId === activeUser.uid || c.ownerId === activeUser.email
  );

  // comentários de reviews baixas desta ride
  const allReviews = getReviews();
  const lowRatingComments = allReviews.filter(review =>
    review.rideId === r.id &&
    review.comment.trim().length > 0 &&
    review.rating <= 2 &&
    (
      // driver vê todos os comentários sobre ele
      (isDriver && (review.revieweeId === activeUser.uid || review.revieweeId === activeUser.email)) ||
      // passageiro vê só o seu próprio comentário
      (joined && (review.reviewerId === activeUser.uid || review.reviewerId === activeUser.email))
    )
  );

  function canReportUser(targetId: string) {
    return (
      r.completed &&
      (isDriver || joined) &&
      targetId !== activeUser.uid &&
      targetId !== activeUser.email &&
      !hasReportForRide(
        r.id,
        activeUser.uid,
        targetId,
        activeUser.email,
        targetId
      )
    );
  }

  function alreadyReportedUser(targetId: string) {
    return hasReportForRide(
      r.id,
      activeUser.uid,
      targetId,
      activeUser.email,
      targetId
    );
  }

  function reserveSeat() {
    if (r.completed)
      return Alert.alert("Cannot reserve", "Ride already completed.");
    if (rideStarted)
      return Alert.alert("Cannot reserve", "Ride already started.");
    if (r.womenOnly && activeUser.gender !== "Female")
      return Alert.alert("Not allowed", "Ride restricted to women.");
    if (r.availableSeats <= 0)
      return Alert.alert("Ride full", "No seats available.");

    Alert.alert("Reserve seat", "Confirm reservation?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await updateRide({
            ...r,
            availableSeats: r.availableSeats - 1,
            passengers: [...r.passengers, activeUser.uid],
          });
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function cancelSeat() {
    if (rideStarted || r.completed)
      return Alert.alert("Cannot cancel", "Ride already started.");

    Alert.alert("Cancel reservation", "Cancel your seat?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          await updateRide({
            ...r,
            availableSeats: Math.min(r.availableSeats + 1, r.totalSeats),
            passengers: r.passengers.filter(
              p => p !== activeUser.uid && p !== activeUser.email
            ),
          });
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function cancelRide() {
    if (rideStarted || r.completed)
      return Alert.alert("Cannot cancel", "Ride already started.");

    Alert.alert("Cancel ride", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          await deleteRide(r.id);
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function completeRide() {
    if (!canComplete)
      return Alert.alert("Cannot complete", "Ride cannot be completed yet.");

    Alert.alert("Complete ride", "Mark as completed?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await updateRide({ ...r, completed: true });
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function removePassenger(passengerId: string) {
    if (rideStarted || r.completed)
      return Alert.alert("Cannot remove", "Ride already started.");

    Alert.alert("Remove passenger", "Remove passenger?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          await updateRide({
            ...r,
            passengers: r.passengers.filter(pid => pid !== passengerId),
            availableSeats: Math.min(r.availableSeats + 1, r.totalSeats),
          });
          router.replace(`/ride/${r.id}`);
        },
      },
    ]);
  }

  function changeCar() {
    const newCar = driverCars.find(c => c.id === selectedCarId);
    if (!newCar) return;

    const newLimit = Math.min(r.totalSeats, newCar.seatCapacity - 1);

    if (passengers.length > newLimit)
      return Alert.alert("Car too small");

    Alert.alert("Change car", "Confirm?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await updateRide({
            ...r,
            carId: newCar.id,
            totalSeats: newLimit,
            availableSeats: newLimit - passengers.length,
          });
          setEditingCar(false);
          router.replace(`/ride/${r.id}`);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={layout.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >

        <Text
          style={{
            color: colors.primary,
            marginBottom: spacing.sm,
            fontWeight: "600",
          }}
          onPress={() => router.back()}
        >
          ← Back
        </Text>

        {/* HEADER */}
        <View style={components.card}>
          <Text style={layout.title}>
            {ride.origin} → {ride.destination}
          </Text>
          <Text style={{ marginBottom: spacing.sm }}>
            {formatDate(ride.departureDateTime)}
          </Text>
          <Text style={{ fontWeight: "500", color: colors.textLight }}>
            {ride.totalSeats - ride.availableSeats} / {ride.totalSeats} seats
          </Text>
        </View>

        {/* MAP */}
        {ride.originCoords && ride.destinationCoords && (
          <View style={[components.card, { padding: 0 }]}>
            <RouteMap
              origin={ride.originCoords}
              destination={ride.destinationCoords}
              originLabel={ride.origin}
              destinationLabel={ride.destination}
              height={220}
              interactive
            />
          </View>
        )}

        {/* DRIVER */}
        <View style={components.card}>
          <Text style={layout.subtitle}>Driver</Text>

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text
                style={{ color: colors.primary, fontWeight: "600" }}
                onPress={() => {
                  if (driver?.uid === activeUser.uid)
                    router.push("/(tabs)/userProfile");
                  else
                    router.push(`/user/${driver?.uid}`);
                }}
              >
                {driver?.name}
              </Text>
              {alreadyReportedUser(driver?.uid ?? r.driverId) && (
                <Text style={{ fontSize: 14 }}>⚠️</Text>
              )}
            </View>

            {canReportUser(driver?.uid ?? r.driverId) && !isDriver && (
              <Pressable
                style={{
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/reportUser/[id]",
                    params: {
                      id: r.id,
                      targetUserId: driver?.uid ?? r.driverId,
                    },
                  })
                }
              >
                <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600" }}>
                  Report
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* CAR */}
        <View style={components.card}>
          <Text style={layout.subtitle}>Car</Text>

          {car ? (
            <>
              <Text>{car.model}</Text>
              <Text style={{ color: colors.textLight }}>{car.color}</Text>
              <Text style={{ fontWeight: "600", paddingBottom: spacing.sm }}>
                {car.licensePlate}
              </Text>

              {isDriver && !rideStarted && !r.completed && !editingCar && driverCars.length > 1 && (
                <Pressable
                  style={components.outlineButton}
                  onPress={() => setEditingCar(true)}
                >
                  <Text style={components.outlineButtonText}>Change car</Text>
                </Pressable>
              )}
            </>
          ) : (
            <Text style={{ color: colors.textLight }}>Vehicle unavailable</Text>
          )}
        </View>

        {/* PASSENGERS */}
        <View style={components.card}>
          <Text style={layout.subtitle}>Passengers</Text>

          {passengers.length === 0 && (
            <Text style={{ color: colors.textLight }}>No passengers yet</Text>
          )}

          {passengers.map(p => (
            <View
              key={p!.uid}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{ color: colors.primary, fontWeight: "500" }}
                  onPress={() => {
                    if (p!.uid === activeUser.uid)
                      router.push("/(tabs)/userProfile");
                    else
                      router.push(`/user/${p!.uid}`);
                  }}
                >
                  {p!.name}
                </Text>
                {alreadyReportedUser(p!.uid) && (
                  <Text style={{ fontSize: 14 }}>⚠️</Text>
                )}
              </View>

              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                {canReportUser(p!.uid) && (
                  <Pressable
                    style={{
                      backgroundColor: "#fee2e2",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                    onPress={() =>
                      router.push({
                        pathname: "/reportUser/[id]",
                        params: { id: r.id, targetUserId: p!.uid },
                      })
                    }
                  >
                    <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600" }}>
                      Report
                    </Text>
                  </Pressable>
                )}

                {isDriver && !rideStarted && !r.completed && (
                  <Text
                    style={{ color: colors.danger, fontWeight: "600" }}
                    onPress={() => removePassenger(p!.uid)}
                  >
                    Remove
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* LOW RATING COMMENTS */}
        {lowRatingComments.length > 0 && (
          <View style={components.card}>
            <Text style={layout.subtitle}>
              {isDriver ? "Feedback received" : "Your feedback"}
            </Text>
            {lowRatingComments.map(review => {
              const reviewer = getUserById(review.reviewerId);
              return (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: "#fef2f2",
                    borderRadius: 8,
                    padding: spacing.sm,
                    marginBottom: spacing.sm,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.danger,
                  }}
                >
                  {isDriver && (
                    <Text style={{ fontSize: 12, color: colors.textLight, marginBottom: 2 }}>
                      From {reviewer?.name ?? "passenger"}
                    </Text>
                  )}
                  <Text style={{ fontSize: 12, color: colors.textLight, marginBottom: 4 }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} · {review.rating}/5
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {review.comment}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* CHANGE CAR */}
        {editingCar && (
          <View style={components.card}>
            <Text style={layout.subtitle}>Select new car</Text>

            <View style={components.pickerWrapper}>
              <Picker
                selectedValue={selectedCarId}
                onValueChange={setSelectedCarId}
              >
                {driverCars.map(c => (
                  <Picker.Item
                    key={c.id}
                    label={`${c.model} (${c.licensePlate})`}
                    value={c.id}
                  />
                ))}
              </Picker>
            </View>

            <View style={{ height: spacing.sm }} />

            <Pressable style={components.button} onPress={changeCar}>
              <Text style={components.buttonText}>Save car</Text>
            </Pressable>

            <View style={{ height: spacing.sm }} />

            <Pressable
              style={components.outlineButton}
              onPress={() => setEditingCar(false)}
            >
              <Text style={components.outlineButtonText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* ACTIONS */}
        {!isDriver && !joined && !rideStarted && !r.completed && (
          <Pressable
            style={[components.button, { marginTop: spacing.md }]}
            onPress={reserveSeat}
          >
            <Text style={components.buttonText}>Reserve seat</Text>
          </Pressable>
        )}

        {joined && !isDriver && !rideStarted && !r.completed && (
          <Pressable
            style={[components.button, { marginTop: spacing.md }]}
            onPress={cancelSeat}
          >
            <Text style={components.buttonText}>Cancel reservation</Text>
          </Pressable>
        )}

        {isDriver && !rideStarted && !r.completed && !editingCar && (
          <Pressable
            style={[components.button, { marginTop: spacing.md }]}
            onPress={cancelRide}
          >
            <Text style={components.buttonText}>Cancel ride</Text>
          </Pressable>
        )}

        {canComplete && (
          <Pressable
            style={[components.button, { marginTop: spacing.md }]}
            onPress={completeRide}
          >
            <Text style={components.buttonText}>Complete ride</Text>
          </Pressable>
        )}

        {canRateDriver && (
          <Pressable
            style={[components.button, { marginTop: spacing.md }]}
            onPress={() =>
              router.push({
                pathname: "/review/[id]",
                params: { id: r.id, targetUserId: r.driverId },
              })
            }
          >
            <Text style={components.buttonText}>Rate driver</Text>
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
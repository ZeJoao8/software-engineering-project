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
import { getCars, fetchCarById } from "../../data/cars";
import type { Car } from "../../types/Car";
import { hasReviewForRide, getReviews } from "../../data/reviews";
import { hasReportForRide, getReports, subscribeToReportsChanges } from "../../data/reports";
import { subscribeToReviewsChanges } from "../../data/reviews";
import { subscribeToRidesChanges } from "../../data/rides";
import { formatDate } from "../../utils/date";
import { getRoute } from "../../utils/routing";
import type { User } from "../../types/User";

import DropDownPicker from "react-native-dropdown-picker";

import { Button } from "../../components/Button";
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
  const [selectedCarId, setSelectedCarId] = useState<string | null>(
    ride?.carId ?? null
  );
  const [carDropdownOpen, setCarDropdownOpen] = useState(false);
  const [, setVersion] = useState(0);
  const [rideCar, setRideCar] = useState<Car | null>(null);

  // Hooks must come before any conditional return (Rules of Hooks)
  useEffect(() => {
    setSelectedCarId(ride?.carId ?? null);
  }, [ride?.carId]);

  // Fetch the ride's car on-demand (the local cache only holds own cars now)
  useEffect(() => {
    if (!ride?.carId) return;
    fetchCarById(ride.carId).then(setRideCar);
  }, [ride?.carId]);

  useEffect(() => {
    const rerender = () => setVersion(v => v + 1);
    const unsubReports = subscribeToReportsChanges(rerender);
    const unsubReviews = subscribeToReviewsChanges(rerender);
    const unsubRides = subscribeToRidesChanges(rerender);
    return () => {
      unsubReports();
      unsubReviews();
      unsubRides();
    };
  }, []);

  // Early returns AFTER all hooks
  if (!ride) return null;

  const r = ride;
  const user = getCurrentUser();
  if (!user) return null;

  const activeUser = user;
  // getCars() now only contains the current user's own cars (filtered subscription)
  const driverCars = getCars();

  const driver = getUserById(r.driverId);
  const car = rideCar; // fetched on-demand via fetchCarById

  // Properly narrowed — no more non-null assertions on passenger items
  const passengers = ride.passengers
    .map(pid => getUserById(pid))
    .filter((p): p is User => p !== null);

  const isDriver = r.driverId === activeUser.uid;

  const joined = r.passengers.includes(activeUser.uid);

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
      driver?.uid ?? r.driverId
    );



  const allReviews = getReviews();

  const allFeedbackComments = allReviews.filter(review =>
    review.rideId === r.id &&
    review.comment.trim().length > 0 &&
    (
      (isDriver && review.revieweeId === activeUser.uid) ||
      (joined && review.reviewerId === activeUser.uid)
    )
  );

  function getFeedbackStyle(ratingValue: number) {
    if (ratingValue >= 4) {
      return {
        backgroundColor: colors.primarySoft,
        borderLeftColor: colors.primaryLight,
      };
    }
    if (ratingValue === 3) {
      return {
        backgroundColor: colors.warning,
        borderLeftColor: "#fde047", // yellow-400
      };
    }
    return {
      backgroundColor: colors.warningSoft,
      borderLeftColor: colors.dangerSoft,
    };
  }

  function getPassengerRatingForThisRide(passengerId: string) {
    return allReviews.find(
      review =>
        review.rideId === r.id &&
        review.reviewerId === passengerId
    );
  }

  const allReports = getReports();

  function hasEverReportedUser(targetId: string) {
    return allReports.some(
      report =>
        report.reporterId === activeUser.uid &&
        report.reportedUserId === targetId
    );
  }

  function canReportUser(targetId: string) {
    return (
      r.completed &&
      (isDriver || joined) &&
      targetId !== activeUser.uid &&
      !hasReportForRide(r.id, activeUser.uid, targetId)
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
            passengers: r.passengers.filter(p => p !== activeUser.uid),
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
          let distanceKm = r.distanceKm;

          if (!distanceKm && r.originCoords && r.destinationCoords) {
            const route = await getRoute(r.originCoords, r.destinationCoords);
            if (route) {
              distanceKm = route.distanceKm;
            }
          }

          await updateRide({ 
            ...r, 
            completed: true,
            distanceKm 
          });
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
              {hasEverReportedUser(driver?.uid ?? r.driverId) && (
                <Text style={{ fontSize: 14 }}>⚠️</Text>
              )}
            </View>

            {canReportUser(driver?.uid ?? r.driverId) && !isDriver && (
              <Pressable
                style={components.dangerTag}
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
        <View style={[components.card, { zIndex: editingCar ? 100 : 1 }]}>
          <Text style={layout.subtitle}>Car</Text>

          {!editingCar ? (
            <>
              {car ? (
                <>
                  <Text>{car.model}</Text>
                  <Text style={{ color: colors.textLight }}>{car.color}</Text>
                  <Text style={{ fontWeight: "600", paddingBottom: spacing.sm }}>
                    {car.licensePlate}
                  </Text>

                  {isDriver && !rideStarted && !r.completed && driverCars.length > 1 && (
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
            </>
          ) : (
            <View>
              <Text style={{ marginBottom: spacing.xs, fontWeight: "500" }}>Select new car</Text>
              <View style={components.pickerWrapper}>
                <DropDownPicker
                  open={carDropdownOpen}
                  value={selectedCarId}
                  items={driverCars.map(c => ({
                    label: `${c.model} (${c.licensePlate})`,
                    value: c.id
                  }))}
                  setOpen={setCarDropdownOpen}
                  setValue={setSelectedCarId}
                  placeholder="Select car"
                  style={components.dropdown}
                  dropDownContainerStyle={components.dropdownContainer}
                  textStyle={components.dropdownText}
                  placeholderStyle={components.dropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                />
              </View>

              <View style={{ height: spacing.md }} />

              <Pressable 
                style={components.button} 
                onPress={() => {
                  if (selectedCarId) changeCar();
                }}
              >
                <Text style={components.buttonText}>Save car</Text>
              </Pressable>

              <View style={{ height: spacing.xs }} />

              <Pressable
                style={components.outlineButton}
                onPress={() => setEditingCar(false)}
              >
                <Text style={components.outlineButtonText}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* PASSENGERS */}
        <View style={components.card}>
          <Text style={layout.subtitle}>Passengers</Text>

          {passengers.length === 0 && (
            <Text style={{ color: colors.textLight }}>No passengers yet</Text>
          )}

          {passengers.map(p => {
            const passengerReview = isDriver
              ? getPassengerRatingForThisRide(p.uid)
              : undefined;

            return (
              <View
                key={p.uid}
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
                      if (p.uid === activeUser.uid)
                        router.push("/(tabs)/userProfile");
                      else
                        router.push(`/user/${p.uid}`);
                    }}
                  >
                    {p.name}
                  </Text>

                  {hasEverReportedUser(p.uid) && (
                    <Text style={{ fontSize: 14 }}>⚠️</Text>
                  )}

                  {isDriver && r.completed && (
                    passengerReview ? (
                      <View style={{
                        backgroundColor: passengerReview.rating >= 4
                          ? colors.primaryLight
                          : passengerReview.rating === 3
                            ? colors.warning
                            : colors.dangerSoft,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 5,
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: "600" }}>
                          ⭐ {passengerReview.rating}/5
                        </Text>
                      </View>
                    ) : (
                      <View style={{
                        backgroundColor: colors.neutral,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 5,
                      }}>
                        <Text style={{ fontSize: 11, color: colors.textLight }}>
                          not rated yet
                        </Text>
                      </View>
                    )
                  )}
                </View>

                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  {canReportUser(p.uid) && (
                    <Pressable
                      style={components.dangerTag}
                      onPress={() =>
                        router.push({
                          pathname: "/reportUser/[id]",
                          params: { id: r.id, targetUserId: p.uid },
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
                      onPress={() => removePassenger(p.uid)}
                    >
                      Remove
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* RIDE FEEDBACK */}
        {allFeedbackComments.length > 0 && (
          <View style={components.card}>
            <Text style={layout.subtitle}>
              {isDriver ? "Feedback received" : "Your feedback"}
            </Text>
            {allFeedbackComments.map(review => {
              const reviewer = getUserById(review.reviewerId);
              return (
                <View 
                  key={review.id} 
                  style={[
                    components.feedbackCard, 
                    getFeedbackStyle(review.rating)
                  ]}
                >
                  {isDriver && (
                    <Text style={{ fontSize: 13, color: colors.text, fontWeight: "600", marginBottom: 2 }}>
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


        {/* ACTIONS */}
        {(isDriver || joined) && (
          <Pressable
            style={components.button}
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: r.id } })}
          >
            <Text style={components.buttonText}>Open Group Chat</Text>
          </Pressable>
        )}

        {!isDriver && !joined && !rideStarted && !r.completed && (
          <Button onPress={reserveSeat} style={[components.button, { marginTop: spacing.md }]}  label="Reserve seat" />
        )}

        {joined && !isDriver && !rideStarted && !r.completed && (
          <Button onPress={cancelSeat} style={[components.button, { marginTop: spacing.md }]}  label="Cancel reservation" />
        )}

        {isDriver && !rideStarted && !r.completed && !editingCar && (
          <Button onPress={cancelRide} style={[components.button, { marginTop: spacing.md }]}  label="Cancel ride" />
        )}

        {canComplete && (
          <Button onPress={completeRide} style={[components.button, { marginTop: spacing.md }]}  label="Complete ride" />
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

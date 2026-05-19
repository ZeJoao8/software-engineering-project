import { useEffect, useState } from "react";

import {
  View,
  Text,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  Linking,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Contacts from "expo-contacts";

import { getRides, updateRide, deleteRide } from "../../data/rides";
import { getCurrentUser, getUserById } from "../../data/user";
import { getCars, fetchCarById } from "../../data/cars";
import type { Car } from "../../domain/entities/Car";
import { hasReviewForRide, getReviews } from "../../data/reviews";
import { hasReportForRide, getReports, subscribeToReportsChanges } from "../../data/reports";
import { subscribeToReviewsChanges } from "../../data/reviews";
import { subscribeToRidesChanges } from "../../data/rides";
import { formatDate } from "../../utils/date";
import { getRoute } from "../../infra/routing";
import type { RouteResult } from "../../infra/routing";
import { CO2_PER_KM } from "../../domain/rules/sustainability";
import type { User } from "../../domain/entities/User";

import DropDownPicker from "react-native-dropdown-picker";

import { Button } from "../../components/Button";
import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
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
  const [verifyCode, setVerifyCode] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [routeStats, setRouteStats] = useState<RouteResult | null>(null);

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

  const allPassengersVerified =
    r.passengers.length != 0 &&
    r.passengers.every(pid => (r.verifiedPassengers ?? []).includes(pid));

  const canComplete = isDriver && !r.completed && allPassengersVerified;

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

  function generateBoardingCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
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
          const code = generateBoardingCode();
          const updatedCodes = { ...(r.passengerCodes ?? {}), [activeUser.uid]: code };
          await updateRide({
            ...r,
            availableSeats: r.availableSeats - 1,
            passengers: [...r.passengers, activeUser.uid],
            passengerCodes: updatedCodes,
          });
          Alert.alert(
            "Seat reserved! 🎉",
            `Your boarding code is:\n\n${code}\n\nShow this code to the driver before the ride starts.`
          );
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
          const updatedCodes = { ...(r.passengerCodes ?? {}) };
          delete updatedCodes[activeUser.uid];
          await updateRide({
            ...r,
            availableSeats: Math.min(r.availableSeats + 1, r.totalSeats),
            passengers: r.passengers.filter(p => p !== activeUser.uid),
            passengerCodes: updatedCodes,
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
          const updatedCodes = { ...(r.passengerCodes ?? {}) };
          delete updatedCodes[passengerId];
          const updatedVerified = (r.verifiedPassengers ?? []).filter(pid => pid !== passengerId);
          await updateRide({
            ...r,
            passengers: r.passengers.filter(pid => pid !== passengerId),
            availableSeats: Math.min(r.availableSeats + 1, r.totalSeats),
            passengerCodes: updatedCodes,
            verifiedPassengers: updatedVerified,
          });
          router.replace(`/ride/${r.id}`);
        },
      },
    ]);
  }

  function callEmergencyNumber() {
    Alert.alert(
      "Call 112",
      "This will open your phone app to call emergency services.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call 112",
          style: "destructive",
          onPress: () => Linking.openURL("tel:112"),
        },
      ]
    );
  }

  async function openPhoneContacts() {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "UniLink needs access to your contacts so you can choose an emergency contact."
        );
        return;
      }

      const contact = await Contacts.presentContactPickerAsync();

      if (!contact) {
        return;
      }

      const phoneNumber = contact.phoneNumbers?.[0]?.number;

      if (!phoneNumber) {
        Alert.alert(
          "No phone number",
          "The selected contact does not have a phone number."
        );
        return;
      }

      Alert.alert(
        "Call contact",
        `Do you want to call ${contact.name ?? "this contact"}?\n\n${phoneNumber}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Call",
            onPress: () => Linking.openURL(`tel:${phoneNumber.replace(/\s/g, "")}`),
          },
        ]
      );
    } catch {
      Alert.alert(
        "Contacts unavailable",
        "Could not open your phone contacts."
      );
    }
  }

  function openEmergencyOptions() {
    Alert.alert(
      "Emergency contact",
      "Choose an emergency option.",
      [
        {
          text: "Call 112",
          style: "destructive",
          onPress: callEmergencyNumber,
        },
        {
          text: "Choose phone contact",
          onPress: openPhoneContacts,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
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
        contentContainerStyle={layout.scrollContent}
      >

        <Text style={layout.backLink} onPress={() => router.back()}>
          ← Back
        </Text>

        {/* HEADER */}
        <View style={components.card}>
          <Text style={layout.title}>
            {ride.origin} → {ride.destination}
          </Text>
          <Text style={layout.textLight}>
            {formatDate(ride.departureDateTime)}
          </Text>
          <Text style={layout.textLight}>
            {ride.totalSeats - ride.availableSeats} / {ride.totalSeats} seats
          </Text>
          {routeStats && (
            <View style={[components.tagRow, components.mtSm]}>
              <View style={components.miniTag}>
                <Text style={components.miniTagText}>📍 {routeStats.distanceKm} km</Text>
              </View>
              <View style={components.miniTag}>
                <Text style={components.miniTagText}>⏱ ~{routeStats.durationMin} min</Text>
              </View>
              <View style={components.miniTag}>
                <Text style={components.miniTagText}>🌳 ~{(routeStats.distanceKm * CO2_PER_KM).toFixed(2)} kgCO₂/p</Text>
              </View>
            </View>
          )}
        </View>

        {/* MAP */}
        {ride.originCoords && ride.destinationCoords && (
          <View style={[components.card, components.cardMap]}>
            <RouteMap
              origin={ride.originCoords}
              destination={ride.destinationCoords}
              originLabel={ride.origin}
              destinationLabel={ride.destination}
              height={220}
              interactive
              showInfoBar={false}
              onRouteLoaded={setRouteStats}
            />
          </View>
        )}

        {/* DRIVER */}
        <View style={components.card}>
          <Text style={layout.subtitle}>Driver</Text>

          <View style={components.rowSpaceBetween}>
            <View style={components.rowGap}>
              <Text
                style={layout.link}
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
                <Text>⚠️</Text>
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
                <Text style={components.dangerTagText}>
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
                  <Text style={components.mbSm}>
                    {car.model} • {car.color} • {car.licensePlate}
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
                <Text style={layout.textLight}>Vehicle unavailable</Text>
              )}
            </>
          ) : (
            <View>
              <Text style={[layout.textLight, { marginBottom: spacing.xs }]}>Select new car</Text>
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

              <View style={components.spacerMd} />

              <Pressable
                style={components.button}
                onPress={() => {
                  if (selectedCarId) changeCar();
                }}
              >
                <Text style={components.buttonText}>Save car</Text>
              </Pressable>

              <View style={components.spacerXs} />

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
            <Text style={layout.textLight}>No passengers yet</Text>
          )}

          {passengers.map((p, i) => {
            const passengerReview = isDriver
              ? getPassengerRatingForThisRide(p.uid)
              : undefined;
            return (
              <View key={p.uid} style={i > 0 ? components.mtSm : undefined}>
                <View style={components.rowSpaceBetween}>
                  <View style={[components.rowGap, { flexShrink: 1 }]}>
                    <Text
                      style={layout.link}
                      onPress={() => {
                        if (p.uid === activeUser.uid)
                          router.push("/(tabs)/userProfile");
                        else
                          router.push(`/user/${p.uid}`);
                      }}
                    >
                      {p.name}
                    </Text>

                    {isDriver && !r.completed && (r.verifiedPassengers ?? []).includes(p.uid) && (
                      <View style={components.verifiedBadge}>
                        <Text style={components.verifiedBadgeText}>✅ Verified</Text>
                      </View>
                    )}

                    {hasEverReportedUser(p.uid) && <Text>⚠️</Text>}

                    {isDriver && r.completed && (
                      passengerReview ? (
                        <View style={[
                          components.ratingBadge,
                          { backgroundColor: passengerReview.rating >= 4 ? colors.primaryLight : passengerReview.rating === 3 ? colors.warning : colors.dangerSoft },
                        ]}>
                          <Text style={components.ratingBadgeText}>⭐ {passengerReview.rating}/5</Text>
                        </View>
                      ) : (
                        <View style={[components.ratingBadge, { backgroundColor: colors.neutral }]}>
                          <Text style={components.ratingBadgeText}>⭐ ?/5</Text>
                        </View>
                      )
                    )}
                  </View>

                  <View style={components.rowGap}>
                    {canReportUser(p.uid) && (
                      <Pressable
                        style={components.dangerTag}
                        onPress={() => router.push({ pathname: "/reportUser/[id]", params: { id: r.id, targetUserId: p.uid } })}
                      >
                        <Text style={components.dangerTagText}>Report</Text>
                      </Pressable>
                    )}
                    {isDriver && !rideStarted && !r.completed && (
                      <Pressable style={components.dangerTag} onPress={() => removePassenger(p.uid)}>
                        <Text style={components.dangerTagText}>Remove</Text>
                      </Pressable>
                    )}
                  </View>
                </View>

              </View>
            );
          })}

          {/* Single shared code input — matches any unverified passenger */}
          {isDriver && !r.completed && passengers.some(p => r.passengerCodes?.[p.uid] && !(r.verifiedPassengers ?? []).includes(p.uid)) && (
            <View style={[components.rowGap, components.mtSm]}>
              <TextInput
                style={[forms.inputSm, forms.boardingCodeInput]}
                placeholder="Enter code"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                maxLength={6}
                value={verifyCode}
                onChangeText={setVerifyCode}
              />
              <Pressable
                style={components.primaryTag}
                onPress={async () => {
                  const entered = verifyCode.trim();
                  const match = passengers.find(
                    p => r.passengerCodes?.[p.uid] === entered &&
                         !(r.verifiedPassengers ?? []).includes(p.uid)
                  );
                  if (!match) {
                    Alert.alert("Wrong code", "No unverified passenger matches this code.");
                    return;
                  }
                  const updatedVerified = [...(r.verifiedPassengers ?? []), match.uid];
                  await updateRide({ ...r, verifiedPassengers: updatedVerified });
                  setVerifyCode("");
                }}
              >
                <Text style={components.primaryTagText}>Verify</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* BOARDING CODE – visible to passenger only */}
        {joined && !isDriver && !r.completed && r.passengerCodes?.[activeUser.uid] && (
          <View style={[components.card, components.boardingCodeCard]}>
            <Text style={components.verifiedBadgeText}>
              🎫 Your Boarding Code
            </Text>
            <Text style={components.boardingCode}>
              {r.passengerCodes[activeUser.uid]}
            </Text>
            <Text style={[components.boardingCodeHint, { marginTop: spacing.sm }]}>
              Show this code to the driver before the ride starts.
            </Text>
          </View>
        )}

        {/* RIDE FEEDBACK */}
        {allFeedbackComments.length > 0 && (
          <View style={components.card}>
            <Pressable
              style={components.rowSpaceBetween}
              onPress={() => setShowFeedback(prev => !prev)}
            >
              <Text style={layout.subtitle}>
                {isDriver ? `Feedback received (${allFeedbackComments.length})` : "Your feedback "}
              </Text>
              <Text style={layout.collapseIndicator}>
                {showFeedback ? "Hide ▲" : "Show ▼"}
              </Text>
            </Pressable>

            {showFeedback && (
              <View style={components.mtMd}>
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
                        <Text style={[layout.headingSm, { marginBottom: 2 }]}>
                          From {reviewer?.name ?? "passenger"}
                        </Text>
                      )}
                      <Text style={[layout.textLightSm, { marginBottom: 4 }]}>
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} · {review.rating}/5
                      </Text>
                      <Text>{review.comment}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* SAFETY */}
        {(isDriver || joined) && (
          <View style={components.card}>
            <Text style={layout.subtitle}>Safety</Text>

            <Text style={[layout.textLight, { marginBottom: spacing.md }]}>
              If something feels unsafe during this ride, use the emergency contact options.
            </Text>

            <Button
              outline
              testID="emergencyContactButton"
              onPress={openEmergencyOptions}
              label="Emergency contact"
              style={{
                borderColor: colors.danger,
              }}
              textStyle={{
                color: colors.danger,
              }}
            />
          </View>
        )}
        {/* ACTIONS */}
        {(isDriver || joined) && (
          <Pressable
            style={components.outlineButton}
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: r.id } })}
          >
            <Text style={components.outlineButtonText}>Open Group Chat</Text>
          </Pressable>
        )}

        {!isDriver && !joined && !rideStarted && !r.completed && (
          <Button onPress={reserveSeat} style={[components.button, components.mtMd]}  label="Reserve seat" />
        )}

        {joined && !isDriver && !rideStarted && !r.completed && (
          <Button onPress={cancelSeat} style={[components.button, components.mtMd]}  label="Cancel reservation" />
        )}

        {isDriver && !rideStarted && !r.completed && !editingCar && (
          <Button onPress={cancelRide} style={[components.button, components.mtMd]}  label="Cancel ride" />
        )}

        {canComplete && (
          <Button onPress={completeRide} style={[components.button, components.mtMd]}  label="Complete ride" />
        )}

        {canRateDriver && (
          <Pressable
            style={[components.button, components.mtMd]}
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

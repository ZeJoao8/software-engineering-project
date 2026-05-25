import { useEffect, useState } from "react";

import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Car } from "../../domain/entities/Car";
import type { User } from "../../domain/entities/User";
import { hasUserReportedInRide } from "../../domain/rules/reportRules";
import { findPassengerReviewInRide, getVisibleFeedback } from "../../domain/rules/reviewRules";
import {
  canCompleteRide,
  canRateDriver,
  canReportUser,
  isRideStarted,
  isUserDriver,
  isUserPassenger,
} from "../../domain/rules/rideRules";
import { calculateCO2ForDistance } from "../../domain/rules/sustainability";
import { useAuth } from "../../hooks/useAuth";
import { useCars } from "../../hooks/useCars";
import { useNotifications } from "../../hooks/useNotifications";
import { useReports } from "../../hooks/useReports";
import { useReviews } from "../../hooks/useReviews";
import { useRides } from "../../hooks/useRides";
import type { RouteResult } from "../../infra/routing";
import * as CarService from "../../services/CarService";
import * as RideService from "../../services/RideService";
import { stopMessagesSync } from "../../store/messageStore";
import { formatDate } from "../../utils/date";
import { getFeedbackStyle } from "../../utils/ratingStyle";

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

  const id = typeof params.id === "string" ? params.id : undefined;

  const rides = useRides();
  const { user: currentUser, getUserById } = useAuth();
  const { cars: driverCars } = useCars();
  const { reviews: allReviews } = useReviews();
  const { reports: allReports } = useReports();
  const { notifications, markAsRead } = useNotifications();

  const ride = id ? rides.find(r => r.id === id) : undefined;

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [editingCar, setEditingCar] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(
    ride?.carId ?? null
  );
  const [carDropdownOpen, setCarDropdownOpen] = useState(false);
  const [rideCar, setRideCar] = useState<Car | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [routeStats, setRouteStats] = useState<RouteResult | null>(null);

  useEffect(() => {
    if (!id) return;
    const toRead = notifications.filter(
      n => n.rideId === id &&
        (n.type === "ride_join" || n.type === "ride_cancel" || n.type === "passenger_removed" || n.type === "passenger_review")
    );
    for (const n of toRead) void markAsRead(n.id);
  }, [notifications, id]);

  useEffect(() => {
    setSelectedCarId(ride?.carId ?? null);
  }, [ride?.carId]);

  useEffect(() => {
    if (!ride?.carId) return;
    CarService.getById(ride.carId).then(car => setRideCar(car ?? null));
  }, [ride?.carId]);

  if (!ride || !currentUser) return null;

  const r = ride;
  const activeUser = currentUser;

  const driver = getUserById(r.driverId);
  const car = rideCar;

  const passengers = ride.passengers
    .map(pid => getUserById(pid))
    .filter((p): p is User => p !== null);

  const isDriver = isUserDriver(r, activeUser.uid);
  const joined = isUserPassenger(r, activeUser.uid);
  const rideStarted = isRideStarted(r, new Date());

  const canComplete = canCompleteRide(r, activeUser.uid).ok;
  const rateDriverOk = canRateDriver(r, activeUser.uid, allReviews);

  const allFeedbackComments = getVisibleFeedback(allReviews, r.id, isDriver, activeUser.uid);

  function reserveSeat() {
    const prefs = driver?.driverPreferences;
    const prefLines = [];
    if (prefs?.noSmoking)      prefLines.push("🚭 No smoking");
    if (prefs?.acceptLuggage)  prefLines.push("🧳 Luggage allowed");
    if (prefs?.acceptPets)     prefLines.push("🐾 Pets allowed");
    if (prefs?.passengerMusic) prefLines.push("🎵 Passengers can play music");

    const prefSummary = prefLines.length > 0
      ? prefLines.join("\n")
      : "No specific requirements.";

    Alert.alert(
      "Driver requirements",
      `Before reserving, check the driver's requirements:\n\n${prefSummary}\n\nDo you want to reserve a seat?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reserve",
          onPress: async () => {
            const result = await RideService.reserveSeat(r.id, activeUser);
            if (!result.ok) { Alert.alert("Cannot reserve", result.error); return; }
            Alert.alert(
              "Seat reserved! 🎉",
              `Your boarding code is:\n\n${result.data!.boardingCode}\n\nShow this code to the driver before the ride starts.`
            );
          },
        },
      ]
    );
  }

  function cancelSeat() {
    Alert.alert("Cancel reservation", "Cancel your seat?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          const result = await RideService.cancelSeat(r.id, activeUser.uid);
          if (!result.ok) { Alert.alert("Cannot cancel", result.error); return; }
          stopMessagesSync();
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function cancelRide() {
    Alert.alert("Cancel ride", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          const result = await RideService.cancelRide(r.id);
          if (!result.ok) { Alert.alert("Cannot cancel", result.error); return; }
          stopMessagesSync();
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function completeRide() {
    Alert.alert("Complete ride", "Mark as completed?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const result = await RideService.completeRide(r.id, activeUser.uid);
          if (!result.ok) { Alert.alert("Cannot complete", result.error); return; }
          router.replace("/(tabs)/myRides");
        },
      },
    ]);
  }

  function removePassenger(passengerId: string) {
    Alert.alert("Remove passenger", "Remove passenger?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          const result = await RideService.removePassenger(r.id, passengerId);
          if (!result.ok) { Alert.alert("Cannot remove", result.error); return; }
          router.replace(`/ride/${r.id}`);
        },
      },
    ]);
  }

  function changeCar() {
    const newCar = driverCars.find(c => c.id === selectedCarId);
    if (!newCar) return;

    Alert.alert("Change car", "Confirm?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const result = await RideService.changeCar(r.id, newCar.id, newCar.seatCapacity);
          if (!result.ok) { Alert.alert("Cannot change car", result.error); return; }
          setEditingCar(false);
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
        { text: "Cancel", style: "cancel" },
        { text: "Call 112", style: "destructive", onPress: () => Linking.openURL("tel:112") },
      ]
    );
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
                <Text style={components.miniTagText}>🌳 ~{calculateCO2ForDistance(routeStats.distanceKm).toFixed(2)} kgCO₂/p</Text>
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
              {hasUserReportedInRide(allReports, r.id, activeUser.uid, driver?.uid ?? r.driverId) && (
                <Text>⚠️</Text>
              )}
            </View>

            {canReportUser(r, activeUser.uid, driver?.uid ?? r.driverId, allReports) && !isDriver && (
              <Pressable
                style={components.dangerTag}
                onPress={() =>
                  router.push({
                    pathname: "/reportUser/[id]",
                    params: { id: r.id, targetUserId: driver?.uid ?? r.driverId },
                  })
                }
              >
                <Text style={components.dangerTagText}>Report</Text>
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
                onPress={() => { if (selectedCarId) changeCar(); }}
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
              ? findPassengerReviewInRide(allReviews, r.id, p.uid)
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

                    {hasUserReportedInRide(allReports, r.id, activeUser.uid, p.uid) && <Text>⚠️</Text>}

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
                    {canReportUser(r, activeUser.uid, p.uid, allReports) && (
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
                  const result = await RideService.verifyPassengerCode(r.id, entered);
                  if (!result.ok) {
                    Alert.alert("Wrong code", result.error);
                    return;
                  }
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
                      style={[components.feedbackCard, getFeedbackStyle(review.rating)]}
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
              onPress={() => setShowEmergencyModal(true)}
              label="Emergency contact"
              style={{ borderColor: colors.danger }}
              textStyle={{ color: colors.danger }}
            />
          </View>
        )}

        {/* EMERGENCY MODAL */}
        <Modal
          visible={showEmergencyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEmergencyModal(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
            onPress={() => setShowEmergencyModal(false)}
          >
            <Pressable
              style={{ backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.lg, gap: spacing.sm }}
              onPress={() => {}}
            >
              <Text style={layout.subtitle}>Emergency contact</Text>

              <Pressable
                style={{ padding: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.danger }}
                onPress={() => { setShowEmergencyModal(false); callEmergencyNumber(); }}
              >
                <Text style={{ color: colors.danger, fontWeight: "600", textAlign: "center" }}>Call 112</Text>
              </Pressable>

              {(activeUser.emergencyContacts ?? []).map((c, i) => (
                <Pressable
                  key={i}
                  style={{ padding: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.danger }}
                  onPress={() => {
                    setShowEmergencyModal(false);
                    Linking.openURL(`tel:${c.phone.replace(/\s/g, "")}`);
                  }}
                >
                  <Text style={{ color: colors.danger, fontWeight: "600", textAlign: "center" }}>Call {c.name}</Text>
                </Pressable>
              ))}

              {(activeUser.emergencyContacts ?? []).length === 0 && (
                <Text
                  style={[layout.link, { textAlign: "center" }]}
                  onPress={() => { setShowEmergencyModal(false); router.push("/(tabs)/userProfile"); }}
                >
                  Add safety contact in profile →
                </Text>
              )}

              <Pressable
                style={{ padding: spacing.md, borderRadius: 8, backgroundColor: colors.background }}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={{ textAlign: "center", color: colors.textLight, fontWeight: "600" }}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

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
          <Button onPress={reserveSeat} style={[components.button, components.mtMd]} label="Reserve seat" />
        )}

        {joined && !isDriver && !rideStarted && !r.completed && (
          <Button onPress={cancelSeat} style={[components.button, components.mtMd]} label="Cancel reservation" />
        )}

        {isDriver && !rideStarted && !r.completed && !editingCar && (
          <Button onPress={cancelRide} style={[components.button, components.mtMd]} label="Cancel ride" />
        )}

        {canComplete && (
          <Button onPress={completeRide} style={[components.button, components.mtMd]} label="Complete ride" />
        )}

        {rateDriverOk && (
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

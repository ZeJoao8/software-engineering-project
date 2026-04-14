import { useEffect, useState } from "react";

import {
  Text,
  TextInput,
  Alert,
  Pressable
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useLocalSearchParams,
  useRouter
} from "expo-router";

import {
  getRides
} from "../../data/rides";

import {
  getCurrentUser,
  getUserById
} from "../../data/user";

import {
  addReview,
  hasReviewForRide
} from "../../data/reviews";

import {
  addReport
} from "../../data/reports";

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function LowRatingReport() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const targetUserId =
    typeof params.targetUserId === "string"
      ? params.targetUserId
      : "";

  const rating =
    typeof params.rating === "string"
      ? Number(params.rating)
      : 0;

  const ride =
    getRides().find(currentRide => currentRide.id === id);

  const activeUser =
    getCurrentUser();

  const targetUser =
    targetUserId
      ? getUserById(targetUserId)
      : undefined;

  const [reason, setReason] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (!ride || !activeUser || !targetUser) {
    return null;
  }

  const joined =
    ride.passengers.includes(activeUser.uid) ||
    ride.passengers.includes(activeUser.email);

  const isDriver =
    ride.driverId === activeUser.uid ||
    ride.driverId === activeUser.email;

  const canAccess =
    joined &&
    !isDriver &&
    ride.completed &&
    rating >= 1 &&
    rating <= 2;

  const trimmedReason =
    reason.trim();

  useEffect(() => {
    if (!canAccess) {
      Alert.alert(
        "Not allowed",
        "You cannot report this ride."
      );
      router.replace("/(tabs)/myRides");
    }
  }, [canAccess, router]);

  if (!canAccess) {
    return null;
  }

  async function submitLowRating() {

    if (submitting) {
      return;
    }

    if (
      hasReviewForRide(
        ride.id,
        activeUser.uid,
        targetUser.uid,
        activeUser.email,
        targetUser.email
      )
    ) {
      Alert.alert(
        "Already reviewed",
        "You have already reviewed this user for this ride."
      );
      router.replace("/(tabs)/myRides");
      return;
    }

    if (trimmedReason.length < 15) {
      Alert.alert(
        "Reason too short",
        "Please write at least 15 characters explaining your rating."
      );
      return;
    }

    setSubmitting(true);

    const reviewId =
      Date.now().toString();

    await addReview({
      id: reviewId,
      rideId: ride.id,
      reviewerId: activeUser.uid,
      revieweeId: targetUser.uid,
      rating,
      comment: trimmedReason,
      createdAt: new Date().toISOString()
    });

    await addReport({
      id: `${reviewId}-report`,
      rideId: ride.id,
      reviewId,
      reporterId: activeUser.uid,
      reportedUserId: targetUser.uid,
      reason: trimmedReason,
      createdAt: new Date().toISOString(),
      status: "pending"
    });

    setSubmitting(false);

    Alert.alert(
      "Feedback submitted",
      "Your review and report were submitted successfully.",
      [
        {
          text: "OK",
          onPress: () =>
            router.replace("/(tabs)/myRides")
        }
      ]
    );
  }

  return (

    <SafeAreaView style={layout.screen}>

      <Text
        style={{
          color: colors.primary,
          marginBottom: spacing.sm,
          fontWeight: "600"
        }}
        onPress={() => router.back()}
      >
        ← Back
      </Text>

      <Text style={layout.title}>
        Help us understand your rating
      </Text>

      <Text style={{ marginBottom: spacing.sm }}>
        You rated {targetUser.name} with {rating} star{rating > 1 ? "s" : ""}.
      </Text>

      <Text
        style={{
          color: colors.textLight,
          marginBottom: spacing.md
        }}
      >
        Explain what happened during this ride.
      </Text>

      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Write the reason for your rating..."
        multiline
        numberOfLines={5}
        maxLength={250}
        style={[
          forms.input,
          {
            minHeight: 120,
            textAlignVertical: "top"
          }
        ]}
        testID="lowRatingReasonInput"
      />

      <Text
        style={{
          marginTop: spacing.xs,
          marginBottom: spacing.md,
          color:
            trimmedReason.length >= 15
              ? colors.primary
              : colors.danger
        }}
      >
        {trimmedReason.length}/15 minimum characters
      </Text>

      <Pressable
        style={components.button}
        testID="submitLowRatingReportButton"
        onPress={() => void submitLowRating()}
      >
        <Text style={components.buttonText}>
          {submitting
            ? "SUBMITTING..."
            : "SUBMIT FEEDBACK"}
        </Text>
      </Pressable>

    </SafeAreaView>

  );

}
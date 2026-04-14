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
  addReport,
  hasReportForRide
} from "../../data/reports";

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function ReportPassenger() {

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

  const ride =
    getRides().find(currentRide => currentRide.id === id);

  const activeUser =
    getCurrentUser();

  const targetUser =
    targetUserId
      ? getUserById(targetUserId)
      : null;

  const [reason, setReason] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const isDriver =
    ride && activeUser
      ? (
          ride.driverId === activeUser.uid ||
          ride.driverId === activeUser.email
        )
      : false;

  const passengerWasInRide =
    ride && targetUser
      ? (
          ride.passengers.includes(targetUser.uid) ||
          ride.passengers.includes(targetUser.email)
        )
      : false;

  const canAccess =
    !!ride &&
    !!activeUser &&
    !!targetUser &&
    isDriver &&
    passengerWasInRide &&
    ride.completed;

  const trimmedReason =
    reason.trim();

  useEffect(() => {
    if (
      ride &&
      activeUser &&
      targetUser &&
      !canAccess
    ) {
      Alert.alert(
        "Not allowed",
        "You cannot comment on this passenger."
      );
      router.replace("/(tabs)/myRides");
    }
  }, [canAccess, ride, activeUser, targetUser, router]);

  if (!ride || !activeUser || !targetUser) {
    return null;
  }

  if (!canAccess) {
    return null;
  }

  const currentRide = ride;
  const reporterUser = activeUser;
  const reportedUser = targetUser;

  async function submitDriverComment() {

    if (submitting) {
      return;
    }

    if (trimmedReason.length < 15) {
      Alert.alert(
        "Comment too short",
        "Please write at least 15 characters."
      );
      return;
    }

    if (
      hasReportForRide(
        currentRide.id,
        reporterUser.uid,
        reportedUser.uid,
        reporterUser.email,
        reportedUser.email
      )
    ) {
      Alert.alert(
        "Already submitted",
        "You have already submitted a comment for this passenger on this ride."
      );
      router.replace(`/ride/${currentRide.id}`);
      return;
    }

    setSubmitting(true);

    await addReport({
      id: Date.now().toString(),
      rideId: currentRide.id,
      reporterId: reporterUser.uid,
      reportedUserId: reportedUser.uid,
      reason: trimmedReason,
      createdAt: new Date().toISOString(),
      status: "pending",
      type: "driver_comment"
    });

    setSubmitting(false);

    Alert.alert(
      "Comment submitted",
      "Your comment was submitted successfully.",
      [
        {
          text: "OK",
          onPress: () =>
            router.replace(`/ride/${currentRide.id}`)
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
        Add comment
      </Text>

      <Text style={{ marginBottom: spacing.sm }}>
        Passenger: {reportedUser.name}
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
        placeholder="Write your comment..."
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
        testID="driverCommentInput"
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
        testID="submitDriverCommentButton"
        onPress={() => void submitDriverComment()}
      >
        <Text style={components.buttonText}>
          {submitting
            ? "SUBMITTING..."
            : "SUBMIT COMMENT"}
        </Text>
      </Pressable>

    </SafeAreaView>

  );

}
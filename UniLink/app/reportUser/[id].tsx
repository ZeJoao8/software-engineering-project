import { useEffect, useState } from "react";

import {
  Text,
  TextInput,
  Alert,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { getRides } from "../../data/rides";
import { getCurrentUser, getUserById } from "../../data/user";
import { addReport, hasReportForRide } from "../../data/reports";
import { generateId } from "../../infra/firebase";

import { components } from "../../styles/components";
import { Button } from "../../components/Button";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function ReportUser() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rideId =
    typeof params.id === "string" ? params.id : "";

  const targetUserId =
    typeof params.targetUserId === "string"
      ? params.targetUserId
      : "";

  const ride = getRides().find(r => r.id === rideId);
  const activeUser = getCurrentUser();
  const targetUser = targetUserId ? getUserById(targetUserId) : undefined;

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!ride || !activeUser || !targetUser) return null;

  const isDriver = ride.driverId === activeUser.uid;

  const isPassenger = ride.passengers.includes(activeUser.uid);

  const targetIsPassenger = ride.passengers.includes(targetUser.uid);

  const targetIsDriver = ride.driverId === targetUser.uid;

  const canAccess =
    ride.completed &&
    (isDriver || isPassenger) &&
    (targetIsPassenger || targetIsDriver) &&
    targetUser.uid !== activeUser.uid;

  const alreadyReported = hasReportForRide(
    ride.id,
    activeUser.uid,
    targetUser.uid
  );

  const trimmedReason = reason.trim();

  useEffect(() => {
    if (!canAccess) {
      Alert.alert("Not allowed", "You cannot report this user.");
      router.replace("/(tabs)/myRides");
    }
  }, [canAccess, router]);

  if (!canAccess) return null;

  async function submitReport() {
    if (!ride || !activeUser || !targetUser) return;
    if (submitting) return;

    if (alreadyReported) {
      Alert.alert(
        "Already reported",
        "You have already reported this user for this ride."
      );
      router.replace(`/ride/${ride.id}`);
      return;
    }

    if (trimmedReason.length < 15) {
      Alert.alert(
        "Reason too short",
        "Please write at least 15 characters."
      );
      return;
    }

    setSubmitting(true);

    await addReport({
      id: generateId("reports"),
      rideId: ride.id,
      reporterId: activeUser.uid,
      reportedUserId: targetUser.uid,
      reason: trimmedReason,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    setSubmitting(false);

    Alert.alert(
      "Report submitted",
      "Your report was submitted successfully.",
      [
        {
          text: "OK",
          onPress: () => router.replace(`/ride/${ride.id}`),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={layout.screen}>

      <Text style={layout.backLink} onPress={() => router.back()}>
        ← Back
      </Text>

      <Text style={layout.title}>Report user</Text>

      <Text style={{ marginBottom: spacing.sm }}>
        Reporting: {targetUser.name}
      </Text>

      <Text style={[layout.textLight, { marginBottom: spacing.md }]}>
        Describe what happened during this ride.
      </Text>

      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Write the reason for your report..."
        placeholderTextColor={colors.textLight}
        multiline
        numberOfLines={5}
        maxLength={250}
        style={[forms.input, forms.multiline, { minHeight: 120 }]}
        testID="reportReasonInput"
      />

      <Text
        style={{
          marginTop: spacing.xs,
          marginBottom: spacing.md,
          color: trimmedReason.length >= 15 ? colors.primary : colors.danger,
        }}
      >
        {trimmedReason.length}/15 minimum characters
      </Text>

      <Button
        testID="submitReportButton"
        onPress={() => void submitReport()}
        label={submitting ? "SUBMITTING..." : "SUBMIT REPORT"}
      />

    </SafeAreaView>
  );
}
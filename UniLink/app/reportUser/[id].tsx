import { useEffect, useState } from "react";

import {
  Text,
  TextInput,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useAuth } from "../../hooks/useAuth";
import { useRides } from "../../hooks/useRides";
import { useReports } from "../../hooks/useReports";
import { addReport } from "../../services/ReportService";
import { generateId } from "../../infra/firebase";
import { canAccessRideReport } from "../../domain/rules/rideRules";
import { validateReportReason } from "../../domain/rules/reportRules";

import { Button } from "../../components/Button";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function ReportUser() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rideId = typeof params.id === "string" ? params.id : "";
  const targetUserId = typeof params.targetUserId === "string" ? params.targetUserId : "";

  const rides = useRides();
  const { user: activeUser, getUserById } = useAuth();
  const { hasReportForRide } = useReports();

  const ride = rides.find(r => r.id === rideId);
  const targetUser = targetUserId ? getUserById(targetUserId) : undefined;

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canAccess = !!ride && !!activeUser && !!targetUser &&
    canAccessRideReport(ride, activeUser.uid, targetUser.uid);

  const alreadyReported = ride && activeUser && targetUser
    ? hasReportForRide(ride.id, activeUser.uid, targetUser.uid)
    : false;

  const trimmedReason = reason.trim();

  useEffect(() => {
    if (ride && activeUser && targetUser && !canAccess) {
      Alert.alert("Not allowed", "You cannot report this user.");
      router.replace("/(tabs)/myRides");
    }
  }, [canAccess, ride, activeUser, targetUser, router]);

  if (!ride || !activeUser || !targetUser || !canAccess) return null;

  async function submitReport() {
    if (!ride || !activeUser || !targetUser) return;
    if (submitting) return;

    if (alreadyReported) {
      Alert.alert("Already reported", "You have already reported this user for this ride.");
      router.replace(`/ride/${ride.id}`);
      return;
    }

    const reasonCheck = validateReportReason(trimmedReason);
    if (!reasonCheck.ok) {
      Alert.alert("Reason too short", reasonCheck.error);
      return;
    }

    setSubmitting(true);

    const result = await addReport({
      id: generateId("reports"),
      rideId: ride.id,
      reporterId: activeUser.uid,
      reportedUserId: targetUser.uid,
      reason: trimmedReason,
      createdAt: new Date().toISOString(),
    });

    setSubmitting(false);

    if (!result.ok) {
      Alert.alert("Error", result.error);
      return;
    }

    Alert.alert(
      "Report submitted",
      "Your report was submitted successfully.",
      [{ text: "OK", onPress: () => router.replace(`/ride/${ride.id}`) }]
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

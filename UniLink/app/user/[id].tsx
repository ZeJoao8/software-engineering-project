import { useEffect, useState } from "react";

import {
  View,
  Text,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getUserById } from "../../data/user";
import { getUserCars } from "../../data/cars";
import { getRides, subscribeToRidesChanges } from "../../data/rides";
import {
  getAverageRatingForUser,
  getReviewsForUser,
  subscribeToReviewsChanges,
} from "../../data/reviews";
import {
  getReportsByReporter,
  subscribeToReportsChanges,
} from "../../data/reports";
import { getCurrentUser } from "../../data/user";
import { formatDate } from "../../utils/date";

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function PublicProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id =
    typeof params.id === "string" ? params.id : undefined;

  const user = id ? getUserById(id) : undefined;
  const activeUser = getCurrentUser();

  const [showReports, setShowReports] = useState(false);
  const [, setVersion] = useState(0);

  useEffect(() => {
    const rerender = () => setVersion(v => v + 1);
    const unsubReviews = subscribeToReviewsChanges(rerender);
    const unsubRides = subscribeToRidesChanges(rerender);
    const unsubReports = subscribeToReportsChanges(rerender);
    return () => {
      unsubReviews();
      unsubRides();
      unsubReports();
    };
  }, []);

  if (!user || !activeUser) return null;

  const cars = getUserCars(user.uid, user.email);

  const hasDrivenRide = getRides().some(
    ride =>
      ride.driverId === user.uid || ride.driverId === user.email
  );

  const userReviews = getReviewsForUser(user.uid, user.email);
  const averageRating = getAverageRatingForUser(user.uid, user.email);
  const showRating = hasDrivenRide && userReviews.length > 0;

  // reports que o utilizador atual fez a este user
  const myReportsOnUser = getReportsByReporter(
    activeUser.uid,
    activeUser.email
  ).filter(
    report =>
      report.reportedUserId === user.uid ||
      report.reportedUserId === user.email
  );

  const hasReportedThisUser = myReportsOnUser.length > 0;

  return (
    <SafeAreaView style={layout.screen}>

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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm }}>
        <Text style={layout.title}>{user.name}</Text>
        {hasReportedThisUser && (
          <Text style={{ fontSize: 18 }}>⚠️</Text>
        )}
      </View>

      {showRating && (
        <Text style={{ marginBottom: spacing.md, color: colors.textLight, fontSize: 16 }}>
          ⭐ {averageRating} ({userReviews.length}{" "}
          {userReviews.length === 1 ? "rating" : "ratings"})
        </Text>
      )}

      {/* INFO */}
      <View style={components.card}>
        <Text style={layout.subtitle}>Info</Text>

        <Text style={forms.label}>Gender</Text>
        <Text>{user.gender}</Text>

        <View style={{ height: spacing.sm }} />

        <Text style={forms.label}>University</Text>
        <Text>{user.university}</Text>

        <View style={{ height: spacing.sm }} />

        <Text style={forms.label}>Course</Text>
        <Text>{user.course}</Text>
      </View>

      {/* CARS */}
      <View style={components.card}>
        <Text style={layout.subtitle}>Cars</Text>

        {cars.length === 0 ? (
          <Text style={{ color: colors.textLight }}>No cars</Text>
        ) : (
          cars.map(c => (
            <View key={c.id} style={{ marginBottom: spacing.sm }}>
              <Text style={{ fontWeight: "500" }}>{c.model}</Text>
              <Text style={{ color: colors.textLight }}>{c.color}</Text>
              <Text style={{ fontWeight: "600" }}>{c.licensePlate}</Text>
            </View>
          ))
        )}
      </View>

      {/* MY REPORTS ON THIS USER */}
      {hasReportedThisUser && (
        <View style={components.card}>
          <Pressable
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={() => setShowReports(!showReports)}
          >
            <Text style={layout.subtitle}>
              ⚠️ Your reports ({myReportsOnUser.length})
            </Text>
            <Text style={{ color: colors.textLight, fontSize: 13 }}>
              {showReports ? "Hide ▲" : "Show ▼"}
            </Text>
          </Pressable>

          {showReports &&
            myReportsOnUser.map(report => (
              <View
                key={report.id}
                style={{
                  marginTop: spacing.sm,
                  backgroundColor: "#fef2f2",
                  borderRadius: 8,
                  padding: spacing.sm,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.danger,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.textLight, marginBottom: 4 }}>
                  {formatDate(report.createdAt)}
                </Text>
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {report.reason}
                </Text>
              </View>
            ))}
        </View>
      )}

    </SafeAreaView>
  );
}
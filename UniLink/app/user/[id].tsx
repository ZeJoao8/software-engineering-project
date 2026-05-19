import { useEffect, useState } from "react";

import {
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getUserById } from "../../data/user";
import { fetchCarById } from "../../data/cars";
import type { Car } from "../../domain/entities/Car";
import { getRides, subscribeToRidesChanges } from "../../data/rides";
import {
  fetchReviewsForUser,
  subscribeToReviewsChanges,
  type Review,
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
import { spacing } from "../../styles/theme";
import { calculateUserCO2Saved } from "../../domain/rules/sustainability";
import { getUserBadges } from "../../domain/rules/badges";
import { BadgeDisplay } from "../../components/BadgeDisplay";

export default function PublicProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id =
    typeof params.id === "string" ? params.id : undefined;

  const user = id ? getUserById(id) : undefined;
  const activeUser = getCurrentUser();

  const [showReports, setShowReports] = useState(false);
  const [, setVersion] = useState(0);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userCars, setUserCars] = useState<Car[]>([]);

  useEffect(() => {
    if (!id) return;
    // Fetch reviews and cars for the target user on-demand
    fetchReviewsForUser(id).then(setUserReviews);
    // Cars: fetch only the car IDs we know from their rides
    const targetRides = getRides().filter(r => r.driverId === id && r.carId);
    const uniqueCarIds = [...new Set(targetRides.map(r => r.carId))];
    Promise.all(uniqueCarIds.map(fetchCarById))
      .then(results => setUserCars(results.filter((c): c is Car => c !== null)));
  }, [id]);

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

  const hasDrivenRide = getRides().some(
    ride => ride.driverId === user.uid
  );

  const averageRating = userReviews.length === 0 ? 0 :
    Number((userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1));
  const showRating = hasDrivenRide && userReviews.length > 0;

  // Reports this user made on the target
  const myReportsOnUser = getReportsByReporter(activeUser.uid).filter(
    report => report.reportedUserId === user.uid
  );

  const hasReportedThisUser = myReportsOnUser.length > 0;

  // Get ride info for each report
  const allRides = getRides();

  function getRideForReport(rideId: string) {
    return allRides.find(r => r.id === rideId) ?? null;
  }

  return (
    <SafeAreaView style={layout.screen}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <Text style={layout.backLink} onPress={() => router.back()}>
        ← Back
      </Text>

      {/* HEADER */}
      <View style={[components.rowGap, components.mbSm]}>
        <Text style={layout.title}>{user.name}</Text>
        {hasReportedThisUser && (
          <Text style={layout.title}>⚠️</Text>
        )}
      </View>

      {showRating && (
        <Text style={layout.ratingText}>
          ⭐ {averageRating} ({userReviews.length}{" "}
          {userReviews.length === 1 ? "rating" : "ratings"})
        </Text>
      )}


      {/* INFO */}
      <View style={components.card}>
        <Text style={layout.subtitle}>Info</Text>

        <Text style={forms.label}>Gender</Text>
        <Text>{user.gender}</Text>

        <View style={components.spacerSm} />

        <Text style={forms.label}>University</Text>
        <Text>{user.university}</Text>

        <View style={components.spacerSm} />

        <Text style={forms.label}>Course</Text>
        <Text>{user.course}</Text>

        <View style={components.spacerMd} />

        <Text style={layout.subtitle}>Cars</Text>

        {userCars.length === 0 ? (
          <Text style={layout.textLight}>No cars</Text>
        ) : (
          userCars.map(c => (
            <View key={c.id} style={{ marginBottom: spacing.sm }}>
              <Text>{c.model} • {c.color} • {c.licensePlate}</Text>
            </View>
          ))
        )}
      </View>

      {/* SUSTAINABILITY IMPACT */}
      <View style={components.card}>
        <Text style={layout.subtitle}>Sustainability Impact</Text>
        <View style={components.statRow}>
          <Text style={layout.emojiLg}>🌳</Text>
          <View>
            <Text style={layout.statValue}>
              {calculateUserCO2Saved(getRides(), user.uid).toFixed(2)} kg
            </Text>
            <Text style={layout.statLabel}>Total CO₂ saved</Text>
          </View>
        </View>
      </View>

      {/* BADGES & ACHIEVEMENTS */}
      <View style={components.card}>
        <Text style={layout.subtitle}>Achievements</Text>
        <BadgeDisplay 
          badges={getUserBadges(
            user.uid,
            getRides(),
            calculateUserCO2Saved(getRides(), user.uid)
          )} 
        />
      </View>


      {/* MY REPORTS ON THIS USER */}
      {hasReportedThisUser && (
        <View style={components.card}>
          <Pressable
            style={components.rowSpaceBetween}
            onPress={() => setShowReports(!showReports)}
          >
            <Text style={layout.subtitle}>
              ⚠️ Your reports ({myReportsOnUser.length})
            </Text>
            <Text style={layout.collapseIndicator}>
              {showReports ? "Hide ▲" : "Show ▼"}
            </Text>
          </Pressable>

          {showReports &&
            myReportsOnUser.map(report => {
              const ride = getRideForReport(report.rideId);
              return (
                <View
                  key={report.id}
                  style={[components.feedbackCard, components.dangerLeftBorder]}
                >
                  {/* Ride route */}
                  {ride && (
                    <Text style={[layout.headingSm, { marginBottom: 2 }]}>
                      {ride.origin} → {ride.destination}
                    </Text>
                  )}

                  <Text style={[layout.textLightSm, { marginBottom: 4 }]}>
                    {ride
                      ? formatDate(ride.departureDateTime)
                      : formatDate(report.createdAt)}
                  </Text>

                  <Text>
                    {report.reason}
                  </Text>
                </View>
              );
            })}
        </View>
      )}

      </ScrollView>
    </SafeAreaView>
  );
}

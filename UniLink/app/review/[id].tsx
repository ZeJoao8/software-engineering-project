import { useEffect, useState } from "react";
import {
  View,
  Text,
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

import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function ReviewRide() {

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

  const activeUser = getCurrentUser();

  const targetUser =
    targetUserId
      ? getUserById(targetUserId)
      : undefined;

  const [rating, setRating] =
    useState(0);

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
    ride.completed;

  const alreadyReviewed =
    hasReviewForRide(
      ride.id,
      activeUser.uid,
      targetUser.uid,
      activeUser.email,
      targetUser.email
    );

  useEffect(() => {
    if (!canAccess) {
      Alert.alert(
        "Not allowed",
        "You cannot review this ride."
      );
      router.replace("/(tabs)/myRides");
    }
  }, [canAccess, router]);

  if (!canAccess) {
    return null;
  }

  async function submitRating() {

    if (rating < 1 || rating > 5) {
      Alert.alert(
        "Select rating",
        "Choose a rating between 1 and 5 stars."
      );
      return;
    }

    if (alreadyReviewed) {
      Alert.alert(
        "Already reviewed",
        "You have already reviewed this user for this ride."
      );
      router.replace("/(tabs)/myRides");
      return;
    }

    if (rating <= 2) {
      router.push({
        pathname: "/reviewComment/[id]",
        params: {
          id: ride.id,
          targetUserId: targetUser.uid,
          rating: String(rating)
        }
      });
      return;
    }

    await addReview({
      id: Date.now().toString(),
      rideId: ride.id,
      reviewerId: activeUser.uid,
      revieweeId: targetUser.uid,
      rating,
      comment: "",
      createdAt: new Date().toISOString()
    });

    Alert.alert(
      "Review submitted",
      "Thank you for your feedback.",
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

      <View style={components.card}>

        <Text style={layout.title}>
          Rate driver
        </Text>

        <Text style={{ marginBottom: spacing.sm }}>
          {targetUser.name}
        </Text>

        <Text
          style={{
            color: colors.textLight,
            marginBottom: spacing.md
          }}
        >
          {ride.origin} → {ride.destination}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: spacing.md
          }}
        >
          {[1, 2, 3, 4, 5].map(value => (

            <Pressable
              key={value}
              testID={`reviewStar${value}`}
              onPress={() => setRating(value)}
              style={{ marginHorizontal: 6 }}
            >
              <Text
                style={{
                  fontSize: 34,
                  color:
                    value <= rating
                      ? colors.primary
                      : "#d1d5db"
                }}
              >
                ★
              </Text>
            </Pressable>

          ))}
        </View>

        <Pressable
          style={components.button}
          testID="submitRatingButton"
          onPress={() => void submitRating()}
        >
          <Text style={components.buttonText}>
            CONTINUE
          </Text>
        </Pressable>

      </View>

    </SafeAreaView>

  );

}
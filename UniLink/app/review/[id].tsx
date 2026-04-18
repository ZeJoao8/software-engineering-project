import { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useLocalSearchParams,
  useRouter
} from "expo-router";

import { getRides } from "../../data/rides";
import { getCurrentUser, getUserById } from "../../data/user";
import { addReview, hasReviewForRide } from "../../data/reviews";

import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { forms } from "../../styles/forms";
import { colors, spacing } from "../../styles/theme";

export default function ReviewRide() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const id = typeof params.id === "string" ? params.id : "";
  const targetUserId = typeof params.targetUserId === "string" ? params.targetUserId : "";

  const ride = getRides().find(currentRide => currentRide.id === id);
  const activeUser = getCurrentUser();
  const targetUser = targetUserId ? getUserById(targetUserId) : undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!ride || !activeUser || !targetUser) {
    return null;
  }

  const joined = ride.passengers.includes(activeUser.uid);

  const isDriver = ride.driverId === activeUser.uid;

  const canAccess = joined && !isDriver && ride.completed;

  const alreadyReviewed = hasReviewForRide(
    ride.id,
    activeUser.uid,
    targetUser.uid
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
    if (!ride || !activeUser || !targetUser) return;
    if (submitting) return;

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

    setSubmitting(true);

    await addReview({
      id: Date.now().toString(),
      rideId: ride.id,
      reviewerId: activeUser.uid,
      revieweeId: targetUser.uid,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    });

    setSubmitting(false);

    Alert.alert(
      "Feedback submitted",
      "Thank you for your feedback.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/myRides")
        }
      ]
    );
  }

  return (
    <SafeAreaView style={layout.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={layout.scrollScreen}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl, padding: spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
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

            <Text style={{ marginBottom: spacing.sm, fontWeight: "500", fontSize: 16 }}>
              {targetUser.name}
            </Text>

            <Text
              style={{
                color: colors.textLight,
                marginBottom: spacing.xl
              }}
            >
              {ride.origin} → {ride.destination}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: spacing.xl
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
                      fontSize: 40,
                      color: value <= rating ? colors.primary : "#d1d5db"
                    }}
                  >
                    ★
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: spacing.sm }}>
              Add a comment (optional)
            </Text>
            
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="How was the ride? Anything to add?"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              maxLength={250}
              style={[
                forms.input,
                { minHeight: 100, textAlignVertical: "top", marginBottom: spacing.xl }
              ]}
              testID="reviewCommentInput"
            />

            <Pressable
              style={components.button}
              testID="submitRatingButton"
              onPress={() => void submitRating()}
            >
              <Text style={components.buttonText}>
                {submitting ? "SUBMITTING..." : "SUBMIT FEEDBACK"}
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
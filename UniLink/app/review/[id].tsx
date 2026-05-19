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

import { useAuth } from "../../hooks/useAuth";
import { useRides } from "../../hooks/useRides";
import { useReviews } from "../../hooks/useReviews";
import { addReview } from "../../services/ReviewService";
import { generateId } from "../../infra/firebase";

import { components } from "../../styles/components";
import { Button } from "../../components/Button";
import { layout } from "../../styles/layout";
import { forms } from "../../styles/forms";
import { colors, spacing } from "../../styles/theme";

export default function ReviewRide() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const id = typeof params.id === "string" ? params.id : "";
  const targetUserId = typeof params.targetUserId === "string" ? params.targetUserId : "";

  const rides = useRides();
  const { user: activeUser, getUserById } = useAuth();
  const { hasReviewForRide } = useReviews();

  const ride = rides.find(r => r.id === id);
  const targetUser = targetUserId ? getUserById(targetUserId) : undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const joined = ride && activeUser ? ride.passengers.includes(activeUser.uid) : false;
  const isDriver = ride && activeUser ? ride.driverId === activeUser.uid : false;
  const canAccess = !!ride && !!activeUser && !!targetUser && joined && !isDriver && ride.completed;

  const alreadyReviewed = ride && activeUser && targetUser
    ? hasReviewForRide(ride.id, activeUser.uid, targetUser.uid)
    : false;

  useEffect(() => {
    if (ride && activeUser && targetUser && !canAccess) {
      Alert.alert("Not allowed", "You cannot review this ride.");
      router.replace("/(tabs)/myRides");
    }
  }, [canAccess, ride, activeUser, targetUser, router]);

  if (!ride || !activeUser || !targetUser || !canAccess) {
    return null;
  }

  async function submitRating() {
    if (!ride || !activeUser || !targetUser) return;
    if (submitting) return;

    if (rating < 1 || rating > 5) {
      Alert.alert("Select rating", "Choose a rating between 1 and 5 stars.");
      return;
    }

    if (alreadyReviewed) {
      Alert.alert("Already reviewed", "You have already reviewed this user for this ride.");
      router.replace("/(tabs)/myRides");
      return;
    }

    setSubmitting(true);

    const result = await addReview({
      id: generateId("reviews"),
      rideId: ride.id,
      reviewerId: activeUser.uid,
      revieweeId: targetUser.uid,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    });

    setSubmitting(false);

    if (!result.ok) {
      Alert.alert("Error", result.error);
      return;
    }

    Alert.alert(
      "Feedback submitted",
      "Thank you for your feedback.",
      [{ text: "OK", onPress: () => router.replace("/(tabs)/myRides") }]
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
          contentContainerStyle={layout.scrollContentLg}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={layout.backLink} onPress={() => router.back()}>
            ← Back
          </Text>

          <View style={components.card}>
            <Text style={layout.title}>
              Rate driver
            </Text>

            <Text style={[layout.headingSm, { marginBottom: spacing.sm }]}>
              {targetUser.name}
            </Text>

            <Text style={[layout.textLight, { marginBottom: spacing.xl }]}>
              {ride.origin} → {ride.destination}
            </Text>

            <View style={[components.row, { justifyContent: "center", marginBottom: spacing.xl }]}>
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

            <Text style={[layout.headingSm, { marginBottom: spacing.sm }]}>
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
              style={[forms.input, forms.multiline, { marginBottom: spacing.xl }]}
              testID="reviewCommentInput"
            />

            <Button
              testID="submitRatingButton"
              onPress={() => void submitRating()}
              label={submitting ? "SUBMITTING..." : "SUBMIT FEEDBACK"}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

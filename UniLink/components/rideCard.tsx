import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatDate } from "../utils/date";
import { components } from "../styles/components";
import { colors, spacing } from "../styles/theme";
import { getCurrentUser, getUserById } from "../data/user";
import { hasReportForRide, getReports } from "../data/reports";
import { hasReviewForRide, getReviewsForUser, getReviews } from "../data/reviews";
import type { Ride } from "../types/Ride";

function ratingBackground(rating: number) {
  if (rating >= 4) return colors.primaryLight;
  if (rating === 3) return "#fef9c3";
  return colors.dangerSoft;
}

interface Tag {
  key: string;
  emoji: string;
  description: string;
  bg?: string;
}

export default function RideCard({
  ride,
  onPress,
  showOccupancyLabel = false,
}: {
  ride: Ride;
  onPress: () => void;
  showOccupancyLabel?: boolean;
}) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const user = getCurrentUser();

  const tags: Tag[] = [];

  if (ride.womenOnly) {
    tags.push({
      key: "womenOnly",
      emoji: "♀️",
      description: "Women only ride",
      bg: colors.womenSoft
    });
  }

  if (ride.completed) {
    tags.push({
      key: "completed",
      emoji: "✅",
      description: "Ride completed",
      bg: colors.primaryLight
    });
  }

  if (user) {
    const isPassenger =
      ride.passengers.includes(user.uid) ||
      ride.passengers.includes(user.email);

    const isDriver =
      ride.driverId === user.uid ||
      ride.driverId === user.email;

    // --- DRIVER: average rating tag for this ride ---
    if (isDriver && ride.completed) {
      const rideReviews = getReviews().filter(
        r => r.rideId === ride.id &&
          (r.revieweeId === user.uid || r.revieweeId === user.email)
      );

      if (rideReviews.length > 0) {
        const avg = rideReviews.reduce((sum, r) => sum + r.rating, 0) / rideReviews.length;
        const avgRounded = Number(avg.toFixed(1));
        tags.push({
          key: "driverRating",
          emoji: `⭐ ${avgRounded}`,
          description: `Your average rating on this ride (${rideReviews.length} ${rideReviews.length === 1 ? "review" : "reviews"})`,
          bg: ratingBackground(avgRounded),
        });
      } else {
        tags.push({
          key: "driverNoRating",
          emoji: "⭐",
          description: "No ratings received for this ride yet",
          bg: "#f3f4f6",
        });
      }
    }

    // --- Report warning: persistent across ALL rides this person is in ---
    // Check if current user has ever reported anyone who is in this ride
    const allReports = getReports();
    const reportedInThisRide =
      [...ride.passengers, ride.driverId].some(targetId => {
        if (targetId === user.uid) return false;
        return allReports.some(
          report =>
            report.reporterId === user.uid &&
            (report.reportedUserId === targetId)
        );
      });

    if (reportedInThisRide) {
      tags.push({
        key: "reported",
        emoji: "⚠️",
        description: "You have reported someone who is on this ride",
        bg: colors.dangerSoft
      });
    }

    // --- PASSENGER: rating tag for completed rides ---
    if (isPassenger && !isDriver && ride.completed) {
      const myReview = getReviewsForUser(ride.driverId).find(
        r =>
          r.rideId === ride.id &&
          (r.reviewerId === user.uid)
      );

      if (myReview) {
        tags.push({
          key: "rating",
          emoji: `⭐ ${myReview.rating}`,
          description: `You rated this driver ${myReview.rating}/5`,
          bg: ratingBackground(myReview.rating),
        });
      } else {
        tags.push({
          key: "rate",
          emoji: "⭐",
          description: "You haven't rated this driver yet",
          bg: "#e5e7eb", // grey instead of yellow
        });
      }
    }
  }

  return (
    <Pressable style={components.card} onPress={onPress}>

      {/* ROUTE */}
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
        {ride.origin} → {ride.destination}
      </Text>

      {/* DATE */}
      <Text style={{ marginBottom: spacing.sm }}>
        {formatDate(ride.departureDateTime)}
      </Text>

      {/* INFO ROW */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>

        {/* OCCUPANCY */}
        <Text style={{ fontWeight: "500", color: colors.textLight }}>
          {showOccupancyLabel && "Occupancy: "}
          {ride.totalSeats - ride.availableSeats}
          {" / "}
          {ride.totalSeats}
          {!showOccupancyLabel && " seats"}
        </Text>

        {/* TAGS */}
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          {tags.map(tag => (
            <Pressable
              key={tag.key}
              onPress={e => {
                e.stopPropagation?.();
                setOpenTooltip(
                  openTooltip === tag.key ? null : tag.key
                );
              }}
              style={{
                backgroundColor: tag.bg ?? "#f3f4f6",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 13 }}>{tag.emoji}</Text>
            </Pressable>
          ))}
        </View>

      </View>

      {/* TOOLTIP */}
      {openTooltip && (
        <View style={{
          marginTop: spacing.sm,
          backgroundColor: "#1f2937",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
          alignSelf: "flex-end",
        }}>
          <Text style={{ color: "white", fontSize: 12 }}>
            {tags.find(t => t.key === openTooltip)?.description}
          </Text>
        </View>
      )}

    </Pressable>
  );
}

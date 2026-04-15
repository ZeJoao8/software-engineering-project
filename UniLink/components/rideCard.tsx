import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatDate } from "../utils/date";
import { components } from "../styles/components";
import { colors, spacing } from "../styles/theme";
import { getCurrentUser } from "../data/user";
import { hasReportForRide } from "../data/reports";
import { hasReviewForRide, getReviewsForUser } from "../data/reviews";
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

    // report warning — reportei alguém nesta ride
    const reportedSomeone =
      ride.completed &&
      [...ride.passengers, ride.driverId].some(
        targetId =>
          targetId !== user.uid &&
          targetId !== user.email &&
          hasReportForRide(
            ride.id,
            user.uid,
            targetId,
            user.email,
            targetId
          )
      );

    if (reportedSomeone) {
      tags.push({
        key: "reported",
        emoji: "⚠️",
        description: "You reported someone on this ride",
        bg: colors.dangerSoft
      });
    }

    // rating — só para passageiros em rides completadas
    if (isPassenger && !isDriver && ride.completed) {
      const myReview = getReviewsForUser(ride.driverId).find(
        r =>
          r.rideId === ride.id &&
          (r.reviewerId === user.uid || r.reviewerId === user.email)
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
          bg: "#fef3c7",
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
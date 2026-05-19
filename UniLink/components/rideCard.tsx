import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatDate } from "../utils/date";
import { components } from "../styles/components";
import { colors, spacing } from "../styles/theme";
import { getCurrentUser, getUserById } from "../data/user";
import { getReports } from "../data/reports";
import { getReviewsForUser, getReviews } from "../data/reviews";
import type { Ride } from "../types/Ride";

function ratingBackground(rating: number) {
  if (rating >= 4) return colors.primaryLight;
  if (rating === 3) return colors.warning;
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
      bg: colors.womenSoft,
    });
  }

  if (ride.friendsOnly) {
    tags.push({
      key: "friendsOnly",
      emoji: "👥",
      description: "Friends only ride",
      bg: colors.primarySoft,
    });
  }

  if (user) {
    const isPassenger =
      ride.passengers.includes(user.uid)

    const isDriver =
      ride.driverId === user.uid

    if (isDriver && ride.completed) {
      const rideReviews = getReviews().filter(
        r => r.rideId === ride.id &&
          (r.revieweeId === user.uid)
      );

      if (rideReviews.length > 0) {
        const avg = rideReviews.reduce((sum, r) => sum + r.rating, 0) / rideReviews.length;
        const avgRounded = Number(avg.toFixed(1));
        const hasComments = rideReviews.some(r => r.comment.trim().length > 0);

        tags.push({
          key: "driverRating",
          emoji: `⭐ ${avgRounded}${hasComments ? " 💬" : ""}`,
          description: `Your average rating on this ride ${hasComments ? "— Passenger left feedback!" : ""}`,
          bg: ratingBackground(avgRounded),
        });
      } else {
        tags.push({
          key: "driverNoRating",
          emoji: "⭐",
          description: "No ratings received for this ride yet",
          bg: colors.neutral,
        });
      }
    }

    // Report warning: check if current user has reported anyone in this ride
    const allReports = getReports();
    const reportedInThisRide =
      [...ride.passengers, ride.driverId].some(targetId => {
        if (targetId === user.uid) return false;
        return allReports.some(
          report =>
            report.reporterId === user.uid &&
            report.reportedUserId === targetId
        );
      });

    const myRideReviews = getReviews().filter(
      r => r.rideId === ride.id &&
        (r.reviewerId === user.uid)
    );

    const myComments = myRideReviews.some(r => r.comment.trim().length > 0);

    if (reportedInThisRide) {
      tags.push({
        key: "reported",
        emoji: "⚠️",
        description: "You have reported someone who is on this ride",
        bg: colors.dangerSoft,
      });
    }

    if (isPassenger && !isDriver && ride.completed) {
      const myReview = getReviewsForUser(ride.driverId).find(
        r =>
          r.rideId === ride.id &&
          r.reviewerId === user.uid
      );

      if (myReview) {
        tags.push({
          key: "rating",
          emoji: `⭐ ${myReview.rating} ${myComments ? ' 💬' : ''}`,
          description: `You rated this driver ${myReview.rating}/5 ${myComments ? "and gave feedback" : ""}`,
          bg: ratingBackground(myReview.rating),
        });
      } else {
        tags.push({
          key: "rate",
          emoji: "⭐",
          description: "You haven't rated this driver yet",
          bg: colors.neutralLight,
        });
      }
    }
  }

  return (
    <Pressable style={components.card} onPress={onPress}>
      {/* COMPLETED BADGE */}
      {ride.completed && (
        <View style={{ alignSelf: "flex-end", backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 4, borderWidth: 1, borderColor: colors.primaryLight }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.primary }}>COMPLETED ✅</Text>
        </View>
      )}

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
          {showOccupancyLabel && "Seats: "}
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
              style={[
                {
                  backgroundColor: tag.bg ?? colors.neutral,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                },
                openTooltip === tag.key && components.activeHighlight,
                openTooltip && openTooltip !== tag.key && components.inactiveDim
              ]}
            >
              <Text style={{ fontSize: 13 }}>{tag.emoji}</Text>
            </Pressable>
          ))}
        </View>

      </View>

      {/* TOOLTIP */}
      {openTooltip && (
        <View style={[components.tooltip, { alignSelf: "flex-end" }]}>
          <Text style={components.tooltipText}>
            {tags.find(t => t.key === openTooltip)?.description}
          </Text>
        </View>
      )}

    </Pressable>
  );
}

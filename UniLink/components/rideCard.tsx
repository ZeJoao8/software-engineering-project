import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatDate } from "../utils/date";
import { components } from "../styles/components";
import { layout } from "../styles/layout";
import { colors } from "../styles/theme";
import { useAuth } from "../hooks/useAuth";
import { useReviews } from "../hooks/useReviews";
import { useReports } from "../hooks/useReports";
import type { Ride } from "../domain/entities/Ride";
import {
  buildRideCardTags,
  type RideCardTag,
} from "../domain/rules/rideCardTags";

interface DisplayTag {
  key: string;
  emoji: string;
  description: string;
  bg: string;
}

function ratingBackground(rating: number) {
  if (rating >= 4) return colors.primaryLight;
  if (rating === 3) return colors.warning;
  return colors.dangerSoft;
}

function toDisplayTag(tag: RideCardTag): DisplayTag {
  switch (tag.kind) {
    case "womenOnly":
      return {
        key: "womenOnly",
        emoji: "♀️",
        description: "Women only ride",
        bg: colors.womenSoft,
      };
    case "driverRating":
      return {
        key: "driverRating",
        emoji: `⭐ ${tag.average}${tag.hasComments ? " 💬" : ""}`,
        description: `Your average rating on this ride ${tag.hasComments ? "— Passenger left feedback!" : ""}`,
        bg: ratingBackground(tag.average),
      };
    case "driverNoRating":
      return {
        key: "driverNoRating",
        emoji: "⭐",
        description: "No ratings received for this ride yet",
        bg: colors.neutral,
      };
    case "reportedInRide":
      return {
        key: "reported",
        emoji: "⚠️",
        description: "You have reported someone who is on this ride",
        bg: colors.dangerSoft,
      };
    case "passengerRating":
      return {
        key: "rating",
        emoji: `⭐ ${tag.rating}${tag.hasComment ? " 💬" : ""}`,
        description: `You rated this driver ${tag.rating}/5${tag.hasComment ? " and gave feedback" : ""}`,
        bg: ratingBackground(tag.rating),
      };
    case "passengerNoRating":
      return {
        key: "rate",
        emoji: "⭐",
        description: "You haven't rated this driver yet",
        bg: colors.border,
      };
  }
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

  const { user } = useAuth();
  const { reviews } = useReviews();
  const { reports } = useReports();

  const tags: DisplayTag[] = user
    ? buildRideCardTags(ride, user.uid, reviews, reports).map(toDisplayTag)
    : ride.womenOnly
      ? [toDisplayTag({ kind: "womenOnly" })]
      : [];

  return (
    <Pressable style={components.card} onPress={onPress}>
      {/* COMPLETED BADGE */}
      {ride.completed && (
        <View style={components.completedTag}>
          <Text style={components.completedTagText}>COMPLETED ✅</Text>
        </View>
      )}

      {/* ROUTE */}
      <Text style={layout.cardTitle}>
        {ride.origin} → {ride.destination}
      </Text>

      {/* DATE */}
      <Text style={[layout.textLight, { marginBottom: 8 }]}>
        {formatDate(ride.departureDateTime)}
      </Text>

      {/* INFO ROW */}
      <View style={components.rowSpaceBetween}>

        {/* OCCUPANCY */}
        <Text style={layout.textLight}>
          {showOccupancyLabel && "Seats: "}
          {ride.totalSeats - ride.availableSeats}
          {" / "}
          {ride.totalSeats}
          {!showOccupancyLabel && " seats"}
        </Text>

        {/* TAGS */}
        <View style={components.rowGap}>
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
                  backgroundColor: tag.bg,
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

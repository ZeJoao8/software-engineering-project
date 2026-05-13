import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BadgeStatus, BadgeLevel } from "../utils/badges";
import { colors, spacing } from "../styles/theme";
import { components } from "../styles/components";

interface BadgeDisplayProps {
  badges: BadgeStatus[];
  showProgress?: boolean;
}

const LEVEL_COLORS: Record<BadgeLevel, string> = {
  none: "#E5E7EB",
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  diamond: "#B9F2FF",
};

export function BadgeDisplay({ badges, showProgress = false }: BadgeDisplayProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const activeBadge = badges.find(b => b.id === openTooltip);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={components.badgesRow}
      >
        {badges.map((badge) => {
          const isLocked = badge.level === "none";
          const bgColor = LEVEL_COLORS[badge.level];
          const iconColor = isLocked ? "#9CA3AF" : "#1F2937";
          const isSelected = openTooltip === badge.id;

          return (
            <Pressable
              key={badge.id}
              style={components.badgeWrapper}
              onPress={() => setOpenTooltip(openTooltip === badge.id ? null : badge.id)}
            >
              <View
                style={[
                  components.badgeCircle,
                  { backgroundColor: bgColor, opacity: openTooltip && !isSelected ? 0.4 : (isLocked ? 0.6 : 1) },
                  isSelected && components.activeHighlight
                ]}
              >
                <Ionicons
                  name={badge.icon as any}
                  size={32}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  components.badgeTitle,
                  { color: isLocked ? colors.textLight : colors.text },
                ]}
                numberOfLines={1}
              >
                {badge.title}
              </Text>
              {isLocked ? (
                <Text style={components.badgeCaption}>Locked</Text>
              ) : (
                <Text style={components.badgeLevelText}>
                  {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                </Text>
              )}
              {!isLocked && showProgress && (
                <Text style={components.badgeCaption}>{badge.description}</Text>
              )}

              {showProgress && badge.nextLevelThreshold !== null && (
                <Text style={components.badgeProgress}>
                  Next: {Math.floor(badge.progress)} / {badge.nextLevelThreshold}
                </Text>
              )}

              {!isLocked && badge.nextLevelThreshold === null && (
                <Text style={components.badgeMaxLevel}>
                  Max Level! 🏆
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {activeBadge && (
        <View style={[components.tooltip, { marginTop: spacing.xs, marginHorizontal: spacing.sm }]}>
          <Text style={[components.tooltipText, { textAlign: "center", fontWeight: "700", marginBottom: 2, color: colors.primaryLight }]}>
            {activeBadge.title}
          </Text>
          <Text style={[components.tooltipText, { textAlign: "center" }]}>
            {activeBadge.level === 'none'
              ? `Requires ${activeBadge.nextLevelThreshold} to unlock`
              : `Unlocked at ${activeBadge.currentLevelThreshold}`}
          </Text>
        </View>
      )}
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
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
        contentContainerStyle={styles.container}
      >
        {badges.map((badge) => {
          const isLocked = badge.level === "none";
          const bgColor = LEVEL_COLORS[badge.level];
          const iconColor = isLocked ? "#9CA3AF" : "#1F2937";
          const isSelected = openTooltip === badge.id;
          const opacity = openTooltip && !isSelected ? 0.3 : (isLocked ? 0.6 : 1);

          return (
            <Pressable
              key={badge.id}
              style={styles.badgeWrapper}
              onPress={() => setOpenTooltip(openTooltip === badge.id ? null : badge.id)}
            >
              <View
                style={[
                  styles.badgeCircle,
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
                  styles.title,
                  { color: isLocked ? colors.textLight : colors.text },
                ]}
                numberOfLines={1}
              >
                {badge.title}
              </Text>
              {isLocked ? (
                <Text style={styles.description}>Locked</Text>
              ) : (
                <Text style={styles.levelText}>
                  {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                </Text>
              )}
              {!isLocked && showProgress && (
                <Text style={styles.description}>{badge.description}</Text>
              )}

              {showProgress && badge.nextLevelThreshold !== null && (
                <Text style={styles.progressText}>
                  Next: {Math.floor(badge.progress)} / {badge.nextLevelThreshold}
                </Text>
              )}
              
              {!isLocked && badge.nextLevelThreshold === null && (
                <Text style={styles.maxLevelText}>
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  badgeWrapper: {
    alignItems: "center",
    width: 90,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  description: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 2,
  },
  progressText: {
    fontSize: 9,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  maxLevelText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#D4AF37",
    textAlign: "center",
    marginTop: 4,
  },
});

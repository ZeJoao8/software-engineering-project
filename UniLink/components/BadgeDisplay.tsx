import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BadgeStatus, BadgeLevel } from "../utils/badges";
import { colors, spacing } from "../styles/theme";

interface BadgeDisplayProps {
  badges: BadgeStatus[];
}

const LEVEL_COLORS: Record<BadgeLevel, string> = {
  none: "#E5E7EB", // gray-200
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  diamond: "#B9F2FF",
};

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {badges.map((badge) => {
        const isLocked = badge.level === "none";
        const bgColor = LEVEL_COLORS[badge.level];
        const iconColor = isLocked ? "#9CA3AF" : "#1F2937"; // gray-400 or gray-800

        return (
          <View key={badge.id} style={styles.badgeWrapper}>
            <View
              style={[
                styles.badgeCircle,
                { backgroundColor: bgColor, opacity: isLocked ? 0.6 : 1 },
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
            {!isLocked && (
              <Text style={styles.description}>{badge.description}</Text>
            )}

            {badge.nextLevelThreshold !== null ? (
              <Text style={styles.progressText}>
                Next: {Math.floor(badge.progress)} / {badge.nextLevelThreshold}
              </Text>
            ) : (
              <Text style={styles.maxLevelText}>
                Max Level! 🏆
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
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

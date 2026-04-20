import { StyleSheet } from "react-native";
import { colors, spacing } from "./theme";

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background, // updated to new slate background
    padding: spacing.md,
  },

  scrollScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 28, // larger premium header
    fontWeight: "800", // heavier bolder weight
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.5, // tighter letter spacing for modern look
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textLight, // soften subtitle
    marginBottom: spacing.xs,
    lineHeight: 22,
  },

  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  metadata: {
    color: "#94a3b8", // slate-400
    fontSize: 14,
  },

  metadataBold: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  }
});
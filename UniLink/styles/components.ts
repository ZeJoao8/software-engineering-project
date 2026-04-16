import { StyleSheet } from "react-native";

import {
 colors,
 spacing,
 radius
} from "./theme";

export const components = StyleSheet.create({

 card: {
  backgroundColor: colors.card,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderRadius: radius.lg,
  marginBottom: spacing.md,
  borderColor: colors.border,
  borderWidth: 1,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
 },

 button: {
  backgroundColor: colors.primary,
  paddingVertical: spacing.md,
  borderRadius: radius.md,
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
 },

 buttonText: {
  color: "white",
  fontWeight: "600",
  letterSpacing: 0.5,
 },

 outlineButton: {
  borderWidth: 1,
  borderColor: colors.primary,
  paddingVertical: 10,
  borderRadius: radius.md,
  alignItems: "center",
 },

 outlineButtonText: {
  color: colors.primary,
  fontWeight: "600",
 },

 tag: {
  backgroundColor: colors.primarySoft,
  color: colors.primary,
  paddingHorizontal: spacing.sm,
  paddingVertical: 3,
  borderRadius: radius.sm,
  fontSize: 12,
 },

 /** Small inline button used for destructive actions (e.g. "Report"). */
 dangerTag: {
  backgroundColor: colors.warningSoft,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: radius.sm,
 },

 /** Card used for negative feedback items (low ratings, reports). */
 feedbackCard: {
  backgroundColor: colors.warningSoft,
  borderRadius: radius.sm,
  padding: spacing.sm,
  marginBottom: spacing.sm,
  borderLeftWidth: 3,
  borderLeftColor: colors.danger,
 },

 pickerWrapper: {
  borderColor: colors.primary,
  borderWidth: 1,
  borderRadius: radius.md,
  backgroundColor: "white",
  minHeight: 48,
  justifyContent: "center",
 },

 dropdown: {
  borderWidth: 0,
  backgroundColor: "transparent",
  minHeight: 48,
 },

 dropdownContainer: {
  borderColor: colors.primary,
  borderWidth: 1,
  borderRadius: radius.md,
  backgroundColor: "white",
 },

 dropdownText: {
  fontWeight: "600",
  color: colors.primary,
 },

 dropdownPlaceholder: {
  color: colors.textLight,
 },

});
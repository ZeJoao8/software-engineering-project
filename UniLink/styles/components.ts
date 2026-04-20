import { StyleSheet } from "react-native";

import {
 colors,
 spacing,
 radius
} from "./theme";

export const components = StyleSheet.create({

 card: {
  backgroundColor: colors.card,
  paddingVertical: 20,
  paddingHorizontal: spacing.md,
  borderRadius: radius.lg,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.03)", // very subtle border instead of harsh green
  shadowColor: "#0f172a", // sleek slate shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 12,
  elevation: 3,
 },

 button: {
  backgroundColor: colors.primary,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderRadius: radius.xl, // pill-like premium buttons
  alignItems: "center",
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 4,
 },

 buttonText: {
  color: "white",
  fontWeight: "700",
  fontSize: 16,
  letterSpacing: 0.3,
  textTransform: "uppercase", // adds a nice touch for main buttons
 },

 outlineButton: {
  borderWidth: 1.5,
  borderColor: colors.border,
  paddingVertical: spacing.md,
  borderRadius: radius.xl,
  alignItems: "center",
  backgroundColor: "transparent",
 },

 outlineButtonText: {
  color: colors.text, // subtler than solid primary green
  fontWeight: "600",
  fontSize: 16,
 },

 tag: {
  backgroundColor: colors.primarySoft,
  color: colors.primaryDark,
  paddingHorizontal: spacing.md,
  paddingVertical: 6,
  borderRadius: radius.md,
  fontSize: 12,
  fontWeight: "600",
  overflow: "hidden", // for ios border radius on text
 },

 /** Small inline button used for destructive actions (e.g. "Report"). */
 dangerTag: {
  backgroundColor: colors.dangerSoft,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: radius.md,
 },

 /** Card used for negative feedback items (low ratings, reports). */
 feedbackCard: {
  backgroundColor: colors.warningSoft,
  borderRadius: radius.md,
  padding: spacing.md,
  marginBottom: spacing.md,
  borderLeftWidth: 4,
  borderLeftColor: colors.danger,
 },

 pickerWrapper: {
  borderColor: colors.border,
  borderWidth: 1.5,
  borderRadius: radius.md,
  backgroundColor: "#f8fafc",
  minHeight: 52,
  justifyContent: "center",
 },

 dropdown: {
  borderWidth: 0,
  backgroundColor: "transparent",
  minHeight: 52,
 },

 dropdownContainer: {
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radius.md,
  backgroundColor: colors.card,
  shadowColor: "#0f172a",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 5,
 },

 dropdownText: {
  fontWeight: "500",
  color: colors.text,
  fontSize: 15,
 },

 dropdownPlaceholder: {
  color: colors.textLight,
  fontSize: 15,
 },

});
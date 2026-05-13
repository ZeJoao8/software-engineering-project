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

 /** Small inline button for primary actions (e.g. "Verify") — mirrors dangerTag. */
 primaryTag: {
  backgroundColor: colors.primarySoft,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: radius.md,
 },

 primaryTagText: {
  color: colors.primary,
  fontSize: 12,
  fontWeight: "600",
 },

 /** Small inline button used for destructive actions (e.g. "Report"). */
 dangerTag: {
  backgroundColor: colors.dangerSoft,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: radius.md,
 },

 /**
  * Card used for negative feedback items and reports.
  * No borderLeftColor here — callers supply it via getFeedbackStyle() or
  * the dangerLeftBorder helper below, so the base never conflicts with overrides.
  */
 feedbackCard: {
  backgroundColor: colors.warningSoft,
  borderRadius: radius.md,
  padding: spacing.md,
  marginBottom: spacing.md,
  borderLeftWidth: 4,
 },

 /** Apply alongside feedbackCard on report cards (no rating override). */
 dangerLeftBorder: {
  borderLeftColor: colors.danger,
 },

 pickerWrapper: {
  borderColor: colors.border,
  borderWidth: 1.5,
  borderRadius: radius.md,
  backgroundColor: colors.background,
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

 tooltip: {
  marginTop: spacing.sm,
  backgroundColor: colors.text,
  borderRadius: radius.sm,
  paddingHorizontal: 10,
  paddingVertical: 6,
  zIndex: 10,
 },

 tooltipText: {
  color: "white",
  fontSize: 12,
 },

 activeHighlight: {
  borderWidth: 2,
  borderColor: colors.primary,
 },

 inactiveDim: {
  opacity: 0.4,
 },

 // ─── Ride card tags ───────────────────────────────────────────────────────

 completedTag: {
  alignSelf: "flex-end",
  backgroundColor: colors.primarySoft,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  marginBottom: 4,
  borderWidth: 1,
  borderColor: colors.primaryLight,
 },

 completedTagText: {
  fontSize: 11,
  fontWeight: "700",
  color: colors.primary,
 },

 // ─── Verified passenger badge ─────────────────────────────────────────────

 verifiedBadge: {
  backgroundColor: colors.primarySoft,
  borderWidth: 1,
  borderColor: colors.primaryLight,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 6,
 },

 verifiedBadgeText: {
  fontSize: 12,
  fontWeight: "700",
  color: colors.primaryDark,
 },

 // ─── Danger tag text (Report button label, etc.) ──────────────────────────

 dangerTagText: {
  color: colors.danger,
  fontSize: 12,
  fontWeight: "600",
 },

 // ─── Boarding code display ────────────────────────────────────────────────

 boardingCode: {
  fontSize: 32,
  fontWeight: "800",
  letterSpacing: 6,
  color: colors.primary,
  marginBottom: spacing.sm,
 },

 // ─── Leaderboard ──────────────────────────────────────────────────────────

 leaderboardScrollContent: {
  padding: spacing.lg,
  paddingBottom: spacing.xl,
 },

 leaderboardCurrentUser: {
  borderColor: colors.primary,
  borderWidth: 2,
  backgroundColor: "white",
 },

 rankNumber: {
  fontSize: 18,
  fontWeight: "700",
  width: 45,
  color: colors.textLight,
 },

 rankNumberTop: {
  color: colors.primary,
  fontSize: 20,
 },

 rankName: {
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
 },

 rankCO2: {
  fontSize: 13,
  color: colors.textLight,
  marginTop: 2,
 },

 rankTrophy: {
  fontSize: 24,
 },

 rankDivider: {
  alignItems: "center",
  marginVertical: spacing.md,
 },

 rankDividerText: {
  color: colors.textLight,
  fontSize: 20,
  fontWeight: "600",
 },

 // ─── ZoomControls ─────────────────────────────────────────────────────────

 zoomControls: {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: radius.sm,
  elevation: 4,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
 },

 zoomButton: {
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
 },

 zoomButtonText: {
  fontSize: 24,
  color: colors.primary,
  fontWeight: "400",
  lineHeight: 28,
 },

 zoomDivider: {
  width: 32,
  height: StyleSheet.hairlineWidth,
  backgroundColor: colors.border,
 },

 // ─── AddressAutocomplete ──────────────────────────────────────────────────

 autocomplete: {
  position: "relative",
  zIndex: 10,
 },

 autocompleteRow: {
  flexDirection: "row",
  alignItems: "center",
 },

 autocompleteLoader: {
  position: "absolute",
  right: 12,
 },

 suggestionsList: {
  backgroundColor: "white",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  marginTop: 4,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
  overflow: "hidden",
 },

 suggestionItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 12,
  gap: spacing.sm,
 },

 suggestionSeparator: {
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: colors.border,
 },

 suggestionHighlight: {
  backgroundColor: colors.primarySoft,
 },

 suggestionIconText: {
  fontSize: 16,
 },

 suggestionTextGroup: {
  flex: 1,
 },

 suggestionName: {
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
 },

 suggestionDetail: {
  fontSize: 11,
  color: colors.textLight,
  marginTop: 1,
 },

 // ─── BadgeDisplay ─────────────────────────────────────────────────────────

 badgesRow: {
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

 badgeTitle: {
  fontSize: 13,
  fontWeight: "600",
  textAlign: "center",
 },

 badgeLevelText: {
  fontSize: 11,
  fontWeight: "700",
  color: colors.primary,
  marginTop: 2,
 },

 badgeCaption: {
  fontSize: 10,
  color: colors.textLight,
  textAlign: "center",
  marginTop: 2,
 },

 badgeProgress: {
  fontSize: 9,
  color: colors.textLight,
  textAlign: "center",
  marginTop: 4,
 },

 badgeMaxLevel: {
  fontSize: 9,
  fontWeight: "700",
  color: "#D4AF37",
  textAlign: "center",
  marginTop: 4,
 },

 // ─── Layout helpers ───────────────────────────────────────────────────────

 row: {
  flexDirection: "row",
  alignItems: "center",
 },

 rowSpaceBetween: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
 },

 rowGap: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
 },

 /** Row used for stat blocks: CO₂, streak, etc. */
 statRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.xs,
 },

 /** Wrapping row for inline tag/badge lists. */
 tagRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
 },

 // ─── Inline pills / badges ────────────────────────────────────────────────

 miniTag: {
  backgroundColor: colors.neutral,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: radius.sm,
 },

 miniTagText: {
  fontSize: 12,
  color: colors.textLight,
  fontWeight: "500",
 },

 /** Primary-coloured inline badge (bus line chips, etc.). */
 badgePrimary: {
  backgroundColor: colors.primaryLight,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
 },

 badgePrimaryText: {
  fontSize: 13,
  color: colors.primaryDark,
  fontWeight: "600",
 },


 /** Rating pill — apply a background colour override based on the rating value. */
 ratingBadge: {
  paddingHorizontal: 7,
  paddingVertical: 2,
  borderRadius: 5,
 },

 ratingBadgeText: {
  fontSize: 12,
  fontWeight: "600",
 },

 /** Hint text displayed below the boarding code number. */
 boardingCodeHint: {
  fontSize: 11,
  color: colors.textLight,
  textAlign: "center",
 },

 // ─── Spacers / margins ────────────────────────────────────────────────────

 spacerXs: { height: spacing.xs },
 spacerSm: { height: spacing.sm },
 spacerMd: { height: spacing.md },
 spacerLg: { height: spacing.lg },

 mtSm: { marginTop: spacing.sm },
 mtMd: { marginTop: spacing.md },
 mbSm: { marginBottom: spacing.sm },

 // ─── Card variants ───────────────────────────────────────────────────────

 /** Card variant for the neutral filter/section panels (neutral bg, border 1.5). */
 cardNeutral: {
  backgroundColor: colors.neutral,
  borderColor: colors.border,
  borderWidth: 1.5,
 },

 /** Card variant for driver/primary section panels (primarySoft bg, primaryLight border 1.5). */
 cardPrimary: {
  backgroundColor: colors.primarySoft,
  borderColor: colors.primaryLight,
  borderWidth: 1.5,
 },

 /** Card variant for embedded RouteMap previews — removes padding and clips the map. */
 cardMap: {
  padding: 0,
  overflow: "hidden",
 },

 // ─── Expandable section card ─────────────────────────────────────────────

 /** Card variant with a primary-colour border, used for featured collapsible sections. */
 expandableCard: {
  borderColor: colors.primaryLight,
  borderWidth: 1.5,
 },

 // ─── Warning / info box ───────────────────────────────────────────────────

 /** Inline warning box with yellow-soft background (missing coord, validation error, etc.). */
 infoBox: {
  backgroundColor: colors.warningSoft,
  borderRadius: radius.sm,
  padding: spacing.sm,
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.xs,
  marginTop: spacing.xs,
 },

 infoBoxText: {
  fontSize: 13,
  flex: 1,
  lineHeight: 18,
 },

 // ─── Boarding code card ───────────────────────────────────────────────────

 /** Highlighted card shown to passengers with their boarding code. */
 boardingCodeCard: {
  borderWidth: 1.5,
  borderColor: colors.primaryLight,
  backgroundColor: colors.primarySoft,
  alignItems: "center",
 },

 // ─── Bus route leg row ────────────────────────────────────────────────────

 /** Card variant laid out as a horizontal row for transit leg items. */
 legRow: {
  marginBottom: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
 },

 // ─── Map action button ────────────────────────────────────────────────────

 /** "🗺️ Or choose on map" Pressable row (inline below address autocomplete). */
 mapActionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.xs,
  marginBottom: spacing.sm,
 },

});
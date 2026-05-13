import { StyleSheet } from "react-native";
import { colors, spacing } from "./theme";

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  scrollScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textLight,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },

  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  metadata: {
    color: colors.textFaint,
    fontSize: 14,
  },

  metadataBold: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  /** "← Back" navigation link used at top of detail screens. */
  backLink: {
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },

  /** Inline primary-coloured text link (driver name, passenger name, etc.). */
  link: {
    color: colors.primary,
    fontWeight: "600",
  },

  /** Section heading inside a card (e.g. "17px bold" titles like bus route name). */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },

  /** Large numeric value in stat blocks (CO₂, streak, etc.). */
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },

  /** Caption below a stat value. */
  statLabel: {
    color: colors.textLight,
    fontSize: 13,
  },

  /** Centred placeholder shown when a list is empty. */
  emptyText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "500",
  },

  /** Wrapper that vertically centres empty-state content. */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
  },

  /** Standard contentContainerStyle for ScrollView screens. */
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  /** contentContainerStyle for detail/form screens with large padding (createRide, review). */
  scrollContentLg: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  /** Centres children horizontally. */
  centered: {
    alignItems: "center",
  },

  /** Muted secondary text. */
  textLight: {
    color: colors.textLight,
  },

  /** Small muted secondary text. */
  textLightSm: {
    fontSize: 13,
    color: colors.textLight,
  },

  /** Danger/error coloured text with emphasis. */
  textDanger: {
    color: colors.danger,
    fontWeight: "600",
  },

  /** Primary bold text for card route/title lines. */
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },

  /** Smaller section heading (15 px). */
  headingSm: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  /** Large emoji icon used in stat/profile blocks. */
  emojiLg: {
    fontSize: 32,
  },

  /** "▲ / ▼" indicator used in all collapsible card headers. */
  collapseIndicator: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: "600",
  },

  /** Link-style text for "🗺️ Or choose on map" action rows. */
  mapActionText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },

  /** "✓ Location defined" and similar inline confirmation indicators. */
  confirmationText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },

  /** "⭐ 4.2 (3 ratings)" line shown under user name on profile screens. */
  ratingText: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: spacing.md,
  },

  /** Shared header bar used on full-screen pushed screens (map, chat, etc.). */
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  /** contentContainerStyle for ScrollView inside a tab-bar screen (extra bottom padding). */
  scrollContentTab: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: 80,
  },
});
import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "./theme";

/**
 * Shared styles for all map-related screens and components:
 * mapView screen, LocationPickerMap modal, RouteMap component.
 */
export const mapStyles = StyleSheet.create({

  // ─── MapView screen ──────────────────────────────────────────────────────

  container: {
    flex: 1,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  map: {
    flex: 1,
  },

  /** Floating pill that shows ride count above the map (legacy — kept for compatibility). */
  badge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
  },

  /** Bottom sheet card shown when a ride marker is selected. */
  rideCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: radius.lg,
    padding: spacing.lg,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardRoute: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },

  closeButton: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: "600",
    padding: 4,
  },

  cardDate: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 8,
  },

  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.md,
  },

  metaText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },

  metaDot: {
    color: colors.textLight,
    fontSize: 13,
  },

  detailButton: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: "center",
  },

  detailButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  // ─── LocationPickerMap modal ─────────────────────────────────────────────

  pickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "white",
  },

  pickerCancelText: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: 15,
  },

  pickerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  pickerInstruction: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  pickerInstructionText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  pickerMap: {
    flex: 1,
  },

  pickerZoomControls: {
    position: "absolute",
    right: 16,
    bottom: "35%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  pickerInfoCard: {
    backgroundColor: "white",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  pickerPlaceName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },

  pickerCoords: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.md,
  },

  pickerConfirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  pickerConfirmText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  // ─── RouteMap component ──────────────────────────────────────────────────

  routeContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },

  routeMap: {
    flex: 1,
  },

  routeLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  routeInfoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  routeInfoText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

});

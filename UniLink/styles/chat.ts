import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "./theme";

export const chatStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /** Same as layout.screenHeader but with tighter horizontal padding for centred title layout. */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },

  listContent: {
    padding: spacing.md,
  },

  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },

  myMessage: {
    alignSelf: "flex-end",
  },

  otherMessage: {
    alignSelf: "flex-start",
  },

  senderName: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "600",
    marginLeft: 4,
  },

  driverBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
  },

  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },

  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },

  otherBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  myMessageText: {
    color: "white",
  },

  otherMessageText: {
    color: colors.text,
  },

  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  myTimeText: {
    color: "rgba(255,255,255,0.7)",
  },

  otherTimeText: {
    color: colors.textLight,
  },

  inputContainer: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },

  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 40,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },

  sendButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },

  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },

});

import { StyleSheet } from "react-native";

import {
 colors,
 spacing,
 radius
} from "./theme";

export const forms = StyleSheet.create({

 input:{
  borderWidth: 1.5,
  borderColor: colors.border, // softer border
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: radius.md,
  backgroundColor: colors.card, // plain white inner background
  color: colors.text,
  fontSize: 16,
 },

 field:{
  marginBottom: spacing.md
 },

 label:{
  fontSize: 14,
  fontWeight: "600",
  marginBottom: 6,
  color: colors.text,
  letterSpacing: 0.2,
 },

 /** Apply to multiline TextInput alongside forms.input. */
 multiline: {
  textAlignVertical: "top",
  minHeight: 80,
 },

 /** Compact input — smaller padding and font, for inline/secondary contexts. */
 inputSm: {
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: 7,
  paddingHorizontal: 10,
  borderRadius: radius.sm,
  backgroundColor: colors.card,
  color: colors.text,
  fontSize: 14,
 },

 /** Boarding-code verification input — centred, spaced digits. */
 boardingCodeInput: {
  flex: 1,
  fontWeight: "600",
  textAlign: "center",
 },

});
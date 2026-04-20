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
 }

});
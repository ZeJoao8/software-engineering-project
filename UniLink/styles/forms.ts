import { StyleSheet }
 from "react-native";

import {
 colors,
 spacing,
 radius
} from "./theme";


export const forms = StyleSheet.create({

 input:{
  borderWidth:1,
  borderColor: colors.primary,
  paddingVertical:10,
  paddingHorizontal:12,
  borderRadius: radius.md,
  backgroundColor:"#f9fafb"
 },

 field:{
  marginBottom: spacing.md
 },

 label:{
  fontSize:13,
  fontWeight:"500",
  marginBottom:4,
  color: colors.textLight
 }

});
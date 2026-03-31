import { StyleSheet }
 from "react-native";

import {
 colors,
 spacing,
 radius
} from "./theme";

export const components = StyleSheet.create({

 card:{
  backgroundColor: colors.card,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderRadius: radius.lg,
  marginBottom: spacing.md,
  borderColor: colors.border,
  borderWidth:1,
  shadowColor:"#000",
  shadowOpacity:0.05,
  shadowRadius:8,
  elevation:2
 },

 button:{
  backgroundColor: colors.primary,
  paddingVertical:12,
  borderRadius: radius.md,
  alignItems:"center",

  shadowColor:"#000",
  shadowOpacity:0.08,
  shadowRadius:4,
  elevation:2
 },

 buttonText:{
  color:"white",
  fontWeight:"600",
  letterSpacing:0.5
 },

 outlineButton:{
  borderWidth:1,
  borderColor: colors.primary,
  paddingVertical:10,
  borderRadius: radius.md,
  alignItems:"center"
 },

 outlineButtonText:{
  color: colors.primary,
  fontWeight:"600"
 },

 tag:{
  backgroundColor:"#f0fdf4",
  color: colors.primary,
  paddingHorizontal:8,
  paddingVertical:3,
  borderRadius:6,
  fontSize:12
 },

 pickerWrapper:{
  borderColor:colors.primary,
  borderWidth:1,
  justifyContent:"center",
  borderRadius: radius.md,
 }

});
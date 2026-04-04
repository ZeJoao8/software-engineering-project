import { StyleSheet }
 from "react-native";

import {
 colors,
 spacing
} from "./theme";


export const layout = StyleSheet.create({

  screen:{
  flex:1,
  backgroundColor: colors.primarySoft,
  padding: spacing.lg
 },

 scrollScreen: {
  flex: 1,
  backgroundColor: colors.primarySoft,
 },

 title:{
  fontSize:22,
  fontWeight:"700",
  color:colors.text,
  marginBottom: spacing.md
 },

 subtitle:{
  fontSize:15,
  fontWeight:"600",
  color:colors.text,
  marginBottom: spacing.xs
 },

 section:{
  marginTop: spacing.lg
 }

});
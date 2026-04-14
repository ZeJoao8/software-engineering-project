import {
 useState
} from "react";

import {
 Pressable,
 View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
 colors,
 radius,
 spacing
} from "../styles/theme";

const outlineGray = "#94a3b8";

type Props = {
 onPick: (stars: number) => void;
};

export function StarRatingPicker({
 onPick
}: Props) {

 const [committed, setCommitted] =
  useState(0);

 const [preview, setPreview] =
  useState(0);

 const show =
  committed > 0
   ? committed
   : preview;

 return (
  <View
   style={{
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: 4
   }}
  >
   {[1, 2, 3, 4, 5].map(star => {

    const filled =
     show > 0 &&
     star <= show;

    return (
     <Pressable
      key={star}
      accessibilityRole="button"
      accessibilityLabel={`Rate ${star} out of 5`}
      android_ripple={{
       color: "rgba(148, 163, 184, 0.2)"
      }}
      onPressIn={() => {
       setPreview(star);
      }}
      onPressOut={() => {
       requestAnimationFrame(() => {
        setPreview(0);
       });
      }}
      onPress={() => {
       setCommitted(star);
       setPreview(0);
       onPick(star);
      }}
      style={{
       paddingHorizontal: spacing.sm,
       paddingVertical: spacing.xs,
       borderRadius: radius.md,
       backgroundColor: filled
        ? colors.primarySoft
        : "transparent",
       minWidth: 40,
       alignItems: "center",
       justifyContent: "center"
      }}
     >
      <Ionicons
       name={
        filled
         ? "star"
         : "star-outline"
       }
       size={26}
       color={
        filled
         ? colors.primary
         : outlineGray
       }
      />
     </Pressable>
    );
   })}
  </View>
 );
}

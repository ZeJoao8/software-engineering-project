import React from "react";
import { Pressable, Text, PressableProps, StyleProp, ViewStyle, TextStyle } from "react-native";
import { components } from "../styles/components";
import { colors } from "../styles/theme";

interface ButtonProps extends PressableProps {
  label: string;
  outline?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({ label, outline, style, textStyle, ...props }: ButtonProps) {
  const baseStyle = outline ? components.outlineButton : components.button;
  const baseTextStyle = outline ? components.outlineButtonText : components.buttonText;

  // The pressed color: if outline, give it a light gray background. If solid, make it a darker primary color.
  const pressedStyle = outline 
    ? { backgroundColor: "rgba(0,0,0,0.05)" }
    : { backgroundColor: colors.primaryDark, elevation: 1, shadowOpacity: 0.1 };

  return (
    <Pressable
      style={({ pressed }) => [
        baseStyle,
        style,
        pressed && pressedStyle
      ]}
      {...props}
    >
      <Text style={[baseTextStyle, textStyle]}>{label}</Text>
    </Pressable>
  );
}

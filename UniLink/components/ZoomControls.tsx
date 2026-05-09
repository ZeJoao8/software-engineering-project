import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { colors } from "../styles/theme";

interface ZoomControlsProps {
  mapRef: React.RefObject<MapView | null>;
  style?: object;
}

export default function ZoomControls({ mapRef, style }: ZoomControlsProps) {
  function zoomIn() {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then(cam => {
      if (!cam) return;
      cam.altitude = (cam.altitude ?? 10000) / 2;
      if (cam.zoom !== undefined) cam.zoom += 1;
      mapRef.current?.animateCamera(cam);
    });
  }

  function zoomOut() {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then(cam => {
      if (!cam) return;
      cam.altitude = (cam.altitude ?? 10000) * 2;
      if (cam.zoom !== undefined) cam.zoom -= 1;
      mapRef.current?.animateCamera(cam);
    });
  }

  return (
    <View style={[styles.zoomControls, style]}>
      <Pressable style={styles.zoomButton} onPress={zoomIn}>
        <Text style={styles.zoomButtonText}>+</Text>
      </Pressable>
      <View style={styles.zoomDivider} />
      <Pressable style={styles.zoomButton} onPress={zoomOut}>
        <Text style={styles.zoomButtonText}>−</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  zoomControls: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: "400",
    lineHeight: 28,
  },
  zoomDivider: {
    width: 32,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});

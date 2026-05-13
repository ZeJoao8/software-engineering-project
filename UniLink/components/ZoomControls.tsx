import React from "react";
import { View, Text, Pressable } from "react-native";
import MapView from "react-native-maps";
import { components } from "../styles/components";

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
    <View style={[components.zoomControls, style]}>
      <Pressable style={components.zoomButton} onPress={zoomIn}>
        <Text style={components.zoomButtonText}>+</Text>
      </Pressable>
      <View style={components.zoomDivider} />
      <Pressable style={components.zoomButton} onPress={zoomOut}>
        <Text style={components.zoomButtonText}>−</Text>
      </Pressable>
    </View>
  );
}

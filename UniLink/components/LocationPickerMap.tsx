import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";

import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  type MapPressEvent,
} from "react-native-maps";

import * as Location from "expo-location";

import {
  reverseGeocode,
  type Coordinates,
} from "../utils/routing";

import { colors } from "../styles/theme";
import { mapStyles } from "../styles/map";
import { components } from "../styles/components";

const FEUP_REGION = {
  latitude: 41.1780,
  longitude: -8.5980,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface LocationPickerMapProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    coords: Coordinates,
    name: string
  ) => void;
  title?: string;
}

export default function LocationPickerMap({
  visible,
  onClose,
  onConfirm,
  title = "Select location",
}: LocationPickerMapProps) {

  const [selected, setSelected] =
    useState<Coordinates | null>(null);

  const mapRef = React.useRef<MapView>(null);

  const [placeName, setPlaceName] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!visible) return;

    void (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        const location =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch {
        // Permission denied or unavailable — stay on FEUP_REGION
      }
    })();
  }, [visible]);

  async function handleMapPress(
    event: MapPressEvent
  ) {
    const coords = event.nativeEvent.coordinate;

    setSelected({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    setLoading(true);

    const name = await reverseGeocode({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    setPlaceName(name);
    setLoading(false);
  }

  function handleConfirm() {
    if (selected && placeName) {
      onConfirm(selected, placeName);
      setSelected(null);
      setPlaceName(null);
    }
  }

  function handleClose() {
    setSelected(null);
    setPlaceName(null);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={mapStyles.pickerContainer}>

        {/* Header */}
        <View style={mapStyles.pickerHeader}>

          <Pressable onPress={handleClose}>
            <Text style={mapStyles.pickerCancelText}>
              Cancel
            </Text>
          </Pressable>

          <Text style={mapStyles.pickerTitle}>
            {title}
          </Text>

          <View style={{ width: 70 }} />

        </View>

        {/* Instruction */}
        <View style={mapStyles.pickerInstruction}>
          <Text style={mapStyles.pickerInstructionText}>
            📍 Tap on the map to select a location
          </Text>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          style={mapStyles.pickerMap}
          provider={PROVIDER_DEFAULT}
          initialRegion={FEUP_REGION}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {selected && (
            <Marker
              coordinate={selected}
              pinColor={colors.primary}
            />
          )}
        </MapView>

        {/* Zoom Controls */}
        <View style={mapStyles.pickerZoomControls}>
          <Pressable
            style={components.zoomButton}
            onPress={() => {
              if (mapRef.current) {
                mapRef.current.getCamera().then((cam) => {
                  if (cam) {
                    cam.altitude = (cam.altitude ?? 10000) / 2;
                    if (cam.zoom) cam.zoom += 1;
                    mapRef.current!.animateCamera(cam);
                  }
                });
              }
            }}
          >
            <Text style={components.zoomButtonText}>+</Text>
          </Pressable>
          <View style={components.zoomDivider} />
          <Pressable
            style={components.zoomButton}
            onPress={() => {
              if (mapRef.current) {
                mapRef.current.getCamera().then((cam) => {
                  if (cam) {
                    cam.altitude = (cam.altitude ?? 10000) * 2;
                    if (cam.zoom) cam.zoom -= 1;
                    mapRef.current!.animateCamera(cam);
                  }
                });
              }
            }}
          >
            <Text style={components.zoomButtonText}>−</Text>
          </Pressable>
        </View>

        {/* Selected place info */}
        {selected && (
          <View style={mapStyles.pickerInfoCard}>

            {loading ? (
              <ActivityIndicator
                color={colors.primary}
              />
            ) : (
              <>
                <Text style={mapStyles.pickerPlaceName}>
                  {placeName}
                </Text>

                <Text style={mapStyles.pickerCoords}>
                  {selected.latitude.toFixed(5)},{" "}
                  {selected.longitude.toFixed(5)}
                </Text>

                <Pressable
                  style={mapStyles.pickerConfirmButton}
                  onPress={handleConfirm}
                  testID="confirmLocationButton"
                >
                  <Text style={mapStyles.pickerConfirmText}>
                    ✓ Confirm location
                  </Text>
                </Pressable>
              </>
            )}

          </View>
        )}

      </SafeAreaView>
    </Modal>
  );
}

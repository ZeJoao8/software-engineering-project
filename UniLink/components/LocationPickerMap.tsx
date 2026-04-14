import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";

import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  type MapPressEvent,
} from "react-native-maps";

import {
  reverseGeocode,
  type Coordinates,
} from "../utils/routing";

import { colors, spacing, radius } from "../styles/theme";

// FEUP coordinates as default center
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
  title = "Selecionar local",
}: LocationPickerMapProps) {

  const [selected, setSelected] =
    useState<Coordinates | null>(null);

  const mapRef = React.useRef<MapView>(null);

  const [placeName, setPlaceName] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

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
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>

          <Pressable onPress={handleClose}>
            <Text style={styles.cancelText}>
              Cancelar
            </Text>
          </Pressable>

          <Text style={styles.title}>
            {title}
          </Text>

          <View style={{ width: 70 }} />

        </View>

        {/* Instruction */}
        <View style={styles.instruction}>
          <Text style={styles.instructionText}>
            📍 Tap on the map to select a location
          </Text>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          style={styles.map}
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
        <View style={styles.zoomControls}>
          <Pressable
            style={styles.zoomButton}
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
            <Text style={styles.zoomButtonText}>+</Text>
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable
            style={styles.zoomButton}
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
            <Text style={styles.zoomButtonText}>−</Text>
          </Pressable>
        </View>

        {/* Selected place info */}
        {selected && (
          <View style={styles.infoCard}>

            {loading ? (
              <ActivityIndicator
                color={colors.primary}
              />
            ) : (
              <>
                <Text style={styles.placeName}>
                  {placeName}
                </Text>

                <Text style={styles.coords}>
                  {selected.latitude.toFixed(5)},{" "}
                  {selected.longitude.toFixed(5)}
                </Text>

                <Pressable
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  testID="confirmLocationButton"
                >
                  <Text style={styles.confirmText}>
                    ✓ Confirmar local
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

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "white",
  },

  cancelText: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: 15,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  instruction: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  instructionText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  map: {
    flex: 1,
  },

  infoCard: {
    backgroundColor: "white",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },

  coords: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.md,
  },

  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  confirmText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: "35%", // Position in the lower middle third to avoid going below the selected place card at bottom.
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '400',
    lineHeight: 28,
  },
  zoomDivider: {
    width: 32,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

});

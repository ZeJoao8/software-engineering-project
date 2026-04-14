import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";

import {
  getRoute,
  type Coordinates,
  type RouteResult,
} from "../utils/routing";

import { colors, spacing } from "../styles/theme";

interface RouteMapProps {
  origin: Coordinates;
  destination: Coordinates;
  originLabel?: string;
  destinationLabel?: string;
  height?: number;
  interactive?: boolean;
}

export default function RouteMap({
  origin,
  destination,
  originLabel = "Origem",
  destinationLabel = "Destino",
  height = 250,
  interactive = false,
}: RouteMapProps) {

  const [route, setRoute] =
    useState<RouteResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      setLoading(true);
      const result = await getRoute(
        origin, destination
      );
      if (!cancelled) {
        setRoute(result);
        setLoading(false);
      }
    }

    fetchRoute();

    return () => {
      cancelled = true;
    };
  }, [
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  ]);

  const midLat =
    (origin.latitude + destination.latitude) / 2;

  const midLng =
    (origin.longitude + destination.longitude) / 2;

  const latDelta =
    Math.abs(
      origin.latitude - destination.latitude
    ) * 1.6 + 0.01;

  const lngDelta =
    Math.abs(
      origin.longitude - destination.longitude
    ) * 1.6 + 0.01;

  return (
    <View style={[styles.container, { height }]}>

      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        initialRegion={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
      >

        <Marker
          coordinate={origin}
          title={originLabel}
          pinColor={colors.primary}
        />

        <Marker
          coordinate={destination}
          title={destinationLabel}
          pinColor="#ef4444"
        />

        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}

      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
        </View>
      )}

      {route && !loading && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            📍 {route.distanceKm} km
          </Text>
          <Text style={styles.infoText}>
            ⏱ ~{route.durationMin} min
          </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },

  map: {
    flex: 1,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  infoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  infoText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

});

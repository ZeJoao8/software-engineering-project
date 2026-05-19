import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";

import ZoomControls from "./ZoomControls";

import {
  getRoute,
  type Coordinates,
  type RouteResult,
} from "../infra/routing";

import { colors } from "../styles/theme";
import { mapStyles } from "../styles/map";
import { CO2_PER_KM } from "../domain/rules/sustainability";

interface RouteMapProps {
  origin: Coordinates;
  destination: Coordinates;
  originLabel?: string;
  destinationLabel?: string;
  height?: number;
  interactive?: boolean;
  showInfoBar?: boolean;
  onRouteLoaded?: (route: RouteResult) => void;
}

export default function RouteMap({
  origin,
  destination,
  originLabel = "Origin",
  destinationLabel = "Destination",
  height = 250,
  interactive = false,
  showInfoBar = true,
  onRouteLoaded,
}: RouteMapProps) {

  const [route, setRoute] =
    useState<RouteResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const mapRef = React.useRef<MapView>(null);

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
        if (result) onRouteLoaded?.(result);
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
    <View style={[mapStyles.routeContainer, { height }]}>

      <MapView
        ref={mapRef}
        style={mapStyles.routeMap}
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
          pinColor={colors.danger}
        />

        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}

      </MapView>

      {interactive && (
        <ZoomControls
          mapRef={mapRef}
          style={{
            position: "absolute",
            right: 12,
            bottom: "35%",
          }}
        />
      )}

      {loading && (

        <View style={mapStyles.routeLoadingOverlay}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
        </View>
      )}

      {showInfoBar && route && !loading && (
        <View style={mapStyles.routeInfoBar}>
          <Text style={mapStyles.routeInfoText}>
            📍{route.distanceKm}km
          </Text>
          <Text style={mapStyles.routeInfoText}>
            ⏱~{route.durationMin}min
          </Text>
          <Text style={mapStyles.routeInfoText}>
            🌳~{(route.distanceKm * CO2_PER_KM).toFixed(2)} kgCO₂/passenger
          </Text>
        </View>
      )}

    </View>
  );
}

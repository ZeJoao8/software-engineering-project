import React, { useRef, useEffect, useState } from "react";

import { Pressable, ScrollView, Text, View } from "react-native";


import { SafeAreaView } from "react-native-safe-area-context";

import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useRouter } from "expo-router";

import { getSelectedBusRoute } from "../../data/busRoute";
import { getRoute, type Coordinates } from "../../infra/routing";
import ZoomControls from "../../components/ZoomControls";

import { components } from "../../styles/components";
import { colors, spacing, radius } from "../../styles/theme";
import { layout } from "../../styles/layout";


const TRANSIT_COLORS = ["#2563EB", "#eb8614", "#7C3AED", "#eedc3d"];

function buildLegColorMap(legs: { mode: string; lineName?: string }[]): Record<number, string> {
  const map: Record<number, string> = {};
  let colorIndex = -1;
  let lastLineName: string | undefined = undefined;
  for (let i = 0; i < legs.length; i++) {
    if (legs[i].mode.toUpperCase() === "WALK") continue;
    if (legs[i].lineName !== lastLineName) {
      colorIndex = (colorIndex + 1) % TRANSIT_COLORS.length;
      lastLineName = legs[i].lineName;
    }
    map[i] = TRANSIT_COLORS[colorIndex];
  }
  return map;
}

function modeEmoji(mode: string) {
  switch (mode.toUpperCase()) {
    case "BUS":    return "🚌";
    case "SUBWAY": return "🚇";
    case "RAIL":   return "🚆";
    case "TRAM":   return "🚃";
    case "FERRY":  return "⛴️";
    case "WALK":   return "🚶";
    default:       return "🚌";
  }
}

function modeLabel(mode: string, lineName?: string) {
  if (mode.toUpperCase() === "WALK") return "Walk";
  return lineName ? `Line ${lineName}` : mode;
}

export default function BusRouteDetail() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const selected = getSelectedBusRoute();
  const [paths, setPaths] = useState<Record<number, Coordinates[]>>({});

  useEffect(() => {
    if (!selected) return;
    
    let cancelled = false;
    async function loadPaths() {
      const newPaths: Record<number, Coordinates[]> = {};
      for (let i = 0; i < selected!.route.legs.length; i++) {
        const leg = selected!.route.legs[i];
        const res = await getRoute(leg.fromCoords, leg.toCoords);
        if (res && !cancelled) {
          newPaths[i] = res.coordinates;
        }
      }
      if (!cancelled) setPaths(newPaths);
    }
    loadPaths();

    return () => { cancelled = true; };
  }, [selected]);

  if (!selected) {

    router.back();
    return null;
  }

  const { route, origin, destination } = selected;
  const legColorMap = buildLegColorMap(route.legs);

  const allCoords = route.legs.flatMap(leg => [leg.fromCoords, leg.toCoords]);
  const lats = allCoords.map(c => c.latitude);
  const lons = allCoords.map(c => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: (maxLat - minLat) * 1.6 + 0.01,
    longitudeDelta: (maxLon - minLon) * 1.6 + 0.01,
  };

  return (
    <SafeAreaView style={layout.scrollScreen}>
      <ScrollView style={layout.scrollScreen}>

        <View style={{ padding: spacing.md }}>

          <Text style={layout.backLink} onPress={() => router.back()}>← Back</Text>

          <Text style={layout.sectionTitle}>
            {origin} → {destination}
          </Text>

          <Text style={[layout.subtitle, { marginBottom: spacing.md }]}>
            {route.departureTime} → {route.arrivalTime} · {route.durationMin} min
          </Text>

        </View>

        <View style={{ position: "relative" }}>
          <MapView
            ref={mapRef}
            style={{ height: 280, marginHorizontal: spacing.md, borderRadius: radius.md, overflow: "hidden" }}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            scrollEnabled
            zoomEnabled
            rotateEnabled={false}
            pitchEnabled={false}
          >

          {/* Origin Marker */}
          <Marker
            coordinate={route.legs[0].fromCoords}
            title={origin}
            pinColor={colors.primary}
          />

          {/* Transit Stops */}
          {route.legs
            .map((leg, i) => ({ leg, i }))
            .filter(({ leg }) => leg.mode.toUpperCase() !== "WALK")
            .map(({ leg, i }) => (
              <React.Fragment key={`bus-stops-${i}`}>
                <Marker
                  coordinate={leg.fromCoords}
                  title={leg.fromStop}
                  pinColor={legColorMap[i]}
                />
                <Marker
                  coordinate={leg.toCoords}
                  title={leg.toStop}
                  pinColor={legColorMap[i]}
                />
              </React.Fragment>
            ))}

          {/* Destination Marker */}
          <Marker
            coordinate={route.legs[route.legs.length - 1].toCoords}
            title={destination}
            pinColor={colors.danger}
          />

          {route.legs.map((leg, i) => {
            const isWalk = leg.mode.toUpperCase() === "WALK";
            return (
              <Polyline
                key={`leg-${i}`}
                coordinates={paths[i] || leg.path || [leg.fromCoords, leg.toCoords]}
                strokeColor={isWalk ? colors.textLight : legColorMap[i]}
                strokeWidth={isWalk ? 3 : 5}
                lineDashPattern={isWalk ? [6, 6] : undefined}
              />
            );
          })}


          </MapView>
          <ZoomControls
            mapRef={mapRef}
            style={{ position: "absolute", right: spacing.md + 8, top: 8 }}
          />
        </View>


        <View style={{ padding: spacing.md }}>

          {route.legs.map((leg, i) => (
            <View
              key={i}
              style={[components.card, components.legRow]}
            >
              {legColorMap[i] && (
                <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: legColorMap[i], marginRight: 2 }} />
              )}
              <Text style={{ fontSize: 22 }}>{modeEmoji(leg.mode)}</Text>

              <View style={{ flex: 1 }}>
                <Text style={layout.headingSm}>
                  {modeLabel(leg.mode, leg.lineName)}
                </Text>
                <Text style={[layout.textLightSm, { marginTop: 2 }]}>
                  {leg.fromStop === "START" ? origin : leg.fromStop} → {leg.toStop === "END" ? destination : leg.toStop}
                </Text>
              </View>

              <Text style={layout.textLightSm}>
                {leg.durationMin} min
              </Text>
            </View>
          ))}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useRouter } from "expo-router";

import { getSelectedBusRoute } from "../../data/busRoute";
import { components } from "../../styles/components";
import { colors, spacing } from "../../styles/theme";
import { layout } from "../../styles/layout";

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
  const selected = getSelectedBusRoute();

  if (!selected) {
    router.back();
    return null;
  }

  const { route, origin, destination } = selected;

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

  const transitLegs = route.legs.filter(l => l.mode.toUpperCase() !== "WALK");

  return (
    <SafeAreaView style={layout.scrollScreen}>
      <ScrollView style={layout.scrollScreen}>

        <View style={{ padding: spacing.md }}>

          <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.sm }}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>← Back</Text>
          </Pressable>

          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 2 }}>
            {origin} → {destination}
          </Text>

          <Text style={[layout.subtitle, { marginBottom: spacing.md }]}>
            {route.departureTime} → {route.arrivalTime} · {route.durationMin} min
          </Text>

        </View>

        <MapView
          style={{ height: 280, marginHorizontal: spacing.md, borderRadius: 12, overflow: "hidden" }}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          scrollEnabled
          zoomEnabled
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {transitLegs.map((leg, i) => (
            <Marker
              key={`from-${i}`}
              coordinate={leg.fromCoords}
              title={leg.fromStop}
              pinColor={colors.primary}
            />
          ))}

          {transitLegs.length > 0 && (
            <Marker
              coordinate={transitLegs[transitLegs.length - 1].toCoords}
              title={transitLegs[transitLegs.length - 1].toStop}
              pinColor={colors.danger}
            />
          )}

          {route.legs.map((leg, i) => (
            <Polyline
              key={`leg-${i}`}
              coordinates={[leg.fromCoords, leg.toCoords]}
              strokeColor={leg.mode.toUpperCase() === "WALK" ? colors.textLight : colors.primary}
              strokeWidth={leg.mode.toUpperCase() === "WALK" ? 2 : 4}
            />
          ))}
        </MapView>

        <View style={{ padding: spacing.md }}>

          {route.legs.map((leg, i) => (
            <View
              key={i}
              style={[components.card, { marginBottom: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm }]}
            >
              <Text style={{ fontSize: 22 }}>{modeEmoji(leg.mode)}</Text>

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.text }}>
                  {modeLabel(leg.mode, leg.lineName)}
                </Text>
                <Text style={{ color: colors.textLight, fontSize: 13, marginTop: 2 }}>
                  {leg.fromStop} → {leg.toStop}
                </Text>
              </View>

              <Text style={{ color: colors.textLight, fontSize: 13 }}>
                {leg.durationMin} min
              </Text>
            </View>
          ))}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { setSelectedBusRoute } from "../data/busRoute";

import { getTransitRoutes, TransitRoute } from "../utils/transitRoutes";
import type { Coordinates } from "../utils/routing";
import { components } from "../styles/components";
import { colors, spacing } from "../styles/theme";
import { layout } from "../styles/layout";

function modeEmoji(mode: string) {
  switch (mode.toUpperCase()) {
    case "BUS": return "🚌";
    case "SUBWAY": return "🚇";
    case "RAIL": return "🚆";
    case "TRAM": return "🚃";
    case "FERRY": return "⛴️";
    default: return "🚌";
  }
}

export default function BusAlternatives({
  origin,
  destination,
  originCoords,
  destinationCoords,
}: {
  origin: string;
  destination: string;
  originCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
}) {
  const router = useRouter();
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    const timer = setTimeout(() => {
      getTransitRoutes(origin, destination, originCoords, destinationCoords)
        .then(result => {
          if (!active) return;
          setRoutes(result);
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setFailed(true);
          setLoading(false);
        });
    }, 800);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [origin, destination, originCoords, destinationCoords]);

  return (
    <View>

      {loading && (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.sm }} />
      )}


      {!loading && (failed || routes.length === 0) && (
        <Text style={{ color: colors.textLight }}>
          No bus routes found for this route.
        </Text>
      )}

      {!loading && routes.length > 0 && routes.map((route, i) => (
        <Pressable
          key={i}
          onPress={() => {
            setSelectedBusRoute({ route, origin, destination });
            router.push("/busRoute");
          }}
          style={({ pressed }) => ({
            marginBottom: i < routes.length - 1 ? spacing.md : 0,
            paddingBottom: i < routes.length - 1 ? spacing.md : 0,
            borderBottomWidth: i < routes.length - 1 ? 1 : 0,
            borderBottomColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: colors.text }}>
              {route.departureTime} → {route.arrivalTime}
            </Text>
            <Text style={{ color: colors.textLight, fontSize: 13 }}>
              {route.durationMin} min
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.xs }}>
            {route.legs
              .filter(leg => leg.mode.toUpperCase() !== "WALK")
              .map((leg, j) => (
                <View
                  key={j}
                  style={{
                    backgroundColor: colors.primaryLight,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.primaryDark, fontWeight: "600" }}>
                    {modeEmoji(leg.mode)}{leg.lineName ? ` ${leg.lineName}` : ""}
                  </Text>
                </View>
              ))
            }
          </View>

          {route.legs.find(leg => leg.mode.toUpperCase() !== "WALK") && (
            <Text style={{ fontSize: 12, color: colors.textLight }}>
              📍 {route.legs.find(leg => leg.mode.toUpperCase() !== "WALK")?.fromStop}
            </Text>
          )}

        </Pressable>
      ))}

    </View>
  );
}

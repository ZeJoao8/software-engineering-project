import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
  Callout,
  PROVIDER_DEFAULT,
} from "react-native-maps";

import {
  useRouter,
  useFocusEffect,
} from "expo-router";

import { getRides, subscribeToRidesChanges } from "../../data/rides";
import { getCurrentUser } from "../../data/user";
import { formatDate } from "../../utils/date";

import {
  getRoute,
  type Coordinates,
  type RouteResult,
} from "../../utils/routing";

import { colors, spacing, radius } from "../../styles/theme";

import type { Ride } from "../../types/Ride";

import { filterRides, FilterCriteria } from "../../utils/rideFilters";
import { sortByDateAsc } from "../../utils/date";

// FEUP coordinates
const FEUP_REGION = {
  latitude: 41.1780,
  longitude: -8.5980,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapViewScreen() {

  const router = useRouter();

  const mapRef = React.useRef<MapView>(null);

  const [rides, setRides] =
    useState<Ride[]>([]);

  const [selectedRide, setSelectedRide] =
    useState<Ride | null>(null);

  const [route, setRoute] =
    useState<RouteResult | null>(null);

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [minSeats, setMinSeats] = useState("");
  const [now, setNow] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      const user = getCurrentUser();
      if (!user) return;

      const filters: FilterCriteria = {
        origin: originFilter,
        destination: destinationFilter,
        date: dateFilter,
        womenOnly: womenOnlyFilter,
        minSeats: minSeats
      };

      const filtered = sortByDateAsc(
        filterRides(getRides(), user, filters, now)
      );

      const ridesWithCoords = filtered.filter(
        r => r.originCoords && r.destinationCoords
      );

      setRides(ridesWithCoords);
      setSelectedRide(null);
      setRoute(null);
    }, [])
  );

  useEffect(() => {

  const unsubscribe =
    subscribeToRidesChanges(() => {

      const user = getCurrentUser();
      if (!user) return;

      setNow(new Date());

      const filters: FilterCriteria = {
        origin: originFilter,
        destination: destinationFilter,
        date: dateFilter,
        womenOnly: womenOnlyFilter,
        minSeats: minSeats
      };

      const filtered = sortByDateAsc(
        filterRides(getRides(), user, filters, now)
      );

      setRides(
        filtered.filter(
          r => r.originCoords && r.destinationCoords
        )
      );

    });

  return unsubscribe;

}, [
  originFilter,
  destinationFilter,
  dateFilter,
  womenOnlyFilter,
  minSeats,
  now
]);

  async function selectRide(ride: Ride) {
    setSelectedRide(ride);
    setRoute(null);

    if (ride.originCoords && ride.destinationCoords) {
      setLoadingRoute(true);
      const result = await getRoute(
        ride.originCoords,
        ride.destinationCoords
      );
      setRoute(result);
      setLoadingRoute(false);
    }
  }

  function clearSelection() {
    setSelectedRide(null);
    setRoute(null);
  }

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={FEUP_REGION}
        showsUserLocation
        showsMyLocationButton
        onPress={clearSelection}
      >

        {/* All ride markers */}
        {rides.map(ride => (
          <React.Fragment key={ride.id}>

            {ride.originCoords && (
              <Marker
                coordinate={ride.originCoords}
                pinColor={
                  selectedRide?.id === ride.id
                    ? colors.primary
                    : "#22c55e"
                }
                opacity={
                  selectedRide && selectedRide.id !== ride.id
                    ? 0.3
                    : 1
                }
                onPress={() => selectRide(ride)}
              >
                <Callout>
                  <View style={{ padding: 4, maxWidth: 180 }}>
                    <Text style={{ fontWeight: "700", fontSize: 13 }}>
                      {ride.origin}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#6b7280" }}>
                      → {ride.destination}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            )}

            {ride.destinationCoords && (
              <Marker
                coordinate={ride.destinationCoords}
                pinColor={
                  selectedRide?.id === ride.id
                    ? "#ef4444"
                    : "#f87171"
                }
                opacity={
                  selectedRide && selectedRide.id !== ride.id
                    ? 0.3
                    : 1
                }
                onPress={() => selectRide(ride)}
              />
            )}

          </React.Fragment>
        ))}

        {/* Selected ride route */}
        {route && selectedRide && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
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

      {/* Rides count badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {rides.length} boleia{rides.length !== 1 ? "s" : ""} no mapa
        </Text>
      </View>

      {/* Selected ride card */}
      {selectedRide && (
        <View style={styles.rideCard}>

          <View style={styles.cardHeader}>
            <Text style={styles.cardRoute}>
              {selectedRide.origin} → {selectedRide.destination}
            </Text>
            <Pressable onPress={clearSelection}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.cardDate}>
            {formatDate(selectedRide.departureDateTime)}
          </Text>

          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>
              {selectedRide.availableSeats} lugar{selectedRide.availableSeats !== 1 ? "es" : ""}
            </Text>

            {route && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>
                  {route.distanceKm} km
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>
                  ~{route.durationMin} min
                </Text>
              </>
            )}

            {loadingRoute && (
              <Text style={styles.metaText}>
                Calculando rota...
              </Text>
            )}

            {selectedRide.womenOnly && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={[styles.metaText, { color: colors.women }]}>
                  Women only
                </Text>
              </>
            )}
          </View>

          <Pressable
            style={styles.detailButton}
            testID="mapRideDetailButton"
            onPress={() =>
              router.push(`/ride/${selectedRide.id}`)
            }
          >
            <Text style={styles.detailButtonText}>
              Ver detalhes
            </Text>
          </Pressable>

        </View>
      )}

    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  badge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  rideCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardRoute: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },

  closeButton: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: "600",
    padding: 4,
  },

  cardDate: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 8,
  },

  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.md,
  },

  metaText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },

  metaDot: {
    color: colors.textLight,
    fontSize: 13,
  },

  detailButton: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: "center",
  },

  detailButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: "50%", 
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

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";

import * as Location from "expo-location";

import {
  useRouter,
  useFocusEffect,
} from "expo-router";

import {
  getRides,
  subscribeToRidesChanges,
} from "../../data/rides";

import { getCurrentUser } from "../../data/user";

import {
  getRoute,
  type RouteResult,
} from "../../utils/routing";

import {
  filterRides,
  FilterCriteria,
} from "../../utils/rideFilters";

import {
  sortByDateAsc,
  formatDate,
} from "../../utils/date";

import {
  colors,
  spacing,
  radius,
} from "../../styles/theme";

import type { Ride } from "../../types/Ride";


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

  const [now, setNow] =
    useState(new Date());


  // Center map on user location at launch; fall back to FEUP
  useEffect(() => {
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
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      } catch {
        // Permission denied or unavailable — stay on FEUP_REGION
      }
    })();
  }, []);


  function computeFilteredRides() {

    const user = getCurrentUser();
    if (!user) return [];

    const filters: FilterCriteria = {
      origin: "",
      destination: "",
      date: "",
      womenOnly: false,
      minSeats: "",
    };

    return sortByDateAsc(
      filterRides(
        getRides(),
        user,
        filters,
        new Date()
      )
    ).filter(
      r =>
        r.originCoords &&
        r.destinationCoords
    );

  }


  useFocusEffect(
    useCallback(() => {

      setRides(
        computeFilteredRides()
      );

      setSelectedRide(null);
      setRoute(null);

    }, [])
  );


  useEffect(() => {

    const unsubscribe =
      subscribeToRidesChanges(() => {

        setNow(new Date());

        setRides(
          computeFilteredRides()
        );

      });

    return unsubscribe;

  }, []);



  async function selectRide(ride: Ride) {

    setSelectedRide(ride);

    setRoute(null);

    if (
      ride.originCoords &&
      ride.destinationCoords
    ) {

      setLoadingRoute(true);

      const result =
        await getRoute(
          ride.originCoords,
          ride.destinationCoords
        );

      setRoute(result);

      setLoadingRoute(false);


      if (mapRef.current) {

        mapRef.current.fitToCoordinates(
          [
            ride.originCoords,
            ride.destinationCoords,
          ],
          {
            edgePadding: {
              top: 120,
              right: 60,
              bottom: 260,
              left: 60,
            },
            animated: true,
          }
        );

      }

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

        {rides.map(ride => (

          <React.Fragment key={ride.id}>

            <Marker
              coordinate={ride.originCoords!}

              pinColor={
                selectedRide?.id === ride.id
                  ? colors.primary
                  : colors.accent
              }

              opacity={
                selectedRide &&
                selectedRide.id !== ride.id
                  ? 0.35
                  : 1
              }

              onSelect={() =>
                selectRide(ride)
              }
            />


            <Marker
              coordinate={ride.destinationCoords!}

              pinColor={
                selectedRide?.id === ride.id
                  ? colors.danger
                  : colors.dangerSoft
              }

              opacity={
                selectedRide &&
                selectedRide.id !== ride.id
                  ? 0.35
                  : 1
              }

              onSelect={() =>
                selectRide(ride)
              }
            />

          </React.Fragment>

        ))}


        {route && selectedRide && (

          <Polyline
            coordinates={
              route.coordinates
            }

            strokeColor={
              colors.primary
            }

            strokeWidth={4}
          />

        )}

      </MapView>



      {/* ZOOM BUTTONS */}

      <View style={styles.zoomControls}>

        <Pressable
          style={styles.zoomButton}
          onPress={() => {

            if (!mapRef.current) return;

            mapRef.current
              .getCamera()
              .then(cam => {

                if (!cam) return;

                cam.altitude =
                  (cam.altitude ?? 10000) / 2;

                if (cam.zoom)
                  cam.zoom += 1;

                mapRef.current?.animateCamera(cam);

              });

          }}
        >

          <Text style={styles.zoomButtonText}>
            +
          </Text>

        </Pressable>


        <View style={styles.zoomDivider} />


        <Pressable
          style={styles.zoomButton}
          onPress={() => {

            if (!mapRef.current) return;

            mapRef.current
              .getCamera()
              .then(cam => {

                if (!cam) return;

                cam.altitude =
                  (cam.altitude ?? 10000) * 2;

                if (cam.zoom)
                  cam.zoom -= 1;

                mapRef.current?.animateCamera(cam);

              });

          }}
        >

          <Text style={styles.zoomButtonText}>
            −
          </Text>

        </Pressable>

      </View>



      {/* rides count */}

      <View style={styles.badge}>

        <Text style={styles.badgeText}>

          {rides.length} ride
          {rides.length !== 1 && "s"}

        </Text>

      </View>



      {selectedRide && (

        <View style={styles.rideCard}>

          <View style={styles.cardHeader}>

            <Text style={styles.cardRoute}>

              {selectedRide.origin}
              {" → "}
              {selectedRide.destination}

            </Text>

            <Pressable
              onPress={clearSelection}
            >

              <Text style={styles.closeButton}>
                ✕
              </Text>

            </Pressable>

          </View>



          <Text style={styles.cardDate}>

            {formatDate(
              selectedRide.departureDateTime
            )}

          </Text>



          <View style={styles.cardMeta}>

            <Text style={styles.metaText}>

              {selectedRide.availableSeats}
              {" seats"}

            </Text>


            {route && (

              <>

                <Text style={styles.metaDot}>
                  •
                </Text>

                <Text style={styles.metaText}>
                  {route.distanceKm} km
                </Text>

                <Text style={styles.metaDot}>
                  •
                </Text>

                <Text style={styles.metaText}>
                  ~{route.durationMin} min
                </Text>

              </>

            )}


            {loadingRoute && (

              <Text style={styles.metaText}>
                calculating route...
              </Text>

            )}


            {selectedRide.womenOnly && (

              <>
                <Text style={styles.metaDot}>
                  •
                </Text>

                <Text
                  style={[
                    styles.metaText,
                    {
                      color: colors.women,
                    },
                  ]}
                >

                  Women only

                </Text>

              </>

            )}

          </View>



          <Pressable
            style={styles.detailButton}
            testID="mapRideDetailButton"
            onPress={() =>
              router.push(
                `/ride/${selectedRide.id}`
              )
            }
          >

            <Text style={styles.detailButtonText}>
              View details
            </Text>

          </Pressable>

        </View>

      )}

    </View>

  );

}



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

    backgroundColor:
      "rgba(255,255,255,0.95)",

    paddingHorizontal: 14,
    paddingVertical: 6,

    borderRadius: 20,

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

    position: "absolute",

    right: 16,

    bottom: "50%",

    backgroundColor:
      "rgba(255,255,255,0.95)",

    borderRadius: 8,

    elevation: 4,

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: colors.border,

    alignItems: "center",

    justifyContent: "center",
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